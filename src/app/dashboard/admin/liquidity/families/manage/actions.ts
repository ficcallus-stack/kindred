"use server";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, parentProfiles, children, bookings, parentVerifications, messages, conversationMembers } from "@/db/schema";
import { eq, sql, inArray, and, desc, ilike, or } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getGhostFamilies(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "recent" | "bookings" | "children";
} = {}) {
  await requireAdmin();

  const { page = 1, limit = 30, search = "", sortBy = "recent" } = params;
  const offset = (page - 1) * limit;

  // 1. Build Base Filter
  const whereConditions = [eq(users.isGhost, true), eq(users.role, "parent")];

  if (search) {
    const q = `%${search}%`;
    whereConditions.push(or(
      ilike(users.fullName, q),
      ilike(users.id, q),
      ilike(users.email, q)
    ) as any);
  }

  // 2. Build Sort Order
  let orderBy;
  if (sortBy === "bookings") {
    orderBy = [desc(sql`bookings_count`)];
  } else if (sortBy === "children") {
    orderBy = [desc(sql`child_count`)];
  } else {
    orderBy = [desc(users.createdAt)];
  }

  // 3. Execute Paginated Query
  const ghosts = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      profileImageUrl: users.profileImageUrl,
      isPremium: users.isPremium,
      tier: users.subscriptionTier,
      createdAt: users.createdAt,
      childCount: sql<number>`(SELECT CAST(COUNT(*) AS INTEGER) FROM ${children} WHERE parent_id = ${users.id})`.as("child_count"),
      bookingsCount: sql<number>`(SELECT CAST(COUNT(*) AS INTEGER) FROM ${bookings} WHERE parent_id = ${users.id})`.as("bookings_count")
    })
    .from(users)
    .where(and(...whereConditions))
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  // 4. Get Total Count
  const [totalResult] = await db
    .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
    .from(users)
    .where(and(...whereConditions));

  const totalCount = totalResult?.count || 0;
  
  return {
    ghosts,
    totalCount,
    hasMore: offset + ghosts.length < totalCount
  };
}

export async function infiltrateFamily(uid: string) {
  // Ghost Protocol: Impersonation
  const admin = await requireAdmin();

  // 1. Generate Custom Token
  const customToken = await adminAuth.createCustomToken(uid);

  // 2. Exchange Token for Session
  const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  
  const data = await res.json();
  if (!data.idToken) throw new Error("Failed to generate ID token for impersonation.");

  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn });

  const cookieStore = await cookies();
  const currentSession = cookieStore.get("session")?.value;
  if (currentSession) {
    cookieStore.set("admin_session_backup", currentSession, { maxAge: expiresIn / 1000, httpOnly: true, secure: true, path: "/" });
  }

  cookieStore.set("session", sessionCookie, { maxAge: expiresIn / 1000, httpOnly: true, secure: true, path: "/" });

  return { success: true };
}

export async function deleteFamiliesBatch(uids: string[]) {
  await requireAdmin();
  let deletedCount = 0;
  let skippedCount = 0;

  for (const uid of uids) {
    // Safety Guard: Check for active bookings
    const [bookingCount] = await db.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(bookings).where(eq(bookings.parentId, uid));
    
    if (bookingCount.count > 0) {
      skippedCount++;
      continue;
    }

    try {
      // 1. Firebase Wipe
      await adminAuth.deleteUser(uid).catch(() => null);

      // 2. SQL Wipe (Layered Cascade)
      await db.delete(children).where(eq(children.parentId, uid));
      await db.delete(parentProfiles).where(eq(parentProfiles.id, uid));
      await db.delete(parentVerifications).where(eq(parentVerifications.id, uid));
      await db.delete(users).where(eq(users.id, uid));
      deletedCount++;
    } catch (err) {
      skippedCount++;
    }
  }

  revalidatePath("/dashboard/admin/liquidity/families/manage");
  return { success: true, deletedCount, skippedCount };
}
