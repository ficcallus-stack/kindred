import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const clerkUser = await requireUser();
  const [userRecord] = await db.select().from(users).where(eq(users.id, clerkUser.uid));
  
  if (!userRecord) return NextResponse.error();

  const isCaregiver = userRecord.role === "caregiver";

  const result = await db.query.bookings.findMany({
    where: isCaregiver ? eq(bookings.caregiverId, clerkUser.uid) : eq(bookings.parentId, clerkUser.uid),
    orderBy: [desc(bookings.createdAt)],
    with: { 
      caregiver: true,
      parent: {
        with: {
          parentProfile: true
        }
      }
    },
  });

  return NextResponse.json(result);
}
