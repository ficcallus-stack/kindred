"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { certifications, payments, certificationExams, examSubmissions, examQuestions } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { enrollCertificationSchema, type EnrollCertificationInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";
import { PaymentService } from "@/lib/payments/service";

const CERTIFICATION_PRICES: Record<string, { amount: number; name: string }> = {
  standards_program: { amount: 4500, name: "Global Care Standards Exam" }, // $45
  standards_retake: { amount: 500, name: "Exam Retake" },             // $5
  elite_bundle: { amount: 15000, name: "The Elite Nanny Bundle" },     // $150
};

export async function enrollCertification(data: EnrollCertificationInput) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`enroll:${clerkUser.uid}`, "strict");
  if (!success) throw new Error("Too many requests");

  const parsed = enrollCertificationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { type } = parsed.data;
  const priceInfo = CERTIFICATION_PRICES[type];
  if (!priceInfo) throw new Error("Invalid certification type");

  const actualType = type === 'standards_retake' ? 'standards_program' : type;

  const existingCert = await db.query.certifications.findFirst({
    where: and(
      eq(certifications.caregiverId, clerkUser.uid),
      eq(certifications.type, actualType as any)
    )
  });

  if (existingCert) {
    if (["enrolled", "completed", "active"].includes(existingCert.status)) {
       throw new Error(`You have already successfully purchased ${priceInfo.name}.`);
    }

    if (existingCert.status === "pending_payment") {
        try {
            // Find all past payment intents created for this certification type for the user
            const pastTransactions = await db.query.payments.findMany({
               where: and(
                  eq(payments.userId, clerkUser.uid),
                  eq(payments.description, priceInfo.name)
               ),
               orderBy: [desc(payments.createdAt)]
            });

            for (const txn of pastTransactions) {
                if (!txn.stripePaymentIntentId) continue;
                const pastIntent = await stripe.paymentIntents.retrieve(txn.stripePaymentIntentId);
                
                if (pastIntent.status === "succeeded") {
                    const newStatus = actualType === "registration" ? "completed" : "enrolled";
                    
                    // Recover Certification
                    await db.update(certifications)
                      .set({ status: newStatus as any, stripePaymentId: txn.stripePaymentIntentId })
                      .where(eq(certifications.id, existingCert.id));

                    // Patch Payment Row
                    await db.update(payments)
                      .set({ status: "captured" })
                      .where(eq(payments.stripePaymentIntentId, txn.stripePaymentIntentId));
                    
                    throw new Error(`Orphaned payment fully recovered! Your profile is actively verified. Please refresh the page to dismiss this modal.`);
                }
            }
        } catch (e: any) {
            if (e.message && e.message.includes("fully recovered")) {
                throw e;
            }
            // Ignore other retrieval errors
        }
    }
  }

  const certId = existingCert?.id || crypto.randomUUID();

  // Create Stripe PaymentIntent safely via PaymentService
  const { clientSecret, intentId } = await PaymentService.createIntentSafely({
    amount: priceInfo.amount,
    userId: clerkUser.uid,
    description: `KindredCare ${priceInfo.name}`,
    metadata: {
      certificationId: certId,
      type: actualType,
    },
    idempotencyKey: `cert_${clerkUser.uid}_${actualType}`
  });

  if (existingCert) {
      await db.update(certifications)
        .set({
            status: "pending_payment",
            stripePaymentId: intentId,
        })
        .where(eq(certifications.id, certId));
  } else {
      await db.insert(certifications).values({
        id: certId,
        caregiverId: clerkUser.uid,
        type: actualType as any,
        status: "pending_payment",
        stripePaymentId: intentId,
      });
  }

  revalidatePath("/dashboard/nanny/certifications");

  return {
    certificationId: certId,
    clientSecret: clientSecret,
  };
}

