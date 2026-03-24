"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { applications, jobs, bookings, users, nannyProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";

export async function acceptApplication(applicationId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const { success } = rateLimit(`acceptApp:${clerkUser.id}`, { limit: 10, windowSeconds: 60 });
  if (!success) throw new Error("Too many requests");

  // Get the application with its job
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { job: true },
  });

  if (!app) throw new Error("Application not found");
  if (app.job.parentId !== clerkUser.id) throw new Error("Not your job posting");
  if (app.status !== "pending") throw new Error("Application is no longer pending");

  // Update application status to accepted
  await db.update(applications)
    .set({ status: "accepted" })
    .where(eq(applications.id, applicationId));

  revalidatePath("/dashboard/parent/applicants");
  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/nanny");

  return { 
    caregiverId: app.caregiverId,
    jobId: app.jobId,
    jobTitle: app.job.title,
  };
}

export async function rejectApplication(applicationId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const { success } = rateLimit(`rejectApp:${clerkUser.id}`, { limit: 10, windowSeconds: 60 });
  if (!success) throw new Error("Too many requests");

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { job: true },
  });

  if (!app) throw new Error("Application not found");
  if (app.job.parentId !== clerkUser.id) throw new Error("Not your job posting");

  await db.update(applications)
    .set({ status: "rejected" })
    .where(eq(applications.id, applicationId));

  revalidatePath("/dashboard/parent/applicants");
  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/nanny");
}

export async function getApplicantDetails(applicationId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
      job: true,
      caregiver: {
        with: {
          nannyProfile: true,
        },
      },
    },
  });

  if (!app) throw new Error("Application not found");
  if (app.job.parentId !== clerkUser.id) throw new Error("Not your job posting");

  return app;
}
