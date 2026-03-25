import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { adminAuth } from "@/lib/firebase-admin";

// POST â€” Sync Firebase user to our database (called after signup/login)
export async function POST(request: Request) {
  try {
    const serverUser = await getServerUser();
    if (!serverUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, fullName } = await request.json();

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, serverUser.uid),
    });

    if (existingUser) {
      // Update role if provided and different
      if (role && role !== existingUser.role) {
        // Only allow parent/caregiver via self-service
        const safeRole = (role === "parent" || role === "caregiver") ? role : existingUser.role;
        const [updated] = await db
          .update(users)
          .set({ role: safeRole, updatedAt: new Date() })
          .where(eq(users.id, serverUser.uid))
          .returning();

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

    // Create user in DB
    const [newUser] = await db.insert(users).values({
      id: serverUser.uid,
      email: userEmail,
      fullName: userName,
      role: userRole,
    }).returning();

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
