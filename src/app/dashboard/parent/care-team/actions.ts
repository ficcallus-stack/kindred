"use server";

import { db } from "@/db";
import { auditLogs, careTeam, parentProfiles, users, bookingSeries, bookings, careActivities } from "@/db/schema";
import { generateSeriesInstances } from "@/lib/series-logic";
import { calculateMonthlyFinancials } from "@/lib/financial-logic";
import { requireUser } from "@/lib/get-server-user";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

/**
 * Updates the persistent household manual for the parent profile.
 */
export async function updateHouseholdManual(content: string) {
  const user = await requireUser();
  
  await db.update(parentProfiles)
    .set({ householdManual: content, updatedAt: new Date() })
    .where(eq(parentProfiles.id, user.uid));

  revalidatePath("/dashboard/parent");
  return { success: true };
}

/**
 * Adds a caregiver to the family's Care Team.
 */
export async function addToCareTeam(caregiverId: string, nickname?: string) {
  const user = await requireUser();

  // Check if already in team
  const existing = await db.query.careTeam.findFirst({
    where: and(
      eq(careTeam.parentId, user.uid),
      eq(careTeam.caregiverId, caregiverId)
    )
  });

  if (existing) {
    if (existing.status === "archived") {
      await db.update(careTeam)
        .set({ status: "active", nickname: nickname || existing.nickname, updatedAt: new Date() })
        .where(eq(careTeam.id, existing.id));
    } else {
      throw new Error("Caregiver is already in your Care Team.");
    }
  } else {
    await db.insert(careTeam).values({
      parentId: user.uid,
      caregiverId,
      nickname: nickname || "Regular Caregiver",
      status: "active",
    });
  }

  revalidatePath("/dashboard/parent");
  return { success: true };
}

/**
 * Removes (archives) a caregiver from the Care Team.
 */
export async function removeFromCareTeam(careTeamId: string) {
  const user = await requireUser();

  await db.update(careTeam)
    .set({ status: "archived", updatedAt: new Date() })
    .where(and(
      eq(careTeam.id, careTeamId),
      eq(careTeam.parentId, user.uid)
    ));

  revalidatePath("/dashboard/parent");
  return { success: true };
}

/**
 * Retrieves the full Care Team for the logged-in parent.
 */
export async function getCareTeam() {
  const user = await requireUser();

  const members = await db.query.careTeam.findMany({
    where: and(
      eq(careTeam.parentId, user.uid),
      eq(careTeam.status, "active")
    ),
    with: {
      caregiver: true
    },
    orderBy: (careTeam, { desc }) => [desc(careTeam.createdAt)]
  });

  return members.map(m => ({
    id: m.id,
    parentId: m.parentId,
    caregiverId: m.caregiver.id,
    caregiverName: m.caregiver.fullName,
    caregiverImage: m.caregiver.profileImageUrl || "",
    nickname: m.nickname || "",
    status: m.status,
    lastActive: "Active Now",
    createdAt: m.createdAt
  }));
}

/**
 * Retrieves all active booking series for the logged-in parent.
 */
export async function getBookingSeries() {
  const user = await requireUser();

  const series = await db.query.bookingSeries.findMany({
    where: and(
      eq(bookingSeries.parentId, user.uid),
      eq(bookingSeries.status, "active")
    ),
    with: {
      caregiver: true
    },
    orderBy: (bookingSeries, { desc }) => [desc(bookingSeries.createdAt)]
  });

  return series.map(s => ({
    id: s.id,
    caregiverName: s.caregiver.fullName,
    daysOfWeek: s.daysOfWeek as number[],
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
    retainerAmount: s.retainerAmount,
    nextBillingDate: s.nextBillingDate ? format(new Date(s.nextBillingDate), "MMM d, yyyy") : "N/A",
    nextSessionDate: format(new Date(s.startDate), "MMM d, yyyy")
  }));
}


/**
 * Retrieves the financial snapshot for a specific month for all parent's series.
 */
