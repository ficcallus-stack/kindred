"use server";

import { db } from "@/db";
import { bookingSeries } from "@/db/schema";
import { requireUser } from "@/lib/get-server-user";
import { eq, and } from "drizzle-orm";
import { calculateMonthlyFinancials } from "@/lib/financial-logic";

/**
 * Retrieves the earnings forecast for the logged-in caregiver for all active retainers.
 */
export async function getNannyFinancials(month: Date = new Date()) {
  const user = await requireUser();

  const activeSeries = await db.query.bookingSeries.findMany({
    where: and(
        eq(bookingSeries.caregiverId, user.uid),
        eq(bookingSeries.status, "active")
    )
  });

  const snapshots = await Promise.all(
    activeSeries.map(s => calculateMonthlyFinancials(s.id, month))
  );

  // Aggregate totals
  return snapshots.reduce((acc, s) => ({
    retainer: acc.retainer + s.retainer,
    totalOvertime: acc.totalOvertime + s.totalOvertime,
    grossEarnings: acc.grossEarnings + s.grossEarnings,
    estimatedTax: acc.estimatedTax + s.estimatedTax,
    netEarnings: acc.netEarnings + s.netEarnings,
    actualHoursWorked: acc.actualHoursWorked + s.actualHoursWorked,
    currency: "USD"
  }), {
    retainer: 0,
    totalOvertime: 0,
    grossEarnings: 0,
    estimatedTax: 0,
    netEarnings: 0,
    actualHoursWorked: 0,
    currency: "USD"
  });
}
