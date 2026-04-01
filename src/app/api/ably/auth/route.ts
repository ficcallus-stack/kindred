import { NextResponse, NextRequest } from "next/server";
import { getServerUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import * as Ably from "ably";

export const dynamic = "force-dynamic";

/**
 * Optimized Ably Token Authentication.
 * Reduces handshake time by using direct session verification instead of full syncUser.
 */
async function handleAuth(req: Request) {
  const url = new URL(req.url);
  console.log(`[ABLY AUTH] ${req.method} ${url.pathname} Hit`);
  
  // 1. Direct session check (Very fast, ~200-300ms)
  const serverUser = await getServerUser();
  
  if (!serverUser) {
    console.warn(`[ABLY AUTH] Unauthorized: No active session for ${req.method} request.`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log(`[ABLY AUTH] Authenticating user: ${serverUser.uid}`);

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    console.error("[ABLY AUTH] CRITICAL: ABLY_API_KEY is missing from environment variables.");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  if (apiKey === "your_api_key_here") {
    console.error("[ABLY AUTH] CRITICAL: ABLY_API_KEY is still using the placeholder value.");
    return NextResponse.json({ error: "Server Configuration Error" }, { status: 500 });
  }

  try {
    const client = new Ably.Rest({ key: apiKey });
    
    // Generate token request
    // We use the UID directly from the session to ensure sub-500ms handshake
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: serverUser.uid,
    });

    console.log(`[ABLY AUTH] Token generated successfully for client: ${serverUser.uid}`);
    
    return NextResponse.json(tokenRequestData);
  } catch (err: any) {
    console.error("[ABLY AUTH] Internal Failure generating token:", err.message);
    if (err.code) console.error(`[ABLY AUTH] Ably Error Code: ${err.code}`);
    return NextResponse.json({ error: "Failed to generate token", details: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handleAuth(req);
}

export async function POST(req: Request) {
  return handleAuth(req);
}
