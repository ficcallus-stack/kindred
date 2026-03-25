import { NextResponse } from "next/server";
import { syncUser } from "@/lib/user-sync";
import * as Ably from "ably";

export async function GET() {
  const user = await syncUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Ably API Key not configured" }, { status: 500 });
  }

  const client = new Ably.Rest({ key: apiKey });

  try {
    // Generate token request
    const tokenRequestData = await client.auth.createTokenRequest({
      clientId: user.id, // Identify-based tracking Presence
    });
    return NextResponse.json(tokenRequestData);
  } catch (err) {
    console.error("Ably Auth Error:", err);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
