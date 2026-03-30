"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { applications, jobs, bookings, users, nannyProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { rateLimit } from "@/lib/rate-limit";
import { sendApplicationStatusEmail } from "@/lib/email";

export async function acceptApplication(applicationId: string) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`acceptApp:${clerkUser.uid}`);
  if (!success) throw new Error("Too many requests");

  // Get the application with its job
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { job: true },
  });

  if (!app) throw new Error("Application not found");
  if (!(app as any).job || (app as any).job.parentId !== clerkUser.uid) throw new Error("Not your job posting");
  if (app.status !== "pending") throw new Error("Application is no longer pending");

  // Update application status to accepted
  await db.update(applications)
    .set({ status: "accepted" })
    .where(eq(applications.id, applicationId));

  // Notify nanny via email
  try {
    const nanny = await db.query.users.findFirst({ where: eq(users.id, app.caregiverId) });
    if (nanny?.email) {
      await sendApplicationStatusEmail(nanny.email, nanny.fullName, (app.job as any).title, "accepted");
    }
  } catch (e) { console.error("Email send failed:", e); }

  revalidatePath("/dashboard/parent/applicants");
  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/nanny");

  return { 
    caregiverId: app.caregiverId,
    jobId: app.jobId,
    jobTitle: (app.job as any).title,
  };
}

export async function rejectApplication(applicationId: string) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`rejectApp:${clerkUser.uid}`);
  if (!success) throw new Error("Too many requests");

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: { job: true },
  });

  if (!app) throw new Error("Application not found");
  if (!(app as any).job || (app as any).job.parentId !== clerkUser.uid) throw new Error("Not your job posting");

  await db.update(applications)
    .set({ status: "rejected" })
    .where(eq(applications.id, applicationId));

  // Notify nanny via email
  try {
    const nanny = await db.query.users.findFirst({ where: eq(users.id, app.caregiverId) });
    if (nanny?.email) {
      await sendApplicationStatusEmail(nanny.email, nanny.fullName, (app.job as any).title, "rejected");
    }
  } catch (e) { console.error("Email send failed:", e); }

  revalidatePath("/dashboard/parent/applicants");
  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/nanny");
}

export async function getApplicantDetails(applicationId: string) {
  const clerkUser = await requireUser();

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
  if (!(app as any).job || (app as any).job.parentId !== clerkUser.uid) throw new Error("Not your job posting");

  return app;
}
