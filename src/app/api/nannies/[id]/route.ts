import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: { nannyProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    hourlyRate: user.nannyProfile?.hourlyRate || null,
    bio: user.nannyProfile?.bio || null,
    location: user.nannyProfile?.location || null,
    experienceYears: user.nannyProfile?.experienceYears || null,
    isVerified: user.nannyProfile?.isVerified || false,
  });
}
