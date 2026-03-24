"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings, payments, wallets, walletTransactions } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createBookingSchema, type CreateBookingInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { stripe } from "@/lib/stripe";

export async function createBooking(data: CreateBookingInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const { success } = rateLimit(`createBooking:${clerkUser.id}`, { limit: 5, windowSeconds: 60 });
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
      userId: clerkUser.id,
      caregiverId,
    },
  });

  // Create the booking
  const bookingId = crypto.randomUUID();
  await db.insert(bookings).values({
    id: bookingId,
    parentId: clerkUser.id,
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
    userId: clerkUser.id,
    amount: amountInCents,
    stripePaymentIntentId: paymentIntent.id,
    status: "pending",
    description: `Booking payment`,
  });

  revalidatePath("/dashboard/parent");
  revalidatePath("/dashboard/parent/bookings");

  return {
    bookingId,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function cancelBooking(bookingId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const booking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.id, bookingId),
      eq(bookings.parentId, clerkUser.id)
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
}

export async function getMyBookings() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  return db.query.bookings.findMany({
    where: eq(bookings.parentId, clerkUser.id),
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
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const booking = await db.query.bookings.findFirst({
    where: and(
      eq(bookings.id, bookingId),
      eq(bookings.parentId, clerkUser.id)
    ),
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "confirmed" && booking.status !== "in_progress") {
    throw new Error("Only confirmed or in-progress bookings can be completed");
  }

  // 1. Capture Stripe Payment
  if (booking.stripePaymentIntentId) {
    try {
      await stripe.paymentIntents.capture(booking.stripePaymentIntentId);
    } catch (e) {
      console.error("Stripe capture failed", e);
      // If already captured, we continue, otherwise we might want to block
    }
  }

  // 2. Update Booking Status
  await db.update(bookings)
    .set({ status: "completed" })
    .where(eq(bookings.id, bookingId));

  // 3. Update Payment Status
  await db.update(payments)
    .set({ status: "captured" })
    .where(eq(payments.bookingId, bookingId));

  // 4. Update Nanny's Wallet
  // Ensure wallet exists
  await db.insert(wallets)
    .values({ id: booking.caregiverId, balance: 0 })
    .onConflictDoNothing();

  // Add funds
  await db.update(wallets)
    .set({ 
      balance: sql`${wallets.balance} + ${booking.totalAmount}`,
      updatedAt: new Date(),
    })
    .where(eq(wallets.id, booking.caregiverId));

  // 5. Log Transaction
  await db.insert(walletTransactions)
    .values({
      walletId: booking.caregiverId,
      amount: booking.totalAmount,
      type: "earning",
      status: "completed",
      description: `Earnings from booking #${bookingId.slice(0, 8)}`,
    });

  revalidatePath("/dashboard/parent/bookings");
  revalidatePath("/dashboard/nanny/wallet");
  
  return { success: true };
}
