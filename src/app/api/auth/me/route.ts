import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET â€” Return current user's role from DB
export async function GET() {
  try {
    const serverUser = await getServerUser();
    if (!serverUser) {
      return NextResponse.json({ role: null }, { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, serverUser.uid),
    });

    return NextResponse.json({
      role: dbUser?.role || null,
      fullName: dbUser?.fullName || null,
      emailVerified: dbUser?.emailVerified ?? false,
    });
  } catch {
    return NextResponse.json({ role: null }, { status: 500 });
  }
}
