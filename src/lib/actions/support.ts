"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { tickets, ticketMessages, conversations, conversationMembers, users, messages } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import * as Ably from "ably";

/**
 * Creates or retrieves a support ticket/conversation for the user.
 */
export async function startSupportChat(title: string, category: any = "general") {
  const clerkUser = await requireUser();

  // Check for an existing open ticket
  const existingTicket = await db.query.tickets.findFirst({
    where: and(
      eq(tickets.userId, clerkUser.uid),
      sql`${tickets.status} != 'closed'`
    ),
    with: {
      conversation: true,
    }
  });

  if (existingTicket && existingTicket.conversationId) {
    return { ticketId: existingTicket.id, conversationId: existingTicket.conversationId };
  }

  // Create new conversation
  const conversationId = crypto.randomUUID();
  await db.insert(conversations).values({
    id: conversationId,
    isSupport: true,
  });

  // Add user to conversation
  await db.insert(conversationMembers).values({
    conversationId,
    userId: clerkUser.uid,
  });

  // Create ticket
  const ticketId = crypto.randomUUID();
  await db.insert(tickets).values({
    id: ticketId,
    userId: clerkUser.uid,
    title,
    category,
    status: "open",
    priority: "medium",
    conversationId,
  });

  revalidatePath("/dashboard/messages");
  return { ticketId, conversationId };
}

/**
 * Fetches all support-related conversations for the user.
 */
export async function getSupportConversations() {
  const clerkUser = await requireUser();

  const memberships = await db.query.conversationMembers.findMany({
    where: and(
      eq(conversationMembers.userId, clerkUser.uid),
      eq(conversationMembers.isArchived, false)
    ),
    with: {
      conversation: {
        with: {
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 1,
          },
        },
      },
    },
  });

  // Filter out any peers and non-support chats
  const supportConvos = memberships.filter(m => m.conversation && (m.conversation as any).isSupport);

  return supportConvos.map(m => ({
    ...(m.conversation as any),
    lastMessage: (m.conversation as any).messages[0] || null,
  }));
}

/**
 * Sends a message within a support ticket.
 * This is effectively the same as peer-to-peer but targets a support conversation.
 */
export async function sendSupportMessage(conversationId: string, content: string) {
  const clerkUser = await requireUser();

  // Verify membership
  const membership = await db.query.conversationMembers.findFirst({
    where: and(
      eq(conversationMembers.conversationId, conversationId),
      eq(conversationMembers.userId, clerkUser.uid)
    ),
  });
  if (!membership) throw new Error("Unauthorized");

  const [newMessage] = await db.insert(messages).values({
    conversationId,
    senderId: clerkUser.uid,
    content,
  }).returning();

  // Update conversation timestamp
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  // Publish to Ably
  const apiKey = process.env.ABLY_API_KEY;
  if (apiKey) {
    const ably = new Ably.Rest({ key: apiKey });
    const channel = ably.channels.get(`conversation:${conversationId}`);
    
    const sender = await db.query.users.findFirst({
      where: eq(users.id, clerkUser.uid),
      columns: { id: true, fullName: true }
    });

    await channel.publish("message", {
      ...newMessage,
      sender,
    });
  }

  revalidatePath(`/dashboard/messages/${conversationId}`);
}
