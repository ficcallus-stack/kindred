"use server";

import { db } from "@/db";
import { searchAnalytics } from "@/db/schema";

import { headers } from "next/headers";
import { GeoEngine } from "@/lib/geo";

interface SearchPayload {
  userId?: string;
  queryText: string;
  latitude?: number;
  longitude?: number;
  filtersApplied?: Record<string, any>;
  resultsCount: number;
}

export async function trackSearch(payload: SearchPayload) {
  let { latitude, longitude } = payload;
  const headerList = await headers();
  const ip = headerList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // 1. Resolve coordinates from IP if missing (Guest Pulse)
  if (!latitude || !longitude) {
    const coords = await GeoEngine.getCoordsFromIP(ip);
    if (coords) {
      latitude = coords.lat;
      longitude = coords.lng;
    }
  }

  try {
    await db.insert(searchAnalytics).values({
      userId: payload.userId,
      queryText: payload.queryText,
      latitude: latitude?.toString(),
      longitude: longitude?.toString(),
      filtersApplied: payload.filtersApplied || {},
      resultsCount: payload.resultsCount,
    });
  } catch (error) {
    console.error("[TELEMETRY] Failed to track search:", error);
  }
}
