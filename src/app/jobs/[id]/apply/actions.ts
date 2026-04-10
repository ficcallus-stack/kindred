"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { applications, jobs, users } from "@/db/schema";
import { Pulse } from "@/lib/notifications/engine";
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
    with: { parent: true }
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

  // 🔔 Trigger Kindred Pulse
  try {
    const nanny = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
    await Pulse.sendDirect(job.parentId, {
      title: "New Application Received! 📄",
      message: `${nanny?.fullName || "A caregiver"} just applied for: ${job.title}. Tap to review.`,
      type: "application",
      linkUrl: "/dashboard/parent/applicants",
      priority: "normal"
    });
    
    // Existing Email notification
    if (job.parent?.email) {
      await sendNewApplicationEmail(job.parent.email, job.parent.fullName, nanny?.fullName || "A caregiver", job.title);
    }
  } catch (e) { 
    console.error("Pulse application notify failed:", e); 
  }

  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/dashboard/nanny");
  revalidatePath("/dashboard/parent/applicants");
}
