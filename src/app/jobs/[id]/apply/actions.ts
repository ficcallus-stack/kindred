"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { applications, jobs, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { sendNewApplicationEmail } from "@/lib/email";

export async function submitApplication({ jobId, message }: { jobId: string; message: string }) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`apply:${clerkUser.uid}`);
  if (!success) throw new Error("Too many requests");

  // Verify job exists
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });

  if (!job) throw new Error("Job not found");

  // Check if already applied
  const existing = await db.query.applications.findFirst({
    where: and(
      eq(applications.jobId, jobId),
      eq(applications.caregiverId, clerkUser.uid)
    ),
  });

  if (existing) throw new Error("You have already applied to this job");

  await db.insert(applications).values({
    jobId,
    caregiverId: clerkUser.uid,
    message,
    status: "pending",
  });

  // Send email notification to the parent
  try {
    const parent = await db.query.users.findFirst({ where: eq(users.id, job.parentId) });
    const nanny = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
    if (parent?.email) {
      await sendNewApplicationEmail(parent.email, parent.fullName, nanny?.fullName || "A caregiver", job.title);
    }
  } catch (e) { console.error("Email send failed:", e); }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/nanny");
  revalidatePath("/dashboard/parent/applicants");
}
