import { NextRequest, NextResponse } from "next/server";
import { Pulse } from "@/lib/notifications/engine";
import { syncUser } from "@/lib/user-sync";

/**
 * POST /api/notifications/broadcast
 * Admin-only endpoint to dispatch platform-wide alerts.
 */
export async function POST(req: NextRequest) {
    const user = await syncUser();
    
    // Authorization: Only Admin or Moderator can send broadcasts
    if (!user || ((user as any).role !== 'admin' && (user as any).role !== 'moderator')) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { title, message, linkUrl, priority, targetRole } = body;

        if (!title || !message) {
            return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
        }

        const broadcast = await Pulse.sendBroadcast(user.id, {
            title,
            message,
            type: "broadcast",
            linkUrl,
            priority: priority || "normal",
            targetRole: targetRole || "all"
        });

        return NextResponse.json(broadcast);
    } catch (err: any) {
        console.error("POST /api/notifications/broadcast failed:", err);
        return NextResponse.json({ error: err.message || "Failed to broadcast" }, { status: 500 });
    }
}
