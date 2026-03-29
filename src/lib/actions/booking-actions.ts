"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, nannyProfiles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { createBookingSchema } from "@/lib/validations";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

/**
 * Step 1 Action: Creates a draft booking to persist schedule refinement.
 */
export async function initBookingAction(data: {
  caregiverId: string;
  startDate: string;
  endDate: string;
  refinedSchedule: any;
}) {
  const user = await requireUser();

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  
  // Calculate default total to reserve space (will be refined in Step 2)
  const [newBooking] = await db.insert(bookings).values({
    parentId: user.uid,
    caregiverId: data.caregiverId,
    startDate: start,
    endDate: end,
    hoursPerDay: 8, // Placeholder
    totalAmount: 0, // Placeholder
    refinedSchedule: data.refinedSchedule,
    status: "pending",
  }).returning();

  return { bookingId: newBooking.id };
}

/**
 * Step 2 Action: Creates the final Stripe session.
 */
export async function createFinalPaymentSession(data: {
  bookingId: string;
}) {
  const user = await requireUser();
  const origin = (await headers()).get("origin");

  // 1. Fetch Booking
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, data.bookingId),
    with: {
      caregiver: true,
      caregiverProfile: true
    }
  });

  if (!booking) throw new Error("Booking not found.");

  // 2. Ensure Stripe Customer
  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email || undefined,
      name: user.fullName || undefined,
      metadata: { userId: user.uid }
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.uid));
  }

  // 3. Calculate Final Amount (re-verify on server)
  const hourlyRate = parseFloat(booking.caregiverProfile.hourlyRate || "0");
  const diffDays = Math.ceil(Math.abs(booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const subtotal = diffDays * booking.hoursPerDay * hourlyRate * 100;
  const fee = Math.round(subtotal * 0.025);
  const total = subtotal + fee;

  // 4. Create Session
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: { 
          name: `Childcare with ${booking.caregiver.user.fullName}`,
          description: `${diffDays} days for Booking #${booking.id.slice(0,8)}`
        },
        unit_amount: total,
      },
      quantity: 1,
    }],
    success_url: `${origin}/booking/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/nannies/${booking.caregiverId}/book/schedule`,
    metadata: { bookingId: booking.id }
  });

  return { url: session.url };
}

/**
 * Nanny Action: Accept or Reject a paid booking.
 */
export async function updateBookingStatusNanny(data: {
  bookingId: string;
  action: "accept" | "reject";
}) {
  const user = await requireUser();

  // 1. Fetch and verify ownership
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, data.bookingId),
    with: { caregiver: true }
  });

  if (!booking || booking.caregiverId !== user.uid) {
    throw new Error("Unauthorized access to this booking.");
  }

  if (data.action === "accept") {
    // A. Confirm Booking
    await db.update(bookings).set({ status: "confirmed" }).where(eq(bookings.id, data.bookingId));
    
    // B. Set Nanny as Occupied
    await db.update(nannyProfiles).set({ isOccupied: true }).where(eq(nannyProfiles.id, user.uid));
    
    // C. Trigger Happy Notification (Next Step: Messaging)
    // (Actual messaging logic is already in Ably if needed)
    
  } else {
    // A. Reject Booking (Cancel)
    await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, data.bookingId));
    
    // B. Trigger Automated Refund
    if (booking.stripePaymentIntentId) {
      try {
        await stripe.refunds.create({
          payment_intent: booking.stripePaymentIntentId.startsWith("cs_") ? undefined : booking.stripePaymentIntentId,
          checkout_session: booking.stripePaymentIntentId.startsWith("cs_") ? booking.stripePaymentIntentId : undefined
        });
      } catch (refundErr: any) {
        console.error("Automated refund failed:", refundErr.message);
        // We still marked it cancelled, but Admin might need to manual refund
      }
    }
  }

  revalidatePath("/dashboard/nanny");
  revalidatePath(`/nannies/${user.uid}`);
  return { success: true };
}