export async function getFamilyFinancials(month: Date = new Date()) {
  const user = await requireUser();

  const activeSeries = await db.query.bookingSeries.findMany({
    where: and(
        eq(bookingSeries.parentId, user.uid),
        eq(bookingSeries.status, "active")
    )
  });

  const snapshots = await Promise.all(
    activeSeries.map(s => calculateMonthlyFinancials(s.id, month))
  );

  // Fetch ad-hoc snapshot (bookings where seriesId IS NULL)
  const adhocSnapshot = await calculateMonthlyFinancials(null, month, user.uid);
  snapshots.push(adhocSnapshot);

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
  } as any);
}

/**
 * Updates the financial settings for a specific series.
 */
export async function updateRetainerSettings(seriesId: string, data: {
    retainerAmount: number;
    overtimeRate: number;
    taxWithholding: boolean;
}) {
    const user = await requireUser();

    await db.update(bookingSeries)
        .set({
            retainerAmount: Math.round(data.retainerAmount),
            overtimeRate: Math.round(data.overtimeRate),
            taxWithholding: data.taxWithholding,
            updatedAt: new Date()
        })
        .where(and(
            eq(bookingSeries.id, seriesId),
            eq(bookingSeries.parentId, user.uid)
        ));

    revalidatePath("/dashboard/parent");
    return { success: true };
}
export async function createBookingSeries(data: {
  caregiverId: string;
  startDate: Date;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  nickname?: string;
  notes?: string;
}) {
  const user = await requireUser();

  const [series] = await db.insert(bookingSeries).values({
    parentId: user.uid,
    caregiverId: data.caregiverId,
    startDate: data.startDate,
    daysOfWeek: data.daysOfWeek,
    startTime: data.startTime,
    endTime: data.endTime,
    status: "active",
    notes: data.notes,
    nextBillingDate: new Date(new Date(data.startDate).setMonth(new Date(data.startDate).getMonth() + 1))
  }).returning();

  // Auto-generate the first 4 weeks of sessions
  await generateSeriesInstances(series.id, 4);

  revalidatePath("/dashboard/parent");
  return { success: true, seriesId: series.id };
}

/**
 * Cancels an active booking series and its future pending instances.
 */
export async function cancelBookingSeries(seriesId: string) {
  const user = await requireUser();

  await db.update(bookingSeries)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(and(
      eq(bookingSeries.id, seriesId),
      eq(bookingSeries.parentId, user.uid)
    ));

  // Clean up future pending booking instances
  await db.delete(bookings).where(and(eq(bookings.seriesId, seriesId), eq(bookings.status, "pending")));

  revalidatePath("/dashboard/parent");
  return { success: true };
}

/**
 * Retrieves the activity feed for the logged-in user.
 * Merges audit logs with live session activities from nannies.
 */
export async function getActivityFeed(page: number = 0, limit: number = 10) {
    const user = await requireUser();
    const offset = page * limit;
    
    // 1. Fetch system audit logs
    const logs = await db.query.auditLogs.findMany({
        where: eq(auditLogs.actorId, user.uid),
        orderBy: (auditLogs, { desc }) => [desc(auditLogs.createdAt)],
        limit: limit,
        offset: offset
    });

    // 2. Fetch live nanny activities for this parent
    const nannyActs = await db.query.careActivities.findMany({
        where: eq(careActivities.parentId, user.uid),
        orderBy: (careActivities, { desc }) => [desc(careActivities.createdAt)],
        limit: limit,
        offset: offset
    });

    // 3. Map and Merge
    const merged = [
       ...logs.map(l => ({
          id: l.id,
          type: l.entityType === "booking" ? "system" : l.entityType === "series" ? "system" : "financial",
          action: l.action,
          timestamp: l.createdAt,
          metadata: l.metadata
       })),
       ...nannyActs.map(a => ({
          id: a.id,
          type: "nanny",
          action: `${a.type.charAt(0).toUpperCase() + a.type.slice(1)} Logged`,
          timestamp: a.createdAt,
          metadata: { summary: a.content, photoUrl: a.photoUrl, videoUrl: a.videoUrl }
       }))
    ];

    // Sort by timestamp desc and handle slicing
    return merged.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);
}