export async function getMyCertifications() {
  const clerkUser = await requireUser();

  const myCerts = await db.query.certifications.findMany({
    where: eq(certifications.caregiverId, clerkUser.uid),
    orderBy: [desc(certifications.createdAt)],
  });

  // Fetch last submission for exams to link to certificate
  const certsWithSubmissions = await Promise.all(myCerts.map(async (cert) => {
    if (cert.type === 'standards_program' || cert.type === 'elite_bundle') {
        const exam = await db.query.certificationExams.findFirst({
            where: eq(certificationExams.certificationType, cert.type as any)
        });
        if (exam) {
            const lastSub = await db.query.examSubmissions.findFirst({
                where: and(
                    eq(examSubmissions.examId, exam.id),
                    eq(examSubmissions.caregiverId, clerkUser.uid)
                ),
                orderBy: [desc(examSubmissions.createdAt)]
            });
            return { ...cert, lastSubmissionId: lastSub?.id, lastSubmissionStatus: lastSub?.status };
        }
    }
    return { ...cert, lastSubmissionId: null, lastSubmissionStatus: null };
  }));

  return certsWithSubmissions;
}

export async function getExamData(type: string) {
  const exam = await db.query.certificationExams.findFirst({
    where: eq(certificationExams.certificationType, type as any),
  });

  if (!exam) return null;

  const questions = await db.query.examQuestions.findMany({
    where: and(
      eq(examQuestions.examId, exam.id),
      eq(examQuestions.version, exam.version)
    ),
    orderBy: (q, { asc }) => [asc(q.page), asc(q.order)],
  });

  return { ...exam, questions };
}

export async function startExamAttempt(examId: string) {
  const clerkUser = await requireUser();

  // Verify they are enrolled/paid
  const cert = await db.query.certifications.findFirst({
    where: (c, { and, eq }) => and(
        eq(c.caregiverId, clerkUser.uid),
        eq(c.status, "enrolled")
    )
  });

  if (!cert) throw new Error("Payment required before starting exam.");

  const exam = await db.query.certificationExams.findFirst({
    where: eq(certificationExams.id, examId)
  });

  if (!exam) throw new Error("Exam not found");

  // Create submission tied to CURRENT version
  const [submission] = await db.insert(examSubmissions).values({
    examId,
    caregiverId: clerkUser.uid,
    status: "started",
    examVersion: exam.version,
    startedAt: new Date(),
  }).returning();

  return submission;
}

export async function submitExamAttempt(submissionId: string, answers: Record<string, string>) {
  const clerkUser = await requireUser();

  await db.update(examSubmissions)
      .set({
        answers,
        status: "marking",
        submittedAt: new Date(),
      })
      .where(and(eq(examSubmissions.id, submissionId), eq(examSubmissions.caregiverId, clerkUser.uid)));

  revalidatePath("/dashboard/nanny/certifications");
  return { success: true };
}

/**
 * Automatically detects and recovers "stuck" payments on mount or redirect.
 */
export async function checkPaymentStatus() {
  const clerkUser = await requireUser();

  const pendingCerts = await db.query.certifications.findMany({
    where: and(
        eq(certifications.caregiverId, clerkUser.uid),
        eq(certifications.status, "pending_payment")
    )
  });

  if (pendingCerts.length === 0) return { recovered: 0 };

  let recoveredCount = 0;

  for (const cert of pendingCerts) {
    if (!cert.stripePaymentId) continue;

    try {
        const intentId = cert.stripePaymentId.startsWith("pi_") 
            ? cert.stripePaymentId 
            : null;

        if (intentId) {
            const intent = await stripe.paymentIntents.retrieve(intentId);
            if (intent.status === "succeeded") {
                const newStatus = cert.type === "registration" ? "completed" : "enrolled";
                
                await db.update(certifications)
                    .set({ 
                        status: newStatus as any,
                        enrolledAt: new Date(), 
                    })
                    .where(eq(certifications.id, cert.id));

                recoveredCount++;
            }
        }
    } catch (e) {
        console.error(`[checkPaymentStatus] Failed for cert ${cert.id}:`, e);
    }
  }

  if (recoveredCount > 0) {
    revalidatePath("/dashboard/nanny/certifications");
  }

  return { recovered: recoveredCount };
}
