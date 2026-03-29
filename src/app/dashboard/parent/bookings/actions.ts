"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, payments, wallets, walletTransactions, users, referrals } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createBookingSchema, type CreateBookingInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";
import { sendBookingEmail } from "@/lib/email";

export async function createBooking(data: CreateBookingInput) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`createBooking:${clerkUser.uid}`, "strict");
  if (!success) throw new Error("Too many requests");

  const parsed = createBookingSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { caregiverId, jobId, startDate, endDate, hoursPerDay, totalAmount, notes } = parsed.data;
  const amountInCents = Math.round(totalAmount * 100);

  // Create Stripe PaymentIntent with manual capture (escrow)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    capture_method: "manual",
    description: `KindredCare Booking`,
    metadata: {
      userId: clerkUser.uid,
      caregiverId,
    },
  });

  // Create the booking
  const bookingId = crypto.randomUUID();
  await db.insert(bookings).values({
    id: bookingId,
    parentId: clerkUser.uid,
    caregiverId,
    jobId: jobId || null,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    hoursPerDay,
    totalAmount: amountInCents,
    notes,
    status: "pending",
    stripePaymentIntentId: paymentIntent.id,
  });

  // Create payment record
  await db.insert(payments).values({
    bookingId,
    userId: clerkUser.uid,
    amount: amountInCents,
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
    description: `Booking payment`,
  });

  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/parent/bookings");

  // Notify nanny about booking
  try {
    const nanny = await db.query.users.findFirst({ where: eq(users.id, caregiverId) });
    if (nanny?.email) {
      await sendBookingEmail(nanny.email, nanny.fullName, "confirmed", { bookingId, amount: amountInCents });
    }
  } catch (e) { console.error("Booking email failed:", e); }

  return {
    bookingId,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function cancelBooking(bookingId: string) {
  const clerkUser = await requireUser();

  const booking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.id, bookingId),
      eq(bookings.parentId, clerkUser.uid)
    ),
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status === "completed") throw new Error("Cannot cancel a completed booking");

  // Refund via Stripe if payment was captured
  if (booking.stripePaymentIntentId) {
    try {
      const pi = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);
      if (pi.status === "requires_capture") {
        await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
      } else if (pi.status === "succeeded") {
        await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
      }
    } catch (e) {
      console.error("Stripe cancellation error:", e);
    }
  }

  await db.update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, bookingId));

  await db.update(payments)
    .set({ status: "refunded" })
    .where(eq(payments.bookingId, bookingId));

  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/parent/bookings");

  // Notify nanny about cancellation
  try {
    const nanny = await db.query.users.findFirst({ where: eq(users.id, booking.caregiverId) });
    if (nanny?.email) {
      await sendBookingEmail(nanny.email, nanny.fullName, "cancelled", { bookingId, amount: booking.totalAmount });
    }
  } catch (e) { console.error("Booking email failed:", e); }
}

export async function getMyBookings() {
  const clerkUser = await requireUser();

  return db.query.bookings.findMany({
    where: eq(bookings.parentId, clerkUser.uid),
    orderBy: [desc(bookings.createdAt)],
    with: {
      caregiver: true,
    },
  });
}

/**
 * Completes a booking, capturing payment and adding funds to the nanny's wallet.
 */
export async function completeBooking(bookingId: string) {
  const clerkUser = await requireUser();

  const booking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.id, bookingId),
      eq(bookings.parentId, clerkUser.uid)
    ),
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "confirmed" && booking.status !== "in_progress") {
    throw new Error("Only confirmed or in-progress bookings can be completed");
  }

  // 1. Capture Stripe Payment (External operation, done before TX)
  if (booking.stripePaymentIntentId) {
    try {
      await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
    } catch (e) {
      console.error("Stripe capture failed", e);
    }
  }

  // 2. Perform all DB updates in one atomic transaction
  await db.transaction(async (tx) => {
    // A. Update Booking Status
    await tx.update(bookings)
      .set({ status: "completed" })
      .where(eq(bookings.id, bookingId));

    // B. Update Payment Status
    await tx.update(payments)
      .set({ status: "captured" })
      .where(eq(payments.bookingId, bookingId));

    // C. Update Nanny's Wallet
    await tx.insert(wallets)
      .values({ id: booking.caregiverId, balance: 0 })
      .onConflictDoNothing();

    await tx.update(wallets)
      .set({ 
        balance: sql`${wallets.balance} + ${booking.totalAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(wallets.id, booking.caregiverId));

    // D. Log Transaction
    await tx.insert(walletTransactions)
      .values({
        walletId: booking.caregiverId,
        amount: booking.totalAmount,
        type: "earning",
        status: "completed",
        description: `Earnings from booking #${bookingId.slice(0, 8)}`,
      });

    // E. Referral Logic: Check if Parent was referred
    const parentReferral = await tx.query.referrals.findFirst({
      where: and(eq(referrals.refereeId, booking.parentId), eq(referrals.status, "signed_up")),
    });
    if (parentReferral) {
      await tx.update(referrals)
        .set({ status: "reviewing" })
        .where(eq(referrals.id, parentReferral.id));
    }

    // F. Referral Logic: Check if Nanny was referred
    const nannyReferral = await tx.query.referrals.findFirst({
      where: and(eq(referrals.refereeId, booking.caregiverId), eq(referrals.status, "signed_up")),
    });
    if (nannyReferral) {
      await tx.update(referrals)
        .set({ status: "reviewing" })
        .where(eq(referrals.id, nannyReferral.id));
    }
  });

  revalidatePath("/dashboard/parent/bookings");
  revalidatePath("/dashboard/nanny/wallet");

  // Notify nanny about completion + earnings
  try {
    const nanny = await db.query.users.findFirst({ where: eq(users.id, booking.caregiverId) });
    if (nanny?.email) {
      await sendBookingEmail(nanny.email, nanny.fullName, "completed", { bookingId, amount: booking.totalAmount });
    }
  } catch (e) { console.error("Booking email failed:", e); }
  
  return { success: true };
}
