import { db } from "@/db";
import { bookings, bookingSeries } from "@/db/schema";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";

/**
 * Calculates the total financial snapshot for a series for a specific month.
 * Includes Retainer, Overtime, and Tax Withholding.
 */
export async function calculateMonthlyFinancials(seriesId: string, month: Date = new Date()) {
  const series = await db.query.bookingSeries.findFirst({
    where: eq(bookingSeries.id, seriesId),
  });

  if (!series) throw new Error("Series not found");

  const start = startOfMonth(month);
  const end = endOfMonth(month);

  // Fetch all bookings for this series in this month
  const monthlyBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.seriesId, seriesId),
      gte(bookings.startDate, start),
      lte(bookings.startDate, end)
    )
  });

  const retainer = series.retainerAmount || 0;
  const overtimeRate = series.overtimeRate || 0;
  
  let totalOvertimeCents = 0;
  let actualHoursWorked = 0;

  for (const booking of monthlyBookings) {
     // Overtime calculation: if booking is marked as isOvertime 
     // OR if it has overtimeAmount from clock-in logic
     totalOvertimeCents += booking.overtimeAmount;
     
     if (booking.isOvertime) {
        totalOvertimeCents += booking.totalAmount;
     }

     const durationMs = booking.endDate.getTime() - booking.startDate.getTime();
     actualHoursWorked += durationMs / (1000 * 60 * 60);
  }

  const grossEarnings = retainer + totalOvertimeCents;
  
  // Tax Withholding (Placeholder Logic: 15% if enabled)
  const taxRate = series.taxWithholding ? 0.15 : 0;
  const estimatedTax = Math.round(grossEarnings * taxRate);

  // Stage 5 Loyalty Logic: Tenure-based fee reduction
  const tenureMs = new Date().getTime() - series.createdAt.getTime();
  const tenureDays = tenureMs / (1000 * 60 * 60 * 24);
  const isLoyal = tenureDays >= 90;
  const loyaltyDiscount = isLoyal ? Math.round(grossEarnings * 0.01) : 0; // 1% platform cash-back/discount

  const netEarnings = grossEarnings - estimatedTax;

  return {
    retainer,
    totalOvertime: totalOvertimeCents,
    grossEarnings,
    estimatedTax,
    netEarnings,
    loyaltyDiscount,
    isLoyal,
    actualHoursWorked: Math.round(actualHoursWorked * 10) / 10,
    currency: "USD"
  };
}

/**
 * Calculates overtime for a specific booking instance based on check-in/out.
 */
export async function processBookingOvertime(bookingId: string) {
    const booking = await db.query.bookings.findFirst({
        where: eq(bookings.id, bookingId),
        with: { series: true }
    });

    if (!booking || !booking.series || !booking.checkInTime || !booking.checkOutTime) {
        return;
    }

    const scheduledDurationMs = booking.endDate.getTime() - booking.startDate.getTime();
    const actualDurationMs = booking.checkOutTime.getTime() - booking.checkInTime.getTime();
    
    const diffMs = actualDurationMs - scheduledDurationMs;
    const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

    if (diffMinutes > 15) { // 15-minute grace period
        const hourlyRate = booking.series.overtimeRate || (booking.totalAmount / (scheduledDurationMs / 3600000));
        const overtimeAmount = Math.round((diffMinutes / 60) * Number(hourlyRate));
        
        await db.update(bookings)
            .set({ 
                overtimeMinutes: diffMinutes,
                overtimeAmount: overtimeAmount,
            })
            .where(eq(bookings.id, bookingId));
            
        return overtimeAmount;
    }

    return 0;
}
