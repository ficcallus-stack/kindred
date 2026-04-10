import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { adminAuth } from "@/lib/firebase-admin";

// POST â€” Create session cookie from ID token
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    
    // Ghost Guard: If impersonating, DO NOT overwrite the swapped session with the admin's original token from the client SDK.
    const isImpersonating = !!request.cookies.get("admin_session_backup")?.value;
    if (isImpersonating) {
      console.log("[Ghost Guard] Skipping session sync (Protocol Active)");
      return NextResponse.json({ status: "skipped", reason: "ghost_protocol_active" });
    }

    // Create session cookie valid for 14 days
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ status: "success" });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

// DELETE â€” Clear session cookie
export async function DELETE() {
  const response = NextResponse.json({ status: "success" });
  response.cookies.set("session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
