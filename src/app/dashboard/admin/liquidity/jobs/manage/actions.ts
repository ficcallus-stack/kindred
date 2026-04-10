"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { jobs, users, applications, bookings } from "@/db/schema";
import { eq, sql, and, desc, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGhostJobs(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "recent" | "engagement";
} = {}) {
  await requireAdmin();

  const { page = 1, limit = 30, search = "", sortBy = "recent" } = params;
  const offset = (page - 1) * limit;

  // 1. Build Base Filter
  const whereConditions = [eq(jobs.isSynthetic, true)];

  if (search) {
    const q = `%${search}%`;
    whereConditions.push(or(
      ilike(jobs.title, q),
      ilike(jobs.id, q),
      ilike(users.fullName, q)
    ) as any);
  }

  // 2. Build Sort Order
  let orderBy;
  if (sortBy === "engagement") {
    orderBy = [desc(sql`application_count`)];
  } else {
    orderBy = [desc(jobs.createdAt)];
  }

  // 3. Execute Paginated Query with Parent and App Stats
  const syntheticJobs = await db
    .select({
      id: jobs.id,
      title: jobs.title,
      status: jobs.status,
      hiringType: jobs.hiringType,
      createdAt: jobs.createdAt,
      parentId: users.id,
      parentName: users.fullName,
      applicationCount: sql<number>`(SELECT CAST(COUNT(*) AS INTEGER) FROM ${applications} WHERE job_id = ${jobs.id})`.as("application_count"),
      bookingCount: sql<number>`(SELECT CAST(COUNT(*) AS INTEGER) FROM ${bookings} WHERE job_id = ${jobs.id})`.as("booking_count")
    })
    .from(jobs)
    .innerJoin(users, eq(jobs.parentId, users.id))
    .where(and(...whereConditions))
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  // 4. Get Total Count
  const [totalResult] = await db
    .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
    .from(jobs)
    .where(and(...whereConditions));

  const totalCount = totalResult?.count || 0;
  
  return {
    jobs: syntheticJobs,
    totalCount,
    hasMore: offset + syntheticJobs.length < totalCount
  };
}

export async function closeJobAction(jobId: string) {
  await requireAdmin();
  await db.update(jobs)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(jobs.id, jobId));
  
  revalidatePath("/dashboard/admin/liquidity/jobs/manage");
}

export async function deleteJobsBatch(ids: string[]) {
  await requireAdmin();
  let deletedCount = 0;
  let skippedCount = 0;

  for (const id of ids) {
    // Safety Guard: Check for bookings
    const [bookingCount] = await db.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(bookings).where(eq(bookings.jobId, id));
    
    if (bookingCount.count > 0) {
      skippedCount++;
      continue;
    }

    try {
      // 1. Wipe applications first (Relational cleanuo)
      await db.delete(applications).where(eq(applications.jobId, id));
      // 2. Delete Job
      await db.delete(jobs).where(eq(jobs.id, id));
      deletedCount++;
    } catch (err) {
      skippedCount++;
    }
  }

  revalidatePath("/dashboard/admin/liquidity/jobs/manage");
  return { success: true, deletedCount, skippedCount };
}
