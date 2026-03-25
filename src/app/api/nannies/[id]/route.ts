import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const clerkUser = await requireUser();

  const result = await db.query.bookings.findMany({
    where: eq(bookings.parentId, clerkUser.uid),
    orderBy: [desc(bookings.createdAt)],
    with: { caregiver: true },
  });

  return NextResponse.json(result);
}
