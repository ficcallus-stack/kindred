"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, tickets, payments, wallets, walletTransactions, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";

/**
 * ADM-DISP-01: Resolves a formal dispute.
 * Mediated by a Moderator/Admin to settle funds between Parent and Caregiver.
 */
export async function resolveDisputeAction(data: {
  bookingId: string;
  ticketId: string;
  resolution: "payout_full" | "refund_full" | "split_settlement";
  partialRefundAmount?: number; // in dollars
  moderatorNotes: string;
}) {
  const clerkUser = await requireUser();
  const userRecord = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });

  if (userRecord?.role !== "admin" && userRecord?.role !== "moderator") {
     throw new Error("Unauthorized: Only moderators can resolve disputes.");
  }

  const { bookingId, ticketId, resolution, partialRefundAmount, moderatorNotes } = data;

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "disputed") throw new Error("Booking is not in disputed state.");

  const piId = booking.stripePaymentIntentId;

  try {
    if (resolution === "refund_full") {
      // 1. Full Refund to Parent
      if (piId) {
        // If not captured, cancel PI. If captured, refund.
        const pi = await stripe.paymentIntents.retrieve(piId);
        if (pi.status === "requires_capture") {
          await stripe.paymentIntents.cancel(piId);
        } else {
          await stripe.refunds.create({ payment_intent: piId });
        }
      }
      
      await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, bookingId));
      await db.update(payments).set({ status: "refunded" }).where(eq(payments.bookingId, bookingId));

    } else if (resolution === "payout_full") {
      // 2. Full Payout to Caregiver
      if (piId) {
        const pi = await stripe.paymentIntents.retrieve(piId);
        if (pi.status === "requires_capture") {
          await stripe.paymentIntents.capture(piId);
        }
      }
      
      await db.update(bookings).set({ status: "completed" }).where(eq(bookings.id, bookingId));
      await db.update(payments).set({ status: "captured" }).where(eq(payments.bookingId, bookingId));
      
      // Note: Financial logic 'clearFundsForBooking' should be triggered here manually 
      // or handled by the settlement engine to move funds to Nanny wallet.

    } else if (resolution === "split_settlement") {
      // 3. Partial Split (The "50-50" scenario)
      if (!partialRefundAmount) throw new Error("Partial refund amount is required for split settlement.");
      const refundCents = Math.round(partialRefundAmount * 100);
      
      if (piId) {
        const pi = await stripe.paymentIntents.retrieve(piId);
        if (pi.status === "requires_capture") {
          // Capture total first, then refund partial
          await stripe.paymentIntents.capture(piId);
        }
        await stripe.refunds.create({ 
            payment_intent: piId, 
            amount: refundCents 
        });
      }

      await db.update(bookings).set({ status: "completed" }).where(eq(bookings.id, bookingId));
      await db.update(payments).set({ status: "captured" }).where(eq(payments.bookingId, bookingId));
    }

    // 4. Close the Ticket
    await db.update(tickets)
      .set({ 
          status: "resolved", 
          moderatorId: clerkUser.uid,
          updatedAt: new Date() 
      })
      .where(eq(tickets.id, ticketId));

    revalidatePath("/dashboard/admin/disputes");
    revalidatePath("/dashboard/parent/bookings");
    
    return { success: true };

  } catch (error: any) {
    console.error("[Dispute Resolution Error]", error);
    throw new Error(`Resolution failed: ${error.message}`);
  }
}
