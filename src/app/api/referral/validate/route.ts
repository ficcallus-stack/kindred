import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ valid: false, error: "Missing code" }, { status: 400 });
  }

  try {
    const referrer = await db.query.users.findFirst({
      where: eq(users.referralCode, code.toUpperCase()),
    });

    if (referrer) {
      return NextResponse.json({ valid: true, name: referrer.fullName });
    } else {
      return NextResponse.json({ valid: false, error: "Invalid referral code" });
    }
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json({ valid: false, error: "Internal server error" }, { status: 500 });
  }
}
