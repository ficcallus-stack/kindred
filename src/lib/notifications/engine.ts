import webpush from "web-push";
import { db } from "@/db";
import { notifications, broadcastNotifications, pushSubscriptions } from "@/db/schema";
import { getAblyRest } from "@/lib/ably-server";
import { sendEmail } from "@/lib/email";
import { eq } from "drizzle-orm";

// Initialize WebPush with VAPID keys
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
    webpush.setVapidDetails(
        `mailto:support@kindredcareus.com`,
        VAPID_PUBLIC,
        VAPID_PRIVATE
    );
}

interface NotificationData {
    title: string;
    message: string;
    type: string;
    linkUrl?: string;
    priority?: "normal" | "high";
}

/**
 * Kindred Pulse — The Central Notification Engine
 * Handles Direct (Personal) and Broadcast (Platform) alerts.
 */
export const Pulse = {
    /**
     * Send a targeted notification to a specific user.
     * Triggers: DB, Ably Real-time, WebPush, and Optional Email.
     */
    async sendDirect(userId: string, data: NotificationData) {
        try {
            // 1. Persist to DB for history
            const [notif] = await db.insert(notifications).values({
                userId,
                type: data.type,
                title: data.title,
                message: data.message,
                linkUrl: data.linkUrl,
            }).returning();

            // 2. Ably Real-time Push
            const ably = getAblyRest();
            if (ably) {
                const channel = ably.channels.get(`notifications:${userId}`);
                await channel.publish("new", notif);
            }

            // 3. Browser WebPush (Background)
            const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
            for (const sub of subs) {
                try {
                    await webpush.sendNotification({
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.p256dh,
                            auth: sub.auth
                        }
                    }, JSON.stringify({
                        title: data.title,
                        body: data.message,
                        url: data.linkUrl || "/dashboard/notifications",
                        icon: "/favicon.png"
                    }));
                } catch (err) {
                    console.error("WebPush failed for subscription:", sub.id, err);
                    // Handle expired subscriptions?
                }
            }

            // 4. Email (High priority or specific types)
            if (data.priority === "high") {
                // Determine template based on type (Logic to be expanded)
                // await sendEmail(...) 
            }

            return notif;
        } catch (err) {
            console.error("Pulse.sendDirect failed:", err);
            throw err;
        }
    },

    /**
     * Send a system-wide broadcast to all or specific roles.
     * Triggers: Broadcast DB, Ably Global Push.
     */
    async sendBroadcast(senderId: string, data: NotificationData & { targetRole?: "all" | "parent" | "caregiver" }) {
        try {
            // 1. Persist to Broadcast DB
            const [broadcast] = await db.insert(broadcastNotifications).values({
                senderId,
                title: data.title,
                message: data.message,
                linkUrl: data.linkUrl,
                priority: data.priority || "normal",
                targetRole: data.targetRole || "all",
            }).returning();

            // 2. Ably Global Real-time Push
            const ably = getAblyRest();
            if (ably) {
                const channel = ably.channels.get(`notifications:global`);
                await channel.publish("broadcast", broadcast);
            }

            return broadcast;
        } catch (err) {
            console.error("Pulse.sendBroadcast failed:", err);
            throw err;
        }
    }
};
