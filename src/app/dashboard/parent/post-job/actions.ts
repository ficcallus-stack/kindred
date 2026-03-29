"use server";

import crypto from "crypto";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { jobs, parentProfiles } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { createJobSchema, type CreateJobInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

import { syncUser } from "@/lib/user-sync";
import { stripe } from "@/lib/stripe";
import { sendEscrowReceiptEmail } from "@/lib/email";

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

export async function createJob(data: CreateJobInput) {
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

  // Verify Payment Intent with Stripe
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

  const title = `${duration} Care in ${location}`;
  let description = `Care requested for ${childCount} children. Requirements: ${Object.keys(certs).filter(k => certs[k]).join(", ") || "None specified"}. Duties: ${Object.keys(duties).filter(k => duties[k]).join(", ") || "None specified"}. Schedule: ${scheduleType === 'recurring' ? 'Weekly' : 'One-time dates'}.`;
  
  if (userDescription) {
    description += `\n\nAdditional Notes:\n${userDescription}`;
  }
  const budget = `$${minRate}-$${maxRate}/hr`;

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
    stripePaymentIntentId,
  });

  revalidatePath("/dashboard/parent");
  revalidatePath("/jobs");
}
