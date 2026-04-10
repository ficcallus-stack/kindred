import { db } from "@/db";
import { wallets, walletTransactions, bookings, nannyProfiles } from "@/db/schema";
import { eq, sql, and, gte, lte } from "drizzle-orm";
import { differenceInMinutes } from "date-fns";

/**
 * Calculates the split for a booking.
 * Returns the net amount for the caregiver and the platform fee.
 */
export function getBookingFinancialBreakdown(totalAmountCents: number) {
  // Total = Subtotal * 1.075
  // Subtotal = Total / 1.075
  const subtotalCents = Math.round(totalAmountCents / 1.075);
  const platformFeeCents = totalAmountCents - subtotalCents;

  return {
    caregiverNet: subtotalCents,
    platformFee: platformFeeCents,
  };
}

/**
 * Stage 1: Hold funds in the caregiver's "Pending" account.
 * Called when the Parent pays. Money is collected by Platform, and Nanny's share
 * is tracked as a pending/locked balance.
 */
export async function holdFundsForBooking(bookingId: string) {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!booking) throw new Error("Booking not found");

  const { caregiverNet } = getBookingFinancialBreakdown(booking.totalAmount);

  return await db.transaction(async (tx) => {
    // 1. Ensure wallet exists
    await tx.insert(wallets).values({
      id: booking.caregiverId,
      balance: 0,
      pendingBalance: 0,
    }).onConflictDoNothing();

    // 2. Add to pending balance
    await tx.update(wallets)
      .set({ pendingBalance: sql`${wallets.pendingBalance} + ${caregiverNet}` })
      .where(eq(wallets.id, booking.caregiverId));

    // 3. Create a pending transaction record
    await tx.insert(walletTransactions).values({
      walletId: booking.caregiverId,
      amount: caregiverNet,
      type: "earning",
      status: "pending",
      description: `Escrow Hold: Booking #${bookingId.slice(0, 8)}`,
    });
  });
}

/**
 * Stage 2: Clear funds from "Pending" to "Available".
 * Called after the service ends (Clock-out). This makes the funds withdrawable.
 */
export async function clearFundsForBooking(bookingId: string) {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!booking) throw new Error("Booking not found");

  const { caregiverNet } = getBookingFinancialBreakdown(booking.totalAmount);

  // Find the exact pending transaction to "clear" it
  const transactions = await db.select().from(walletTransactions).where(
    and(
      eq(walletTransactions.walletId, booking.caregiverId),
      eq(walletTransactions.amount, caregiverNet),
      eq(walletTransactions.status, "pending"),
      eq(walletTransactions.type, "earning")
    )
  ).limit(1);

  if (transactions.length === 0) {
    console.warn(`No pending earning found for booking ${bookingId}. Funds might already be cleared.`);
    return;
  }

  const txnId = transactions[0].id;

  return await db.transaction(async (tx) => {
    // 25% default tax reserve for self-employment
    const taxReserveCents = Math.round(caregiverNet * 0.25);
    const availableNet = caregiverNet - taxReserveCents;

    // MON-02: Automated Overtime Billing
    // If overtime was calculated, we should credit the nanny for their share of it
    let totalNet = availableNet;
    let totalTax = taxReserveCents;
    if (booking.overtimeAmount && booking.overtimeAmount > 0) {
        const { caregiverNet: otNet } = getBookingFinancialBreakdown(booking.overtimeAmount);
        const otTax = Math.round(otNet * 0.25);
        totalNet += (otNet - otTax);
        totalTax += otTax;
        
        console.log(`[Financial Engine] Adding $${otNet/100} overtime payout for Booking #${bookingId}`);
    }

    // 1. Atomically move from pending to available and tax reserve
    await tx.update(wallets)
      .set({ 
        pendingBalance: sql`${wallets.pendingBalance} - ${caregiverNet}`,
        balance: sql`${wallets.balance} + ${totalNet}`,
        taxReserve: sql`${wallets.taxReserve} + ${totalTax}`,
        updatedAt: new Date()
      })
      .where(and(
        eq(wallets.id, booking.caregiverId),
        sql`${wallets.pendingBalance} >= ${caregiverNet}`
      ));

    // 2. Mark the transaction as cleared
    await tx.update(walletTransactions)
      .set({ 
        status: "cleared",
        description: `Unlocked: Service Complete for Booking #${bookingId.slice(0, 8)}${booking.overtimeAmount ? ` (incl. Overtime)` : ""}`,
        updatedAt: new Date()
      })
      .where(eq(walletTransactions.id, txnId));
  });
}

