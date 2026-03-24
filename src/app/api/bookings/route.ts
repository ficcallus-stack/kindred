import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) return NextResponse.json([], { status: 401 });

  const result = await db.query.bookings.findMany({
    where: eq(bookings.parentId, clerkUser.id),
    orderBy: [desc(bookings.createdAt)],
    with: { caregiver: true },
  });

  return NextResponse.json(result);
}
