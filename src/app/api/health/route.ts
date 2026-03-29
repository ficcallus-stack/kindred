import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();

  try {
    // Ping the database with a simple query
    await db.execute(sql`SELECT 1`);
    const dbLatencyMs = Date.now() - start;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "0.1.0",
        uptime: process.uptime(),
        checks: {
          database: { status: "connected", latencyMs: dbLatencyMs },
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || "0.1.0",
        checks: {
          database: { status: "unreachable", error: error.message },
        },
      },
      { status: 503 }
    );
  }
}
