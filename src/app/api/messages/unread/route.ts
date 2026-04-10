import { db } from "@/db";
import { messages, conversationMembers } from "@/db/schema";
import { eq, and, gt, sql, ne } from "drizzle-orm";
import { getServerUser } from "@/lib/get-server-user";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getServerUser();
    if (!user?.uid) {
      return NextResponse.json({ unreadCount: 0 }, { status: 401 });
    }

    // High-performance count of messages the user hasn't read yet
    // Condition: 
    // 1. Message belongs to a conversation where user is a member
    // 2. Message was created AFTER the user's lastReadAt timestamp
    // 3. Message was NOT sent by the current user
    const result = await db
      .select({ count: sql<number>`count(${messages.id})` })
      .from(messages)
      .innerJoin(conversationMembers, eq(messages.conversationId, conversationMembers.conversationId))
      .where(
        and(
          eq(conversationMembers.userId, user.uid),
          ne(messages.senderId, user.uid),
          sql`${messages.createdAt} > ${conversationMembers.lastReadAt}`
        )
      );

    const count = Number(result[0]?.count) || 0;

    return NextResponse.json({ 
      unreadCount: count,
      status: "success"
    });
  } catch (error: any) {
    console.error("[API] Unread Messages Error:", error.message);
    return NextResponse.json({ unreadCount: 0, error: error.message }, { status: 500 });
  }
}
