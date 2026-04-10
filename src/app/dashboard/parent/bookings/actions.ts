"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, payments, users, referrals, reviews, tickets, nannyProfiles } from "@/db/schema";
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

  const { caregiverId, jobId, startDate, endDate, hoursPerDay, totalAmount, notes, isTrial } = parsed.data;
  
  // 1. TRIAL-01: Enforcement & Pricing Logic
  let finalAmountInCents = Math.round(totalAmount * 100);
  if (isTrial) {
    // A. Check for existing trials between this pair
    const existingTrial = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.parentId, clerkUser.uid),
        eq(bookings.caregiverId, caregiverId),
        eq(bookings.isTrial, true)
      )
    });

    if (existingTrial) {
      throw new Error("You have already had a trial session with this caregiver. Please book a standard session.");
    }

    // B. Calculate "First 2 Hours Free" Discount
    const nanny = await db.query.nannyProfiles.findFirst({
      where: eq(nannyProfiles.id, caregiverId)
    });
    
    if (nanny && nanny.hourlyRate) {
      const hourlyRateCents = Math.round(parseFloat(nanny.hourlyRate) * 100);
      const discountCents = hourlyRateCents * 2;
      // Ensure we don't go below a $20 platform floor for payment processing
      finalAmountInCents = Math.max(2000, finalAmountInCents - discountCents);
      console.log(`[Trial Logic] Applied $${discountCents/100} discount. Final: $${finalAmountInCents/100}`);
    }
  }

  // Create Stripe PaymentIntent with manual capture (escrow)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: finalAmountInCents,
    currency: "usd",
    capture_method: "manual",
    description: `KindredCare ${isTrial ? 'Trial ' : ''}Booking`,
    metadata: {
      userId: clerkUser.uid,
      caregiverId,
      isTrial: isTrial ? "true" : "false",
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
    totalAmount: finalAmountInCents,
    notes,
    status: "pending",
    isTrial: isTrial || false,
    stripePaymentIntentId: paymentIntent.id,
  });

  // Create payment record
  await db.insert(payments).values({
    bookingId,
    userId: clerkUser.uid,
    amount: finalAmountInCents,
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
      await sendBookingEmail(nanny.email, nanny.fullName, "confirmed", { bookingId, amount: finalAmountInCents });
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
      const diffHours = (booking.startDate.getTime() - Date.now()) / (1000 * 60 * 60);
      const pi = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);

      if (pi.status === "requires_capture") {
        if (diffHours < 24) {
          // MON-01: Enforce 50% penalty
          const penaltyAmount = Math.round(booking.totalAmount * 0.5);
          await stripe.paymentIntents.capture(booking.stripePaymentIntentId, {
            amount_to_capture: penaltyAmount,
          });
          console.log(`[Penalty] Captured 50% ($${penaltyAmount/100}) for Booking #${bookingId}`);
        } else {
          // Full cancellation/refund
          await stripe.paymentIntents.cancel(booking.stripePaymentIntentId);
        }
      } else if (pi.status === "succeeded") {
         // If already captured, perform partial refund if under 24h
         if (diffHours < 24) {
           const refundAmount = Math.round(booking.totalAmount * 0.5);
           await stripe.refunds.create({ 
             payment_intent: booking.stripePaymentIntentId,
             amount: refundAmount // This is the amount TO REFUND (50%), keeping the other 50%
           });
         } else {
           await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
         }
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

export async function getActiveCareOverview() {
  const clerkUser = await requireUser();

  return db.query.bookings.findMany({
    where: and(
      eq(bookings.parentId, clerkUser.uid),
      sql`${bookings.status} IN ('paid', 'confirmed', 'in_progress')`
    ),
    orderBy: [desc(bookings.createdAt)],
    with: {
      caregiver: true,
    },
    limit: 5
  });
}

export async function getBookingById(id: string) {
  const clerkUser = await requireUser();

  return db.query.bookings.findFirst({
    where: and(
      eq(bookings.id, id),
      eq(bookings.parentId, clerkUser.uid)
    ),
    with: {
      caregiver: true,
      job: true
    }
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

  // 2. Finalize booking state
  await db.update(bookings)
    .set({ status: "completed" })
    .where(eq(bookings.id, bookingId));

  // 3. Clear funds (Deducts 7.5% platform fee and credits nanny wallet)
  // This centralizes financial logic and prevents revenue leakage (VULN-02)
  const { clearFundsForBooking } = await import("@/lib/financial-logic");
  await clearFundsForBooking(bookingId);

  // E. Referral Logic: Check if Parent was referred
  const parentReferral = await db.query.referrals.findFirst({
    where: and(eq(referrals.refereeId, booking.parentId), eq(referrals.status, "signed_up")),
  });
  if (parentReferral) {
    await db.update(referrals)
      .set({ status: "reviewing" })
      .where(eq(referrals.id, parentReferral.id));
  }

  // F. Referral Logic: Check if Nanny was referred
  const nannyReferral = await db.query.referrals.findFirst({
    where: and(eq(referrals.refereeId, booking.caregiverId), eq(referrals.status, "signed_up")),
  });
  if (nannyReferral) {
    await db.update(referrals)
      .set({ status: "reviewing" })
      .where(eq(referrals.id, nannyReferral.id));
  }

  revalidatePath("/dashboard/parent/bookings");
  revalidatePath("/dashboard/nanny/wallet");

  // Notify nanny about completion + earnings
  try {
    const nanny = await db.query.users.findFirst({ where: eq(users.id, booking.caregiverId) });
    if (nanny?.email) {
      await sendBookingEmail(nanny.email, nanny.fullName, "completed", { bookingId, amount: booking.totalAmount });
    }
  } catch (e) { console.error("Booking email failed:", e); }
}

/**
 * Parent Action: Rate and review a caregiver after a booking.
 */
export async function submitReviewAction(data: {
    bookingId: string;
    caregiverId: string;
    rating: number;
    comment: string;
}) {
    const user = await requireUser();

    // VULN-06 FIX: Validation & Verification
    // 1. Validate rating range
    if (data.rating < 1 || data.rating > 5) {
        throw new Error("Rating must be between 1 and 5.");
    }

    // 2. Verify booking ownership, completion, and target caregiver
    const booking = await db.query.bookings.findFirst({
        where: and(
            eq(bookings.id, data.bookingId),
            eq(bookings.parentId, user.uid),
            eq(bookings.caregiverId, data.caregiverId),
            eq(bookings.status, "completed")
        )
    });

    if (!booking) {
        throw new Error("Invalid review: You can only review completed bookings you have paid for.");
    }

    // 3. Prevent duplicate reviews
    const existingReview = await db.query.reviews.findFirst({
        where: eq(reviews.bookingId, data.bookingId)
    });

    if (existingReview) {
        throw new Error("You have already submitted a review for this booking.");
    }

    await db.insert(reviews).values({
        bookingId: data.bookingId,
        reviewerId: user.uid,
        revieweeId: data.caregiverId,
        rating: data.rating,
        comment: data.comment,
    });

    revalidatePath("/dashboard/parent/bookings");
    return { success: true };
}

/**
 * Parent Action: Report an issue regarding a specific booking.
 */
export async function reportIssueAction(data: {
    bookingId: string;
    category: string;
    description: string;
}) {
    const user = await requireUser();

    await db.insert(tickets).values({
        userId: user.uid,
        title: `Issue with Booking #${data.bookingId.slice(0, 8)}`,
        description: data.description,
        category: "safety",
        priority: "high",
        status: "open",
    });

    return { success: true };
}

/**
 * Parent Action: Manually end a shift (Emergency or oversight override).
 */
export async function endShiftAction(bookingId: string) {
    const user = await requireUser();
    
    // Use the existing completeBooking logic but for parents
    return completeBooking(bookingId);
}
