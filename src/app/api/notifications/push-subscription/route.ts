import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pushSubscriptions } from "@/db/schema";
import { getServerUser } from "@/lib/get-server-user";
import { eq } from "drizzle-orm";

/**
 * POST /api/notifications/push-subscription
 * Store or update a user's browser push subscription (VAPID).
 */
export async function POST(req: NextRequest) {
    const user = await getServerUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await req.json();
        const { endpoint, keys: { p256dh, auth } } = body;

        if (!endpoint || !p256dh || !auth) {
            return NextResponse.json({ error: "Missing subscription data" }, { status: 400 });
        }

        // Upsert logic: Update if subscription endpoint already exists for current user
        const existing = await db.select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, endpoint))
            .limit(1);

        if (existing.length > 0) {
            await db.update(pushSubscriptions)
                .set({ userId: user.uid, p256dh, auth, createdAt: new Date() })
                .where(eq(pushSubscriptions.endpoint, endpoint));
        } else {
            await db.insert(pushSubscriptions).values({
                userId: user.uid,
                endpoint,
                p256dh,
                auth
            });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("POST /api/notifications/push-subscription failed:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