/**
 * Automated Overtime & Lateness Logic.
 * Compares scheduled vs actual times and calculates additional amounts due.
 */
export async function processBookingOvertime(bookingId: string) {
    const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, bookingId),
        with: { caregiver: { with: { nannyProfile: true } } }
    });

    if (!booking || !booking.checkInTime || !booking.checkOutTime) return;

    const scheduledMinutes = differenceInMinutes(booking.endDate, booking.startDate);
    const actualMinutes = differenceInMinutes(booking.checkOutTime, booking.checkInTime);

    // Overtime occurs if actual duration exceeds scheduled duration
    const overtimeMinutes = Math.max(0, actualMinutes - scheduledMinutes);

    // Lateness occurs if clock-in is after scheduled start
    const latenessMinutes = Math.max(0, differenceInMinutes(booking.checkInTime, booking.startDate));

    if (overtimeMinutes > 0 || latenessMinutes > 0) {
        const hourlyRate = parseFloat(booking.caregiver.nannyProfile?.hourlyRate || "35");
        const overtimeAmount = Math.round((overtimeMinutes / 60) * hourlyRate * 100);

        await db.update(bookings)
            .set({
                overtimeMinutes,
                latenessMinutes,
                overtimeAmount,
                isOvertime: overtimeMinutes > 0
            })
            .where(eq(bookings.id, bookingId));
            
        console.log(`[Overtime Engine] Booking ${bookingId}: ${overtimeMinutes}m overtime, ${latenessMinutes}m lateness. Charged $${overtimeAmount/100}`);
    }
}

/**
 * Aggregates financials for a specific month.
 * Can be scoped to a single series, or all ad-hoc bookings for a parent.
 */
export async function calculateMonthlyFinancials(seriesId: string | null, month: Date, parentId?: string) {
  const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59);

  // 1. Fetch relevant bookings
  const relevantBookings = await db.query.bookings.findMany({
    where: and(
      seriesId ? eq(bookings.seriesId, seriesId) : eq(bookings.parentId, parentId!),
      !seriesId ? sql`${bookings.seriesId} IS NULL` : undefined,
      eq(bookings.status, "completed"),
      gte(bookings.startDate, startOfMonth),
      lte(bookings.endDate, endOfMonth)
    )
  });

  // 2. Aggregate
  const stats = relevantBookings.reduce((acc, b) => {
    const { caregiverNet } = getBookingFinancialBreakdown(b.totalAmount);
    return {
      retainer: acc.retainer + (b.seriesId ? caregiverNet : 0),
      adhoc: acc.adhoc + (!b.seriesId ? caregiverNet : 0),
      totalOvertime: acc.totalOvertime + (b.overtimeAmount || 0),
      actualHoursWorked: acc.actualHoursWorked + (b.hoursPerDay || 0), // Simplifying: using hoursPerDay as proxy or we'd calc actual duration
    };
  }, { retainer: 0, adhoc: 0, totalOvertime: 0, actualHoursWorked: 0 });

  const grossEarnings = stats.retainer + stats.adhoc + stats.totalOvertime;
  const estimatedTax = Math.round(grossEarnings * 0.15); // Static 15% estimate

  return {
    retainer: stats.retainer / 100,
    totalOvertime: stats.totalOvertime / 100,
    grossEarnings: grossEarnings / 100,
    estimatedTax: estimatedTax / 100,
    netEarnings: (grossEarnings - estimatedTax) / 100,
    actualHoursWorked: stats.actualHoursWorked,
  };
}
