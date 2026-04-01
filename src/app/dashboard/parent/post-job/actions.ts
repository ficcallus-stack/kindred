"use server";

import crypto from "crypto";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { jobs, parentProfiles } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { createJobSchema, type CreateJobInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

import { syncUser } from "@/lib/user-sync";
import { stripe } from "@/lib/stripe";
import { sendEscrowReceiptEmail } from "@/lib/email";
import { users } from "@/db/schema";

export async function checkIsPremium() {
  const serverUser = await requireUser();
  const [user] = await db.select().from(users).where(eq(users.id, serverUser.uid)).limit(1);
  return !!user?.isPremium;
}

export async function getPaymentIntentStatus(paymentIntentId: string) {
  const user = await requireUser();
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return {
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100, // convert to dollars
      currency: paymentIntent.currency,
      id: paymentIntent.id
    };
  } catch (err: any) {
    console.error("Error retrieving payment intent:", err.message);
    throw new Error("Could not retrieve payment information.");
  }
}

export async function sendReceiptEmail(details: { amount: number; hours: number; rate: number; fee: number; transactionId: string }) {
  const user = await requireUser();
  
  // Fetch family name from DB since Firebase Admin session doesn't store it
  const profile = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.id, user.uid)
  });
  
  const userName = profile?.familyName || "Kindred Parent";
  const userEmail = user.email || "";

  if (!userEmail) throw new Error("Could not find user email for receipt delivery.");

  const result = await sendEscrowReceiptEmail(userEmail, userName, details);
  if (!result.success) throw new Error(result.error);
  return { success: true };
}

export async function getLatestJobDraft() {
  const user = await requireUser();
  const draft = await db.query.jobs.findFirst({
    where: (jobs, { and, eq }) => and(eq(jobs.parentId, user.uid), eq(jobs.isDraft, true)),
    orderBy: (jobs, { desc }) => [desc(jobs.createdAt)]
  });
  return draft;
}

export async function upsertJobDraft(data: any) {
  const user = await requireUser();
  
  // Clean the data - only take what's relevant to jobs table
  const { location, duration, childCount, minRate, maxRate, certs, duties, description, scheduleType, schedule, specificDates, isFeatured, isBoosted } = data;

  // Check if active draft exists
  const existingDraft = await getLatestJobDraft();

  const title = duration ? `${duration} Care in ${location || 'Pending Location'}` : "New Job Draft";
  const budget = `$${minRate || 20}-$${maxRate || 30}/hr`;

  if (existingDraft) {
    await db.update(jobs).set({
      location: location || existingDraft.location,
      duration: duration || existingDraft.duration,
      childCount: childCount || existingDraft.childCount,
      minRate: minRate || existingDraft.minRate,
      maxRate: maxRate || existingDraft.maxRate,
      description: description || existingDraft.description,
      scheduleType: scheduleType || existingDraft.scheduleType,
      schedule: schedule || existingDraft.schedule,
      specificDates: specificDates || existingDraft.specificDates,
      isFeatured: isFeatured !== undefined ? isFeatured : existingDraft.isFeatured,
      isBoosted: isBoosted !== undefined ? isBoosted : existingDraft.isBoosted,
      title,
      budget,
      updatedAt: new Date(),
    }).where(eq(jobs.id, existingDraft.id));
    return { id: existingDraft.id };
  } else {
    const newId = crypto.randomUUID();
    await db.insert(jobs).values({
      id: newId,
      parentId: user.uid,
      title,
      description: description || "",
      budget,
      minRate: minRate || 20,
      maxRate: maxRate || 30,
      status: "open",
      isDraft: true,
      scheduleType: scheduleType || "recurring",
      schedule: schedule || {},
      specificDates: specificDates || [],
      isFeatured: isFeatured || false,
      isBoosted: isBoosted || false,
    });
    return { id: newId };
  }
}

export async function deleteJobDraft() {
  const user = await requireUser();
  await db.delete(jobs).where(and(eq(jobs.parentId, user.uid), eq(jobs.isDraft, true)));
}

export async function createJob(data: CreateJobInput & { isFeatured?: boolean; isBoosted?: boolean }) {
  const user = await requireUser();

  console.log(`[createJob] Starting for user ${user.uid}. Intent: ${data.stripePaymentIntentId}`);

  await syncUser();

  // Rate limit: 5 jobs per minute per user
  const { success } = await rateLimit(`createJob:${user.uid}`, "strict");
  if (!success) throw new Error("Too many requests. Please try again later.");

  // Validate input
  const parsed = createJobSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { location, duration, childCount, minRate, maxRate, certs, duties, description: userDescription, stripePaymentIntentId, scheduleType, schedule, specificDates } = parsed.data;

  const [dbUser] = await db.select().from(users).where(eq(users.id, user.uid)).limit(1);
  const isPremium = dbUser?.isPremium;

  // Verify Payment Intent with Stripe ONLY if not Premium
  if (!isPremium) {
    if (!stripePaymentIntentId) throw new Error("Payment authorization required for non-premium accounts.");
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
      console.log(`[createJob] Stripe Intent Status: ${paymentIntent.status}, Amount: ${paymentIntent.amount}`);

      if (paymentIntent.status === "requires_payment_method") {
        throw new Error("Your payment authorization is incomplete or mismatched. Please return to Step 4 (Payment) to re-authorize the correct amount.");
      }

      if (!['requires_capture', 'succeeded', 'processing'].includes(paymentIntent.status)) {
        throw new Error(`Payment verification failed: Status "${paymentIntent.status}" is not valid for posting a job.`);
      }
    } catch (err: any) {
      console.error("[createJob] Stripe Verification Error:", err.message, err.stack);
      throw new Error(`Escrow verification failed: ${err.message}. If you were already charged, please go back to Step 4 to sync your authorized payment.`);
    }
  }

  const title = `${duration} Care in ${location}`;
  let description = `Care requested for ${childCount} children. Requirements: ${Object.keys(certs).filter(k => certs[k]).join(", ") || "None specified"}. Duties: ${Object.keys(duties).filter(k => duties[k]).join(", ") || "None specified"}. Schedule: ${scheduleType === 'recurring' ? 'Weekly' : 'One-time dates'}.`;
  
  if (userDescription) {
    description += `\n\nAdditional Notes:\n${userDescription}`;
  }
  const budget = `$${minRate}-$${maxRate}/hr`;

  // Try to find existing draft to update instead of fresh insert
  const draft = await getLatestJobDraft();

  if (draft) {
    await db.update(jobs).set({
      title,
      description,
      budget,
      minRate,
      maxRate,
      status: "open",
      scheduleType,
      schedule,
      specificDates,
      stripePaymentIntentId: isPremium ? null : stripePaymentIntentId,
      isFeatured: data.isFeatured || false,
      isBoosted: data.isBoosted || false,
      isDraft: false,
      createdAt: new Date(),
    }).where(eq(jobs.id, draft.id));
  } else {
    await db.insert(jobs).values({
      id: crypto.randomUUID(),
      parentId: user.uid,
      title,
      description,
      budget,
      minRate,
      maxRate,
      status: "open",
      scheduleType,
      schedule,
      specificDates,
      stripePaymentIntentId: isPremium ? null : stripePaymentIntentId,
      isFeatured: data.isFeatured || false,
      isBoosted: data.isBoosted || false,
      isDraft: false,
    });
  }

  revalidatePath("/dashboard/parent");
  revalidatePath("/jobs");
}
