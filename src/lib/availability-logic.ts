import { db } from "@/db";
import { bookings, bookingSeries } from "@/db/schema";
import { and, eq, or, gte, lte, sql, ne } from "drizzle-orm";
import { addMinutes, subMinutes, isBefore, isAfter, areIntervalsOverlapping } from "date-fns";

/**
 * Checks if a nanny is available for a given time slot.
 * Returns true if available, false if there's a clash.
 * Includes a mandatory 30-minute travel buffer.
 */
export async function checkNannyClashes(
  caregiverId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string
) {
  // 1. Calculate buffer-inclusive interval
  const BUFFER_MINUTES = 30;
  const startWithBuffer = subMinutes(start, BUFFER_MINUTES);
  const endWithBuffer = addMinutes(end, BUFFER_MINUTES);

  // 2. Check existing one-time/ad-hoc bookings
  const existingBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.caregiverId, caregiverId),
      or(
        eq(bookings.status, "confirmed"),
        eq(bookings.status, "paid"),
        eq(bookings.status, "in_progress")
      ),
      excludeBookingId ? ne(bookings.id, excludeBookingId) : undefined,
      // Overlap logic: (StartA < EndB) AND (EndA > StartB)
      sql`${bookings.startDate} < ${endWithBuffer}`,
      sql`${bookings.endDate} > ${startWithBuffer}`
    )
  });

  if (existingBookings.length > 0) {
    return {
      hasClash: true,
      clashType: "booking",
      conflicts: existingBookings.map(b => ({
        id: b.id,
        start: b.startDate,
        end: b.endDate,
        title: "Existing Booking"
      }))
    };
  }

  // 3. Check Weekly Series
  // This is more complex since series are recurring. 
  // We need to check if the proposed 'start' day of week matches any series schedule.
  const activeSeries = await db.query.bookingSeries.findMany({
    where: and(
        eq(bookingSeries.caregiverId, caregiverId),
        eq(bookingSeries.status, "active")
    )
  });

  const dayNum = start.getDay();
  // Schema uses 1=Mon, 7=Sun
  const dayOfWeekNum = dayNum === 0 ? 7 : dayNum;
  
  for (const series of activeSeries) {
    if (series.daysOfWeek.includes(dayOfWeekNum)) {
        // Construct dates for the series shift on the same day as the proposed booking
        const [sH, sM] = series.startTime.split(':').map(Number);
        const [eH, eM] = series.endTime.split(':').map(Number);
        
        const seriesStart = new Date(start);
        seriesStart.setHours(sH, sM, 0, 0);
        
        const seriesEnd = new Date(start);
        seriesEnd.setHours(eH, eM, 0, 0);

        // Check overlap with buffer
        if (
            areIntervalsOverlapping(
                { start: startWithBuffer, end: endWithBuffer },
                { start: seriesStart, end: seriesEnd }
            )
        ) {
            return {
                hasClash: true,
                clashType: "series",
                conflicts: [{
                    id: series.id,
                    start: seriesStart,
                    end: seriesEnd,
                    title: "Weekly Recurring Schedule"
                }]
            };
        }
    }
  }

  return { hasClash: false, conflicts: [] };
}
