import { NextResponse } from "next/server";
import { db } from "@/db";
import { searchAnalytics } from "@/db/schema";
import { getServerUser } from "@/lib/get-server-user";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { queryText, filtersApplied, resultsCount } = body;

    // We do not strict require auth for searches (guests can search)
    let userId = null;
    try {
      const user = await getServerUser();
      if (user?.uid) userId = user.uid;
    } catch {
      // Ignore: anonymous user
    }

    if (!queryText) {
      return NextResponse.json({ error: "Missing queryText" }, { status: 400 });
    }

    const inserted = await db.insert(searchAnalytics).values({
      userId,
      queryText,
      filtersApplied: filtersApplied || {},
      resultsCount: resultsCount || 0,
      convertedToContact: false,
    }).returning();

    return NextResponse.json({ success: true, trackingId: inserted[0]?.id });
  } catch (error: any) {
    console.error("Search Analytics tracking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
