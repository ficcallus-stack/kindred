import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireUser } from "@/lib/get-server-user";

export async function POST(req: Request) {
  try {
    const serverUser = await requireUser();
    const { role } = await req.json();

    if (!role || !["parent", "caregiver"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // VULN-04 FIX: Enforce 4-hour cooldown
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, serverUser.uid),
    });

    if (existingUser?.updatedAt) {
      const hoursSinceLastUpdate = (Date.now() - existingUser.updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastUpdate < 4) {
        return NextResponse.json({ 
          error: `Role switch is on cooldown. Please wait ${Math.ceil(4 - hoursSinceLastUpdate)} hours.` 
        }, { status: 403 });
      }
    }

    // Update user role in DB
    const [updatedUser] = await db
      .update(users)
      .set({ 
        role: role as "parent" | "caregiver",
        updatedAt: new Date()
      })
      .where(eq(users.id, serverUser.uid))
      .returning();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified 
    });
  } catch (err: any) {
    console.error("Update Role Error:", err.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
