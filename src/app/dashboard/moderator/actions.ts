"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { certifications, caregiverVerifications, tickets, users, examSubmissions, examQuestions, certificationExams, auditLogs, ticketMessages, nannyProfiles } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { uploadExamSchema } from "@/lib/validations";

export async function getModeratorStats() {
  const clerkUser = await requireUser();

  const [pendingVerifications] = await db
    .select({ count: count() })
    .from(caregiverVerifications)
    .where(eq(caregiverVerifications.status, "pending"));

  const [openTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(eq(tickets.status, "open"));

  const [urgentTickets] = await db
    .select({ count: count() })
    .from(tickets)
    .where(and(eq(tickets.status, "open"), eq(tickets.priority, "urgent")));

  const [pendingExams] = await db
    .select({ count: count() })
    .from(examSubmissions)
    .where(eq(examSubmissions.status, "marking"));

  return {
    pendingVerifications: pendingVerifications.count,
    accountApprovals: pendingExams.count, 
    openTickets: openTickets.count,
    urgentItems: urgentTickets.count + pendingExams.count,
  };
}

export async function getHighPriorityQueue() {
  const clerkUser = await requireUser();

  // Primary: Premium users who are pending
  const rows = await db.select()
    .from(caregiverVerifications)
    .innerJoin(users, eq(caregiverVerifications.id, users.id))
    .leftJoin(nannyProfiles, eq(caregiverVerifications.id, nannyProfiles.id))
    .where(and(
      eq(caregiverVerifications.status, "pending"),
      eq(users.isPremium, true)
    ))
    .orderBy(desc(caregiverVerifications.createdAt))
    .limit(5);

  const urgentQueue = rows.map(r => ({
    ...r.caregiver_verifications,
    user: {
      ...r.users,
      nannyProfile: r.nanny_profiles
    }
  }));

  // Fallback: Just the oldest pending verifications if no premium
  if (urgentQueue.length === 0) {
    const fallbackRows = await db.select()
      .from(caregiverVerifications)
      .innerJoin(users, eq(caregiverVerifications.id, users.id))
      .leftJoin(nannyProfiles, eq(caregiverVerifications.id, nannyProfiles.id))
      .where(eq(caregiverVerifications.status, "pending"))
      .orderBy(desc(caregiverVerifications.createdAt))
      .limit(5);
    
    return fallbackRows.map(r => ({
      ...r.caregiver_verifications,
      user: {
        ...r.users,
        nannyProfile: r.nanny_profiles
      }
    }));
  }

  return urgentQueue;
}

export async function getPendingExams() {
  const clerkUser = await requireUser();

  return db.query.examSubmissions.findMany({
    where: eq(examSubmissions.status, "marking"),
    orderBy: [desc(examSubmissions.submittedAt)],
    with: {
      caregiver: true,
      exam: true
    }
  });
}

export async function getSubmissionDetails(submissionId: string) {
  const clerkUser = await requireUser();

  const submission = await db.query.examSubmissions.findFirst({
    where: eq(examSubmissions.id, submissionId),
    with: {
      caregiver: true,
      exam: true,
    }
  });

  if (!submission) return null;

  const questions = await db.query.examQuestions.findMany({
    where: and(
      eq(examQuestions.examId, submission.examId),
      eq(examQuestions.version, submission.examVersion)
    ),
    orderBy: (q, { asc }) => [asc(q.page), asc(q.order)],
  });

  return { ...submission, exam: { ...(submission.exam as any), questions } };
}

export async function markExamSubmission(submissionId: string, score: number, notes?: string) {
  const clerkUser = await requireUser();

  const submission = await db.query.examSubmissions.findFirst({
    where: eq(examSubmissions.id, submissionId),
    with: { exam: true }
  });

  if (!submission) throw new Error("Submission not found");

  const passed = score >= (submission.exam as any).passPercentage;

  await db.update(examSubmissions)
    .set({
      score,
      status: passed ? "passed" : "failed",
      moderatorId: clerkUser.uid,
      moderatorNotes: notes,
      markedAt: new Date(),
    })
    .where(eq(examSubmissions.id, submissionId));

  if (passed) {
    await db.update(certifications)
      .set({
        status: "completed",
        completedAt: new Date(),
      })
      .where(and(
        eq(certifications.caregiverId, submission.caregiverId),
        eq(certifications.type, (submission.exam as any).certificationType)
      ));
  }

  // AUDIT LOG
  await db.insert(auditLogs).values({
    actorId: clerkUser.uid,
    action: passed ? "PASS_EXAM" : "FAIL_EXAM",
    entityType: "exam_submission",
    entityId: submissionId,
    metadata: { score, passed, notes }
  });

  return { success: true, passed };
}

export async function updateNannyVerificationStatus(nannyId: string, status: "verified" | "rejected", notes?: string) {
  const clerkUser = await requireUser();
  const me = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
  if (me?.role !== "moderator" && me?.role !== "admin") throw new Error("Unauthorized");

  const [verification] = await db
    .select()
    .from(caregiverVerifications)
    .where(eq(caregiverVerifications.id, nannyId));
  
  const oldStatus = verification?.status || "none";

  await db.update(caregiverVerifications)
    .set({
      status, 
      adminNotes: notes,
      moderatorId: clerkUser.uid,
      updatedAt: new Date()
    })
    .where(eq(caregiverVerifications.id, nannyId));
  
  if (status === "verified") {
    await db.update(nannyProfiles).set({ isVerified: true }).where(eq(nannyProfiles.id, nannyId));
  }

  // AUDIT LOG
  await db.insert(auditLogs).values({
    actorId: clerkUser.uid,
    action: status === "verified" ? "VERIFY_NANNY" : "REJECT_NANNY",
    entityType: "caregiver_verification",
    entityId: nannyId,
    metadata: { oldStatus, newStatus: status, notes }
  });

  revalidatePath("/dashboard/moderator/verifications");
  return { success: true };
}

export async function updateTicketStatus(ticketId: string, status: "resolved" | "closed" | "in_progress", notes?: string) {
  const clerkUser = await requireUser();
  const me = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
  if (me?.role !== "moderator" && me?.role !== "admin") throw new Error("Unauthorized");

  const [ticket] = await db.select().from(tickets).where(eq(tickets.id, ticketId));
  if (!ticket) throw new Error("Ticket not found");
  
  const oldStatus = ticket.status;

  await db.update(tickets)
    .set({ 
      status, 
      moderatorId: clerkUser.uid,
      updatedAt: new Date() 
    })
    .where(eq(tickets.id, ticketId));
  
  if (notes) {
    await db.insert(ticketMessages).values({
      ticketId,
      senderId: clerkUser.uid,
      content: notes,
      isInternal: true
    });
  }

  // AUDIT LOG
  await db.insert(auditLogs).values({
    actorId: clerkUser.uid,
    action: "UPDATE_TICKET_STATUS",
    entityType: "ticket",
    entityId: ticketId,
    metadata: { oldStatus, newStatus: status, notes }
  });

  revalidatePath("/dashboard/moderator");
  return { success: true };
}

export async function getRecentActivity() {
  const clerkUser = await requireUser();

  const logs = await db.query.auditLogs.findMany({
    orderBy: [desc(auditLogs.createdAt)],
    limit: 10,
    with: {
      actor: true,
    }
  });

  return logs.map(log => ({
    id: log.id,
    type: log.action.toLowerCase(),
    title: log.action.replace(/_/g, " "),
    description: `Moderator ${(log.actor as any)?.fullName} performed ${log.action} on ${log.entityType} (${log.entityId})`,
    timestamp: log.createdAt,
  }));
}

export async function uploadExamJson(data: any) {
  const clerkUser = await requireUser();
  // Authorization check (already handled by requireUser if role is mod/admin)
  // But let's be explicit
  const me = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
  if (me?.role !== "moderator" && me?.role !== "admin") throw new Error("Unauthorized");

  const parsed = uploadExamSchema.parse(data);
  const totalMarks = parsed.questions.reduce((sum, q) => sum + q.marks, 0);

  // Check if exam exists
  const existingExam = await db.query.certificationExams.findFirst({
    where: eq(certificationExams.certificationType, parsed.certificationType as any)
  });

  const nextVersion = existingExam ? existingExam.version + 1 : 1;
  const examId = existingExam?.id || crypto.randomUUID();

  await db.transaction(async (tx) => {
    // 1. Update or Insert Exam row
    if (existingExam) {
      await tx.update(certificationExams)
        .set({
          title: parsed.title,
          description: parsed.description,
          passPercentage: parsed.passPercentage,
          timeLimit: parsed.timeLimit,
          price: parsed.price,
          retakePrice: parsed.retakePrice,
          totalMarks,
          version: nextVersion,
        })
        .where(eq(certificationExams.id, examId));
    } else {
      await tx.insert(certificationExams).values({
        id: examId,
        certificationType: parsed.certificationType as any,
        title: parsed.title,
        description: parsed.description,
        passPercentage: parsed.passPercentage,
        timeLimit: parsed.timeLimit,
        price: parsed.price,
        retakePrice: parsed.retakePrice,
        totalMarks,
        version: nextVersion,
      });
    }

    // 2. Insert NEW questions for this version
    // We don't delete old version questions so past submissions still reference them
    const questionValues = parsed.questions.map(q => ({
      examId,
      text: q.text,
      marks: q.marks,
      page: q.page,
      order: q.order,
      version: nextVersion,
    }));

    await tx.insert(examQuestions).values(questionValues);
  });

  revalidatePath("/dashboard/nanny/certifications");
  return { success: true, version: nextVersion };
}
