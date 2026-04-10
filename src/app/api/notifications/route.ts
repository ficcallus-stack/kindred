import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { notifications, broadcastNotifications, userBroadcastReads, users } from "@/db/schema";
import { getServerUser } from "@/lib/get-server-user";
import { eq, and, or, desc, isNull, ne, sql } from "drizzle-orm";

/**
 * GET /api/notifications
 * Fetch all personal and platform alerts for the current session user.
 */
export async function GET() {
    const serverUser = await getServerUser();
    if (!serverUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Fetch full user for role-based broadcasts
        const user = await db.query.users.findFirst({
            where: eq(users.id, serverUser.uid)
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 1. Fetch personal notifications
        const personal = await db.select()
            .from(notifications)
            .where(eq(notifications.userId, user.id))
            .orderBy(desc(notifications.createdAt))
            .limit(50);

        // 2. Fetch broadcast notifications for user role
        const broadcasts = await db.select({
            id: broadcastNotifications.id,
            title: broadcastNotifications.title,
            message: broadcastNotifications.message,
            linkUrl: broadcastNotifications.linkUrl,
            priority: broadcastNotifications.priority,
            createdAt: broadcastNotifications.createdAt,
            type: sql<string>`'broadcast'`,
            isRead: sql<boolean>`CASE WHEN ${userBroadcastReads.readAt} IS NOT NULL THEN TRUE ELSE FALSE END`
        })
        .from(broadcastNotifications)
        .leftJoin(userBroadcastReads, and(
            eq(userBroadcastReads.broadcastId, broadcastNotifications.id),
            eq(userBroadcastReads.userId, user.id)
        ))
        .where(
            or(
                eq(broadcastNotifications.targetRole, "all"),
                eq(broadcastNotifications.targetRole, user.role || "all")
            )
        )
        .orderBy(desc(broadcastNotifications.createdAt))
        .limit(20);

        // Combine and sort by createdAt
        const all = [...personal, ...broadcasts]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(all);
    } catch (err: any) {
        console.error("GET /api/notifications failed:", err.message);
        return NextResponse.json({ error: "Database failure", details: err.message }, { status: 500 });
    }
}

/**
 * PATCH /api/notifications (Bulk Read)
 * Mark all notifications as read.
 */
export async function PATCH() {
    const serverUser = await getServerUser();
    if (!serverUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, serverUser.uid)
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Mark all personal as read
        await db.update(notifications)
            .set({ isRead: true })
            .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

        // Handle broadcasts: Insert read markers for all unread broadcasts
        const unreadBroadcasts = await db.select({ id: broadcastNotifications.id })
            .from(broadcastNotifications)
            .leftJoin(userBroadcastReads, and(
                eq(userBroadcastReads.broadcastId, broadcastNotifications.id),
                eq(userBroadcastReads.userId, user.id)
            ))
            .where(and(
                or(eq(broadcastNotifications.targetRole, "all"), eq(broadcastNotifications.targetRole, user.role || "all")),
                isNull(userBroadcastReads.readAt)
            ));

        for (const b of unreadBroadcasts) {
            await db.insert(userBroadcastReads).values({
                userId: user.id,
                broadcastId: b.id,
                readAt: new Date()
            }).onConflictDoNothing();
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("PATCH /api/notifications failed:", err.message);
        return NextResponse.json({ error: "Failure marking as read", details: err.message }, { status: 500 });
    }
}
