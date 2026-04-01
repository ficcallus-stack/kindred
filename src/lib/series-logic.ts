import { db } from "@/db";
import { bookings, bookingSeries } from "@/db/schema";
import { addDays, format, isAfter, nextDay, startOfDay, addWeeks, parse } from "date-fns";
import { and, eq, gte, lte, or } from "drizzle-orm";

/**
 * Generates individual booking sessions from a BookingSeries definition.
 * @param seriesId The ID of the parent series
 * @param weeksToGenerate How many weeks worth of instances to create (default 4)
 */
export async function generateSeriesInstances(seriesId: string, weeksToGenerate: number = 4) {
  const series = await db.query.bookingSeries.findFirst({
    where: eq(bookingSeries.id, seriesId),
    with: { caregiver: { with: { nannyProfile: true } } }
  });

  if (!series) throw new Error("Series not found");

  const instances = [];
  const start = startOfDay(new Date(series.startDate));
  const endLimit = series.endDate ? startOfDay(new Date(series.endDate)) : addWeeks(start, weeksToGenerate);
  
  // Calculate hourly rate from nanny profile or default
  const hourlyRateCents = Math.round(Number(series.caregiver.nannyProfile?.hourlyRate || 20) * 100);

  // Parse start and end times
  const [startH, startM] = series.startTime.split(":").map(Number);
  const [endH, endM] = series.endTime.split(":").map(Number);
  const hoursPerDay = endH - startH + (endM - startM) / 60;

  for (let week = 0; week < weeksToGenerate; week++) {
    for (const dayOfWeek of series.daysOfWeek) {
        // daysOfWeek: 0-6 (Sun-Sat) in JS, but 1-7 in some systems. 
        // Our schema uses [1, 3, 5] for Mon, Wed, Fri. Let's assume 1=Mon, 7=Sun.
        
        // Logic to find the date for this specific day in this week
        let currentInstanceDate = addWeeks(start, week);
        const targetDay = (dayOfWeek % 7); // Handle 7 as 0 (Sunday) if needed
        
        // Find the date of the 'targetDay' in the current week
        // nextDay(date, day) returns the next occurrence. 
        // We'll use a simpler approach: find the day offset.
        const currentDay = currentInstanceDate.getDay();
        const diff = (targetDay - currentDay + 7) % 7;
        currentInstanceDate = addDays(currentInstanceDate, diff);

        if (isAfter(currentInstanceDate, endLimit)) break;
        if (currentInstanceDate < start) continue;

        const sessionStart = new Date(currentInstanceDate);
        sessionStart.setHours(startH, startM, 0, 0);

        const sessionEnd = new Date(currentInstanceDate);
        sessionEnd.setHours(endH, endM, 0, 0);

        // Conflict Detection logic
        const conflict = await db.query.bookings.findFirst({
            where: and(
                eq(bookings.caregiverId, series.caregiverId),
                or(
                    and(gte(bookings.startDate, sessionStart), lte(bookings.startDate, sessionEnd)),
                    and(gte(bookings.endDate, sessionStart), lte(bookings.endDate, sessionEnd))
                )
            )
        });

        if (!conflict) {
            instances.push({
                parentId: series.parentId,
                caregiverId: series.caregiverId,
                seriesId: series.id,
                startDate: sessionStart,
                endDate: sessionEnd,
                hoursPerDay: Math.ceil(hoursPerDay),
                totalAmount: Math.ceil(hoursPerDay * hourlyRateCents),
                status: "pending" as const,
                notes: `System generated from series: ${series.nickname || 'Recurring Care'}`
            });
        }
    }
  }

  if (instances.length > 0) {
    await db.insert(bookings).values(instances);
  }

  return instances.length;
}
