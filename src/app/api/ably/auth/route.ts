import Ably from "ably";
import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getServerUser } from "@/lib/get-server-user";

/**
 * Modern Handshake: Authorization via Bearer Token
 * This follows the exact pattern from the user's working reference project.
 * It bypasses cookie-related 400 XHR errors by using the explicit Firebase ID token.
 */
export async function POST(req: Request) {
  const start = Date.now();
  const keyPrefix = process.env.ABLY_API_KEY?.split(':')[0] || "MISSING";

  // 1. Get Token from Headers
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("[ABLY AUTH] Missing or invalid Authorization Header");
    return new Response(JSON.stringify({ 
      error: "Missing authorization token",
      receivedHeader: authHeader ? "Present but invalid" : "Missing"
    }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    // 2. Verify with Firebase Admin (Client-side identity)
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // 3. Ghost Protocol Check: Prioritize Server-side Session (The Impersonated Identity)
    // This resolves the clientId mismatch during impersonation.
    const serverUser = await getServerUser();
    const clientId = serverUser?.uid || decodedToken.uid;

    if (!clientId) throw new Error("No client ID found in session or token");
    
    if (serverUser && serverUser.uid !== decodedToken.uid) {
      console.log(`[ABLY AUTH] Ghost Protocol Active: Impersonating ${serverUser.uid} (Authenticated as ${decodedToken.uid})`);
    }

    // 4. Generate Token Details using Ably.Rest (Server-to-Ably)
    // This is much more robust for VPNs/Firewalls than createTokenRequest
    const client = new Ably.Rest({
      key: process.env.ABLY_API_KEY!,
      queryTime: true
    });
    
    const tokenDetails = await client.auth.requestToken({ clientId });

    const duration = Date.now() - start;
    
    return NextResponse.json(tokenDetails, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });

  } catch (err: any) {
    console.error("[ABLY AUTH] Handshake Failed:", err.message);
    return NextResponse.json({ error: "Unauthorized", details: err.message }, { status: 403 });
  }
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'https://kindredcareus.com',
    'https://www.kindredcareus.com'
  ];

  const headerOrigin = (origin && allowedOrigins.includes(origin)) ? origin : allowedOrigins[1];

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': headerOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
