"use server";

import { db } from "@/db";
import { jobs, applications, users, nannyProfiles, bookings, payments } from "@/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { syncUser } from "@/lib/user-sync";
import { revalidatePath } from "next/cache";
import { sendApplicationStatusEmail, sendBookingEmail } from "@/lib/email";
import { getOrCreateConversation, sendMessage } from "../../messages/actions";

/**
 * Securely closes a job, hiding it from open roles and notifying all pending applicants.
 */
export async function closeJob(jobId: string) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Verify ownership
  const job = await db.query.jobs.findFirst({
    where: and(eq(jobs.id, jobId), eq(jobs.parentId, user.id)),
  });

  if (!job) {
    throw new Error("Job not found or unauthorized.");
  }

  // 2. Update job status to closed
  await db.update(jobs)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(jobs.id, jobId));

  // 3. Find all pending/active applications to notify them
  const jobApps = await db.query.applications.findMany({
    where: eq(applications.jobId, jobId),
    with: {
      caregiver: true // This is the user record
    }
  });

  // 4. Update application statuses to rejected and notify
  if (jobApps.length > 0) {
    const appIds = jobApps.map(a => a.id);
    
    await db.update(applications)
      .set({ status: "rejected" })
      .where(inArray(applications.id, appIds));

    // Send emails in background-ish (sequential for now since it's a small batch usually)
    for (const app of jobApps) {
        if (app.caregiver?.email) {
            await sendApplicationStatusEmail(
                app.caregiver.email,
                app.caregiver.fullName || "Caregiver",
                job.title || "the position",
                "rejected"
            );
        }
    }
  }

  revalidatePath("/dashboard/parent/jobs");
  revalidatePath(`/dashboard/nanny/open-roles/${jobId}`);
  revalidatePath("/dashboard/nanny/open-roles");
  
  return { success: true };
}

/**
 * Securely fetches all applications for a parent's job with enriched caregiver data.
 */
export async function getJobApplications(jobId: string) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const job = await db.query.jobs.findFirst({
    where: eq(jobs.id, jobId),
  });

  if (!job) throw new Error("Job not found");

  const isAdmin = user.role === 'admin' || user.role === 'moderator';
  if (job.parentId !== user.id && !isAdmin) {
    throw new Error("Unauthorized to view applications for this job.");
  }

  // Fetch applications with joined nanny profile data
  const apps = await db.query.applications.findMany({
    where: eq(applications.jobId, jobId),
    orderBy: (applications, { desc }) => [desc(applications.createdAt)],
    with: {
      job: true,
      caregiver: {
        with: {
          nannyProfile: true,
          reviewsReceived: true, // Fetch reviews to calculate average rating
        }
      }
    }
  });

  // Calculate average rating for each caregiver
  return apps.map(app => {
    const reviews = app.caregiver?.reviewsReceived || [];
    const avgRating = reviews.length > 0 
      ? reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length 
      : 0;
    
    return {
      ...app,
      avgRating,
      reviewCount: reviews.length
    };
  });
}

/**
 * Automates the hiring process for a specific job applicant.
 * This skips Stripe payment by using the Job's pre-paid PaymentIntent.
 */
export async function bookJobApplicant(applicationId: string) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  // 1. Fetch Application + Job + Parent Data
  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
      job: true,
      caregiver: true
    }
  });

  if (!app) throw new Error("Application not found");
  if (app.job.parentId !== user.id) throw new Error("Unauthorized");

  const job = app.job;
  const caregiver = app.caregiver;

  // 2. Create the Booking (Pre-Paid)
  const bookingId = crypto.randomUUID();
  
  // Calculate total amount in cents (if not already defined)
  const totalAmount = job.retainerBudget || (job.maxRate ? (job.maxRate * 8 * 100) : 0);

  await db.insert(bookings).values({
    id: bookingId,
    parentId: user.id,
    caregiverId: app.caregiverId,
    jobId: job.id,
    startDate: job.startDate || new Date(),
    endDate: job.startDate || new Date(), // Job usually defines start, we'll use same for one-day or update later
    hoursPerDay: 8, // Default or pulled from schedule
    totalAmount,
    status: "confirmed", // Since it's pre-paid
    stripePaymentIntentId: job.stripePaymentIntentId,
    phoneNumber: user.phoneNumber, // Auto-share phone number
  });

  // 3. Create a Payment Record (Mirroring the Job's PI)
  if (job.stripePaymentIntentId) {
    await db.insert(payments).values({
      bookingId,
      userId: user.id,
      amount: totalAmount,
      stripePaymentIntentId: job.stripePaymentIntentId,
      status: "held_in_escrow",
      description: `Hiring payment for ${job.title}`,
    });
  }

  // 4. Update Application Status
  await db.update(applications)
    .set({ status: "accepted" })
    .where(eq(applications.id, applicationId));

  // 5. Close the Job (Optional: User can decide, but usually hiring one person closes an adhoc job)
  await db.update(jobs)
    .set({ status: "closed" })
    .where(eq(jobs.id, job.id));

  // 6. Automated Messaging (The Handshake)
  try {
    const conversationId = await getOrCreateConversation(app.caregiverId);
    await sendMessage({
      conversationId,
      content: `I've officially hired you for "${job.title}"! My mobile number is ${user.phoneNumber || "not provided"}. Let's coordinate the final details here.`,
    });
  } catch (err) {
    console.error("Auto-messaging failed during hire:", err);
  }

  // 7. Notification Emails
  if (caregiver?.email) {
    await sendBookingEmail(caregiver.email, caregiver.fullName, "confirmed", { 
      bookingId, 
      amount: totalAmount 
    });
  }

  revalidatePath(`/dashboard/parent/jobs/${job.id}/applications`);
  revalidatePath("/dashboard/parent/bookings");
  
  return { success: true, bookingId };
}

/**
 * Updates an application status to 'accepted' manually (Legacy/Basic).
 */
export async function acceptApplication(applicationId: string) {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");

  const app = await db.query.applications.findFirst({
    where: eq(applications.id, applicationId),
    with: {
      job: true,
      caregiver: true
    }
  });

  if (!app) throw new Error("Application not found");
  if (app.job.parentId !== user.id) throw new Error("Unauthorized");

  await db.update(applications)
    .set({ status: "accepted" })
    .where(eq(applications.id, applicationId));

  if (app.caregiver?.email) {
    await sendApplicationStatusEmail(
      app.caregiver.email,
      app.caregiver.fullName || "Caregiver",
      app.job.title || "the position",
      "accepted"
    );
  }

  revalidatePath(`/dashboard/parent/jobs/${app.jobId}/applications`);
  return { success: true };
}
