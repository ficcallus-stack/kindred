"use server";

import { getServerUser } from "@/lib/get-server-user";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, nannyProfiles, bookings, caregiverVerifications, messages, conversationMembers } from "@/db/schema";
import { eq, sql, inArray, and, not, desc, asc, ilike, or } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getGhostNannies(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "recent" | "bookings" | "messages";
  filterHasMessages?: boolean;
} = {}) {
  await requireAdmin();

  const { page = 1, limit = 30, search = "", sortBy = "recent", filterHasMessages = false } = params;
  const offset = (page - 1) * limit;

  // 1. Build Base Filter
  const whereConditions = [eq(users.isGhost, true)];

  if (search) {
    const q = `%${search}%`;
    whereConditions.push(or(
      ilike(users.fullName, q),
      ilike(users.id, q),
      ilike(users.email, q)
    ) as any);
  }

  if (filterHasMessages) {
    whereConditions.push(sql`EXISTS (
      SELECT 1 FROM ${conversationMembers} cm
      INNER JOIN ${messages} m ON cm.conversation_id = m.conversation_id
      WHERE cm.user_id = ${users.id} AND m.sender_id != ${users.id}
    )`);
  }

  // 2. Build Sort Order
  let orderBy;
  if (sortBy === "bookings") {
    orderBy = [desc(sql`bookings_count`)];
  } else if (sortBy === "messages") {
    orderBy = [desc(sql`message_count`)];
  } else {
    orderBy = [desc(nannyProfiles.updatedAt)];
  }

  // 3. Execute Paginated Query
  const ghosts = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      profileImageUrl: users.profileImageUrl,
      isPremium: users.isPremium,
      hourlyRate: nannyProfiles.hourlyRate,
      availability: nannyProfiles.availability,
      updatedAt: nannyProfiles.updatedAt,
      bookingsCount: sql<number>`(SELECT CAST(COUNT(*) AS INTEGER) FROM ${bookings} WHERE caregiver_id = ${users.id})`.as("bookings_count"),
      messageCount: sql<number>`(
        SELECT CAST(COUNT(*) AS INTEGER)
        FROM ${messages} m
        INNER JOIN ${conversationMembers} cm ON m.conversation_id = cm.conversation_id
        WHERE cm.user_id = ${users.id} AND m.sender_id != ${users.id}
      )`.as("message_count")
    })
    .from(users)
    .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
    .where(and(...whereConditions))
    .orderBy(...orderBy)
    .limit(limit)
    .offset(offset);

  // 4. Get Total Count for Pagination Telemetry
  const [totalCountResult] = await db
    .select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` })
    .from(users)
    .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
    .where(and(...whereConditions));

  const totalCount = totalCountResult?.count || 0;
  
  return {
    ghosts,
    totalCount,
    hasMore: offset + ghosts.length < totalCount
  };
}

export async function toggleGhostVisibility(uid: string, isOnline: boolean) {
  await requireAdmin();

  const profile = await db.query.nannyProfiles.findFirst({
    where: eq(nannyProfiles.id, uid)
  });

  if (!profile) throw new Error("Profile not found");

  const currentAvailability = profile.availability as Record<string, any>;
  
  await db.update(nannyProfiles)
    .set({
      availability: { ...currentAvailability, isOnline }
    })
    .where(eq(nannyProfiles.id, uid));

  revalidatePath("/dashboard/admin/liquidity/nannies/manage");
}

export async function infiltrateGhost(uid: string) {
  // Ghost Protocol: Impersonation
  // Swaps the admin's session cookie for a new session cookie minted for the Ghost user.
  // Stores original admin UID for reversion.
  
  const admin = await requireAdmin();

  // 1. Generate Custom Token
  const customToken = await adminAuth.createCustomToken(uid);

  // 2. Exchange Custom Token for ID Token via REST API
  const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: customToken, returnSecureToken: true }),
  });
  
  const data = await res.json();
  if (!data.idToken) throw new Error("Failed to generate ID token for impersonation.");

  // 3. Create Session Cookie
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await adminAuth.createSessionCookie(data.idToken, { expiresIn });

  // 4. Set Cookies
  const cookieStore = await cookies();
  
  // Backup admin session
  const currentSession = cookieStore.get("session")?.value;
  if (currentSession) {
    cookieStore.set("admin_session_backup", currentSession, { maxAge: expiresIn / 1000, httpOnly: true, secure: true, path: "/" });
  }

  // Set new session
  cookieStore.set("session", sessionCookie, { maxAge: expiresIn / 1000, httpOnly: true, secure: true, path: "/" });

  return { success: true };
}

export async function revertImpersonation() {
  const cookieStore = await cookies();
  const backup = cookieStore.get("admin_session_backup")?.value;

  if (!backup) throw new Error("No backup session found.");

  cookieStore.set("session", backup, { maxAge: 60 * 60 * 24 * 5, httpOnly: true, secure: true, path: "/" });
  cookieStore.delete("admin_session_backup");

  return { success: true };
}

export async function toggleGhostVisibilityBatch(uids: string[], isOnline: boolean) {
  await requireAdmin();

  for (const uid of uids) {
    const profile = await db.query.nannyProfiles.findFirst({
      where: eq(nannyProfiles.id, uid)
    });
    if (profile) {
      const currentAvailability = profile.availability as Record<string, any> || {};
      await db.update(nannyProfiles)
        .set({ availability: { ...currentAvailability, isOnline } })
        .where(eq(nannyProfiles.id, uid));
    }
  }

  revalidatePath("/dashboard/admin/liquidity/nannies/manage");
  return { success: true };
}

export async function deleteGhostsBatch(uids: string[]) {
  await requireAdmin();
  let deletedCount = 0;
  let skippedCount = 0;

  for (const uid of uids) {
    // Safety Guard: Check if Ghost has active relational bookings.
    const bookingCountResult = await db.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(bookings).where(eq(bookings.caregiverId, uid));
    
    if (bookingCountResult[0].count > 0) {
      console.warn(`[Ghost Wiper] Skipping UID ${uid} - Active SQL Relational data detected.`);
      skippedCount++;
      continue; // Skips this specific ghost to prevent FK crashes, moves to next loop.
    }

    try {
      // 1. Firebase Auth Hard Wipe
      await adminAuth.deleteUser(uid).catch(e => console.warn(`Firebase wipe for ${uid} failed/missing: ${e.message}`));

      // 2. SQL Surgical Layered Cascade
      await db.delete(caregiverVerifications).where(eq(caregiverVerifications.id, uid));
      await db.delete(nannyProfiles).where(eq(nannyProfiles.id, uid));
      await db.delete(users).where(eq(users.id, uid));
      deletedCount++;
    } catch (err) {
      console.error(`Failed to wipe ghost ${uid} from SQL:`, err);
      skippedCount++;
    }
  }

  revalidatePath("/dashboard/admin/liquidity/nannies/manage");
  return { success: true, deletedCount, skippedCount };
}
