"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications, jobs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { submitApplicationSchema, type SubmitApplicationInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function submitApplication(data: SubmitApplicationInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  // Rate limit: 10 applications per minute
  const { success } = await rateLimit(`apply:${clerkUser.id}`);
  if (!success) throw new Error("Too many requests. Please try again later.");

  // Validate input
  const parsed = submitApplicationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { jobId, message } = parsed.data;

  // Verify job exists and is open
  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });
  if (!job) throw new Error("Job not found");
  if (job.status !== "open") throw new Error("This job is no longer accepting applications");

  await db.insert(applications).values({
    id: crypto.randomUUID(),
    jobId,
    caregiverId: clerkUser.id,
    message,
    status: "pending",
  });

  redirect("/dashboard/nanny");
}
