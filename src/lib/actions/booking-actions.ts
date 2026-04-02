"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, nannyProfiles, users } from "@/db/schema";
import { eq as eqOp } from "drizzle-orm";
import { eq, and } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { createBookingSchema } from "@/lib/validations";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { PaymentService } from "@/lib/payments/service";

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
  
  // Calculate hours and estimated total from caregiver's hourly rate
  const caregiverProfile = await db.query.nannyProfiles.findFirst({
    where: eqOp(nannyProfiles.id, data.caregiverId),
  });
  const hourlyRate = parseFloat(caregiverProfile?.hourlyRate || "0");
  const diffDays = Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
  const hoursPerDay = data.refinedSchedule?.hoursPerDay || 8;
  const estimatedTotal = Math.round(diffDays * hoursPerDay * hourlyRate * 100); // cents

  const [newBooking] = await db.insert(bookings).values({
    parentId: user.uid,
    caregiverId: data.caregiverId,
    startDate: start,
    endDate: end,
    hoursPerDay,
    totalAmount: estimatedTotal,
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
  const serverUser = await requireUser();
  const [user] = await db.select().from(users).where(eq(users.id, serverUser.uid)).limit(1);
  if (!user) throw new Error("User record not found.");
  
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
      metadata: { userId: user.id }
    });
    customerId = customer.id;
    await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, user.id));
  }

  // 3. Calculate Final Amount (re-verify on server)
  const hourlyRate = parseFloat((booking.caregiverProfile as any).hourlyRate || "0");
  const diffDays = Math.ceil(Math.abs(booking.endDate.getTime() - booking.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const subtotal = diffDays * booking.hoursPerDay * hourlyRate * 100;
  
  // Fee Logic
  const parentFee = user.isPremium ? 0 : Math.round(subtotal * 0.025); // 2.5% waived for premium
  const nannyCommission = Math.round(subtotal * 0.15); // 15% platform take from nanny

  const parentTotal = subtotal + parentFee;

  // 4. Create Session via Centralized Service
  const session = await PaymentService.createCheckoutSessionSafely({
    customerId,
    amount: parentTotal,
    applicationFeeAmount: parentFee + nannyCommission,
    name: `Childcare with ${(booking.caregiver as any).user.fullName}`,
    description: `${diffDays} days for Booking #${booking.id.slice(0,8)}`,
    successUrl: `${origin}/booking/success?booking_id=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/nannies/${booking.caregiverId}/book/schedule`,
    metadata: { bookingId: booking.id },
    idempotencyKey: `booking_${booking.id}` // Prevent double-billing
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
        } as any);
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

/**
 * Nanny Action: Clock-in to a shift.
 */
export async function clockInAction(bookingId: string) {
    const user = await requireUser();
    
    const [booking] = await db.update(bookings)
        .set({ checkInTime: new Date() })
        .where(and(eq(bookings.id, bookingId), eq(bookings.caregiverId, user.uid)))
        .returning();

    if (!booking) throw new Error("Booking not found or unauthorized.");

    // Trigger Ably event for Parent
    // We'll use a server-side publish if possible, or expect client to publish
    // For now, let's just return success and let the client-side Presence handle it
    
    revalidatePath("/dashboard/nanny");
    revalidatePath("/dashboard/parent");
    return { success: true, checkInTime: booking.checkInTime };
}

/**
 * Nanny Action: Clock-out from a shift.
 */
export async function clockOutAction(bookingId: string) {
    const user = await requireUser();
    
    const [booking] = await db.update(bookings)
        .set({ checkOutTime: new Date() })
        .where(and(eq(bookings.id, bookingId), eq(bookings.caregiverId, user.uid)))
        .returning();

    if (!booking) throw new Error("Booking not found or unauthorized.");

    // Stage 3 logic: Automated Overtime calculation
    const { processBookingOvertime } = await import("@/lib/financial-logic");
    await processBookingOvertime(bookingId);

    revalidatePath("/dashboard/nanny");
    revalidatePath("/dashboard/parent");
    return { success: true, checkOutTime: booking.checkOutTime };
}
