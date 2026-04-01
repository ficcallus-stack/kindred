"use server";

import { db } from "@/db";
import { users, bookings, platformCreditTransactions } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

/**
 * Calculates and grants platform credits for a successful booking.
 * 15 credits per $1 spent.
 */
export async function grantCreditsForBooking(bookingId: string) {
  try {
    // 1. Fetch booking details
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, bookingId),
    });

    if (!booking) {
      console.warn(`[Credits] Booking ${bookingId} not found.`);
      return { success: false, error: "Booking not found" };
    }

    // 2. Idempotency check: Have we already granted credits for this booking?
    const existing = await db.query.platformCreditTransactions.findFirst({
      where: and(
        eq(platformCreditTransactions.bookingId, bookingId),
        eq(platformCreditTransactions.type, "earned_booking")
      ),
    });

    if (existing) {
      console.log(`[Credits] Credits already granted for booking ${bookingId}. Skipping.`);
      return { success: true, alreadyGranted: true };
    }

    // 3. Calculate Credits: 15 per $1 (totalAmount is in cents)
    const dollars = Math.floor(booking.totalAmount / 100);
    const creditAmount = dollars * 15;

    if (creditAmount <= 0) return { success: true, amount: 0 };

    // 4. Atomic Update: Ledger + User Balance
    await db.transaction(async (tx) => {
      // Create Ledger Entry
      await tx.insert(platformCreditTransactions).values({
        userId: booking.parentId,
        bookingId: booking.id,
        amount: creditAmount,
        type: "earned_booking",
        description: `Earned 15x credits for booking #${bookingId.slice(0, 6)}`,
      });

      // Update User Master Balance
      await tx.update(users)
        .set({ platformCredits: sql`${users.platformCredits} + ${creditAmount}` })
        .where(eq(users.id, booking.parentId));
    });

    console.log(`[Credits] Granted ${creditAmount} credits to user ${booking.parentId} for booking ${bookingId}`);
    
    revalidatePath("/dashboard/parent/wallet");
    return { success: true, amount: creditAmount };
  } catch (error) {
    console.error(`[Credits] Failed to grant credits for booking ${bookingId}:`, error);
    return { success: false, error: "Internal service error" };
  }
}

/**
 * Revokes credits previously granted for a booking (e.g. on refund/dispute).
 */
export async function revokeCreditsForBooking(bookingId: string) {
  try {
    // 1. Find exactly how many credits were earned for this booking
    const earnings = await db.query.platformCreditTransactions.findMany({
      where: and(
        eq(platformCreditTransactions.bookingId, bookingId),
        eq(platformCreditTransactions.type, "earned_booking")
      )
    });

    const totalToRevoke = earnings.reduce((sum, txn) => sum + txn.amount, 0);

    if (totalToRevoke <= 0) {
      console.log(`[Credits] No credits found to revoke for booking ${bookingId}`);
      return { success: true, amount: 0 };
    }

    // 2. Atomic Revocation
    const [booking] = await db.select({ parentId: bookings.parentId }).from(bookings).where(eq(bookings.id, bookingId)).limit(1);

    if (!booking) {
      console.error(`[Credits] Cannot revoke credits: Booking ${bookingId} parent info missing.`);
      return { success: false };
    }

    await db.transaction(async (tx) => {
      // Insert Negative Ledger Entry
      await tx.insert(platformCreditTransactions).values({
        userId: booking.parentId,
        bookingId: bookingId,
        amount: -totalToRevoke,
        type: "revoked_refund",
        description: `Credits revoked due to refund for booking #${bookingId.slice(0, 6)}`,
      });

      // Update User Master Balance
      await tx.update(users)
        .set({ platformCredits: sql`${users.platformCredits} - ${totalToRevoke}` })
        .where(eq(users.id, booking.parentId));
    });

    console.log(`[Credits] Revoked ${totalToRevoke} credits from user ${booking.parentId} for booking ${bookingId}`);
    
    revalidatePath("/dashboard/parent/wallet");
    return { success: true, revoked: totalToRevoke };
  } catch (error) {
    console.error(`[Credits] Failed to revoke credits for booking ${bookingId}:`, error);
    return { success: false, error: "Internal service error" };
  }
}
