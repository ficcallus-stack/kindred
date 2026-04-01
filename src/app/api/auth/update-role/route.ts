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
