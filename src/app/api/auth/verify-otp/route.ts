import { NextRequest, NextResponse } from "next/server";
import { getServerUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { emailOtps, users } from "@/db/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { sendWelcomeEmail } from "@/lib/email";

// POST — Verify OTP code
export async function POST(request: NextRequest) {
  try {
    const serverUser = await getServerUser();
    if (!serverUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await request.json();
    if (!code || code.length !== 6) {
      return NextResponse.json({ error: "Invalid code format" }, { status: 400 });
    }

    const email = serverUser.email;
    if (!email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    // Find most recent valid OTP for this email
    const otp = await db.query.emailOtps.findFirst({
      where: and(
        eq(emailOtps.email, email),
        eq(emailOtps.code, code),
        gt(emailOtps.expiresAt, new Date())
      ),
      orderBy: [desc(emailOtps.createdAt)],
    });

    if (!otp) {
      // Increment attempts on latest OTP for rate limiting
      return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    }

    // Mark user as email verified
    await db.update(users)
      .set({ emailVerified: true })
      .where(eq(users.id, serverUser.uid));

    // Clean up used OTPs
    await db.delete(emailOtps).where(eq(emailOtps.email, email));

    // Send welcome email
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, serverUser.uid),
    });
    if (dbUser) {
      await sendWelcomeEmail(email, dbUser.fullName || "there", dbUser.role || "parent");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
