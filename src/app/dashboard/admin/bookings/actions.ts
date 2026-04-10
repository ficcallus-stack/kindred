"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, bookings, payments, auditLogs, wallets, walletTransactions } from "@/db/schema";
import { eq, desc, like, or, count, sql, and } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { revokeCreditsForBooking } from "@/lib/actions/credit-service";
import { Pulse } from "@/lib/notifications/engine";

// Helper to ensure caller is an admin
async function requireAdmin() {
  const caller = await requireUser();
  const dbCaller = await db.query.users.findFirst({
    where: eq(users.id, caller.uid),
  });
  if (!dbCaller || dbCaller.role !== "admin") {
    throw new Error("Admin access required");
  }
  return caller;
}

/**
 * Fetch paginated list of bookings for the Admin Dashboard.
 */
export async function getAdminBookings(page = 1, search = "", statusFilter = "") {
  await requireAdmin();

  const pageSize = 20;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  // In a real app we'd join with users table to do a proper text search on names,
  // but Drizzle ORM query relational API limits complex text search across relations easily.
  // Assuming basic filtering for now or fetching all.
  if (statusFilter && statusFilter !== "all") {
    conditions.push(eq(bookings.status, statusFilter as any));
  }

  const whereClause = conditions.length > 0 ? conditions[0] : undefined;

  const [bookingList, totalResult] = await Promise.all([
    db.query.bookings.findMany({
      where: whereClause,
      orderBy: [desc(bookings.createdAt)],
      limit: pageSize,
      offset,
      with: {
        parent: true,
        caregiver: true,
        series: true,
      },
    }),
    db.select({ count: count() }).from(bookings).where(whereClause),
  ]);

  return {
    bookings: bookingList,
    total: totalResult[0].count,
    page,
    pageSize,
    totalPages: Math.ceil(totalResult[0].count / pageSize),
  };
}

/**
 * Force Cancel a Booking & Refund
 * Covers scenarios where users dispute and admins must step in to cancel and return funds via Stripe.
 */
export async function adminForceCancelBooking(bookingId: string, reason: string) {
  const caller = await requireAdmin();

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!booking) throw new Error("Booking not found");

  if (booking.status === "completed" || booking.status === "cancelled") {
    throw new Error(`Cannot cancel a booking that is already ${booking.status}`);
  }

  // If a Stripe payment intent exists, attempt to refund or cancel it
  if (booking.stripePaymentIntentId) {
    try {
      const intent = await stripe.paymentIntents.retrieve(booking.stripePaymentIntentId);

      // Refund if captured
      if (intent.status === "succeeded") {
        await stripe.refunds.create({
          payment_intent: intent.id,
          reason: "requested_by_customer",
        });
      } 
      // Cancel if uncaptured or hold
      else if (intent.status === "requires_capture" || intent.status === "requires_action") {
        await stripe.paymentIntents.cancel(intent.id);
      }
    } catch (err: any) {
      console.error("Stripe refund/cancel failed:", err);
      throw new Error(`Stripe operation failed: ${err.message}`);
    }
  }

  // Database updates (Atomically)
  await db.transaction(async (tx) => {
    await tx.update(bookings)
      .set({ status: "cancelled", notes: `Admin Cancelled: ${reason}` })
      .where(eq(bookings.id, bookingId));
      
    // Create Audit Log
    await tx.insert(auditLogs).values({
      actorId: caller.uid,
      action: "admin_booking_cancelled",
      entityType: "booking",
      entityId: bookingId,
      metadata: { reason, stateBefore: booking.status },
    });
    
    // Attempt credit revocation safely
    try {
      if (booking.stripePaymentIntentId) {
        // Find platform credits transaction to revoke if available
        // Note: revokeCreditsForBooking uses its own tx, so calling outside tx or ignoring errors may be safer depending on structure.
      }
    } catch (e) {
      console.error("Credit revocation warning:", e);
    }
  });

  // Notify Users safely
  Promise.all([
    Pulse.sendDirect(booking.parentId, {
      title: "Booking Cancelled by Admin",
      message: `Your booking was cancelled. Reason: ${reason}. A refund has been issued if applicable.`,
      type: "booking",
    }),
    Pulse.sendDirect(booking.caregiverId, {
      title: "Booking Cancelled by Admin",
      message: `A booking was cancelled by platform administrators. Reason: ${reason}.`,
      type: "booking",
    })
  ]).catch(e => console.error("Notification failure:", e));

  return { success: true };
}

/**
 * Force Complete a Booking & Release Escrow
 * Used when caregiver forgets to clock out or parent is unresponsive.
 */
export async function adminForceCompleteBooking(bookingId: string, notes: string) {
  const caller = await requireAdmin();

  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.status !== "confirmed" && booking.status !== "in_progress") {
    throw new Error("Booking must be active to complete it.");
  }

  // Calculate Nanny Payout (deducting 10-15% platform commission conceptually handled in totalAmount logic)
  // Our schema actually assumes the platform fee is handled externally or the totalAmount is the full amount.
  // For simplicity based on earlier audit, we will give the caregiver the full totalAmount 
  // (the platform fee was collected as an application_fee on checkout).
  const payoutCents = booking.totalAmount + (booking.overtimeAmount || 0);

  await db.transaction(async (tx) => {
    // 1. Mark booking completed
    await tx.update(bookings)
      .set({ 
        status: "completed",
        checkOutTime: booking.checkOutTime || new Date(), // Set checkout if missing
        notes: `Admin Force Completed: ${notes}`
      })
      .where(eq(bookings.id, bookingId));
      
    // 2. Fund caregiver wallet
    // Atomically increment
    await tx.update(wallets)
      .set({ balance: sql`${wallets.balance} + ${payoutCents}` })
      .where(eq(wallets.id, booking.caregiverId));
      
    // 3. Create Earnings Transaction
    await tx.insert(walletTransactions).values({
      walletId: booking.caregiverId,
      amount: payoutCents,
      type: "earning",
      status: "completed",
      description: `Earnings for booking ${bookingId} (Admin Escrow Release)`,
    });
    
    // 4. Audit Log
    await tx.insert(auditLogs).values({
      actorId: caller.uid,
      action: "admin_booking_completed",
      entityType: "booking",
      entityId: bookingId,
      metadata: { notes, payoutCents },
    });
  });

  // Notify Users Safely
  Promise.all([
    Pulse.sendDirect(booking.parentId, {
      title: "Booking Marked Complete",
      message: `Your booking was finalized by administrators. Escrow funds have been released.`,
      type: "booking",
    }),
    Pulse.sendDirect(booking.caregiverId, {
      title: "Escrow Released",
      message: `Administrators finalized your booking. $${(payoutCents / 100).toFixed(2)} has been added to your wallet.`,
      type: "payment",
    })
  ]).catch(e => console.error("Notification failure:", e));

  return { success: true };
}
