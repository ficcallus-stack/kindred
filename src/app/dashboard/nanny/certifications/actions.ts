"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { certifications, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { enrollCertificationSchema, type EnrollCertificationInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";

const CERTIFICATION_PRICES: Record<string, { amount: number; name: string }> = {
  registration: { amount: 6500, name: "Registration Fee" },           // $65
  elite_bundle: { amount: 20900, name: "Elite Bundle" },              // $209
  standards_program: { amount: 17500, name: "Standards Program" },    // $175
};

export async function enrollCertification(data: EnrollCertificationInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const { success } = await rateLimit(`enroll:${clerkUser.id}`, "strict");
  if (!success) throw new Error("Too many requests");

  const parsed = enrollCertificationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { type } = parsed.data;
  const priceInfo = CERTIFICATION_PRICES[type];
  if (!priceInfo) throw new Error("Invalid certification type");

  // Create certification record
  const certId = crypto.randomUUID();

  // Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: priceInfo.amount,
    currency: "usd",
    description: `KindredCare ${priceInfo.name}`,
    metadata: {
      userId: clerkUser.id,
      certificationId: certId,
      type,
    },
  });

  await db.insert(certifications).values({
    id: certId,
    caregiverId: clerkUser.id,
    type: type as any,
    status: "pending_payment",
    stripePaymentId: paymentIntent.id,
  });

  // Create payment record
  await db.insert(payments).values({
    userId: clerkUser.id,
    amount: priceInfo.amount,
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
    description: priceInfo.name,
  });

  revalidatePath("/dashboard/nanny/certifications");

  return {
    certificationId: certId,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function getMyCertifications() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  return db.query.certifications.findMany({
    where: eq(certifications.caregiverId, clerkUser.id),
    orderBy: [desc(certifications.createdAt)],
  });
}
