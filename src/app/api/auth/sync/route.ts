import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getServerUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, nannyProfiles, referrals } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";

// POST â€” Sync Firebase user to our database (called after signup/login)
export async function POST(request: Request) {
  try {
    const serverUser = await getServerUser();
    if (!serverUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, fullName, referralCode } = await request.json();

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, serverUser.uid),
    });

    if (existingUser) {
      // Update role if provided and different
      if (role && role !== existingUser.role) {
        // Only allow parent/caregiver via self-service
        const safeRole = (role === "parent" || role === "caregiver") ? role : existingUser.role;
        const [updated] = (await db
          .update(users)
          .set({ role: safeRole, updatedAt: new Date() })
          .where(eq(users.id, serverUser.uid))
          .returning()) as any[];

        // Sync role to Firebase custom claims
        await adminAuth.setCustomUserClaims(serverUser.uid, { role: safeRole });

        return NextResponse.json(updated);
      }
      return NextResponse.json(existingUser);
    }

    // Get Firebase user info for email/name
    const fbUser = await adminAuth.getUser(serverUser.uid);
    const userEmail = fbUser.email || serverUser.email || "";
    const userName = fullName || fbUser.displayName || "Kindred User";
    // Only allow parent/caregiver at signup
    const userRole = (role === "parent" || role === "caregiver") ? role : "parent";

    // Check for referral attribution
    let referredByUserId: string | null = null;
    if (referralCode) {
        const referrer = await db.query.users.findFirst({
            where: eq(users.referralCode, referralCode.toUpperCase())
        });
        if (referrer) {
            referredByUserId = referrer.id;
        }
    }

    // Create user in DB
    const [newUser] = (await db.insert(users).values({
      id: serverUser.uid,
      email: userEmail,
      fullName: userName,
      role: userRole,
      referredBy: referredByUserId,
    }).returning()) as any[];

    // If referred, create referral record
    if (referredByUserId) {
        await db.insert(referrals).values({
            referrerId: referredByUserId,
            refereeId: serverUser.uid,
            status: "signed_up",
            rewardAmount: 2500, // $25 initial milestone
        });
    }

    // Sync role to Firebase custom claims
    await adminAuth.setCustomUserClaims(serverUser.uid, { role: userRole });

    // If caregiver, create blank nanny profile
    if (userRole === "caregiver") {
      await db.insert(nannyProfiles).values({
        id: serverUser.uid,
      });
    }

    return NextResponse.json(newUser);
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
