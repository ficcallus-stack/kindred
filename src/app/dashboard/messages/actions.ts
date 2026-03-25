"use server";

import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { conversations, conversationMembers, messages, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendMessageSchema, createConversationSchema, type SendMessageInput, type CreateConversationInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import * as Ably from "ably";

export async function getConversations() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  // Get all conversations the user is a member of
  const memberships = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, clerkUser.id),
    with: {
      conversation: {
        with: {
          members: {
            with: {
              user: true,
            },
          },
          messages: {
            orderBy: [desc(messages.createdAt)],
            limit: 1,
          },
        },
      },
    },
  });

  return memberships.map((m) => ({
    ...m.conversation,
    otherMembers: m.conversation.members
      .filter((member) => member.userId !== clerkUser.id)
      .map((member) => member.user),
    lastMessage: m.conversation.messages[0] || null,
  }));
}

export async function getConversationMessages(conversationId: string) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  // Verify user is a member
  const membership = await db.query.conversationMembers.findFirst({
    where: and(
      eq(conversationMembers.conversationId, conversationId),
      eq(conversationMembers.userId, clerkUser.id)
    ),
  });

  if (!membership) throw new Error("Not a member of this conversation");

  const msgs = await db.query.messages.findMany({
    where: eq(messages.conversationId, conversationId),
    orderBy: [desc(messages.createdAt)],
    limit: 100,
    with: {
      sender: {
        columns: {
          id: true,
          fullName: true,
        }
      },
    },
  });
  return msgs.reverse();
}

export async function sendMessage(data: SendMessageInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const { success } = await rateLimit(`sendMessage:${clerkUser.id}`, "relaxed");
  if (!success) throw new Error("Too many messages");

  const parsed = sendMessageSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { conversationId, content } = parsed.data;

  // Verify membership
  const membership = await db.query.conversationMembers.findFirst({
    where: and(
      eq(conversationMembers.conversationId, conversationId),
      eq(conversationMembers.userId, clerkUser.id)
    ),
  });
  if (!membership) throw new Error("Not a member of this conversation");

  const [newMessage] = await db.insert(messages).values({
    conversationId,
    senderId: clerkUser.id,
    content,
  }).returning();

  // Update conversation timestamp
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  // Publish to Ably channel in real-time
  const apiKey = process.env.ABLY_API_KEY;
  if (apiKey) {
    const ably = new Ably.Rest({ key: apiKey });
    const channel = ably.channels.get(`conversation:${conversationId}`);
    
    const sender = await db.query.users.findFirst({
      where: eq(users.id, clerkUser.id),
      columns: {
        id: true,
        fullName: true,
      }
    });

    await channel.publish("message", {
      ...newMessage,
      sender,
    });
  }

  revalidatePath(`/dashboard/messages/${conversationId}`);
  revalidatePath("/dashboard/messages");
}

export async function createConversation(data: CreateConversationInput) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const parsed = createConversationSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((e) => e.message).join(", "));
  }

  const { recipientId } = parsed.data;

  // Check if a conversation already exists between these two users
  const existingMemberships = await db.query.conversationMembers.findMany({
    where: eq(conversationMembers.userId, clerkUser.id),
    with: {
      conversation: {
        with: {
          members: true,
        },
      },
    },
  });

  const existingConvo = existingMemberships.find((m) =>
    m.conversation.members.some((member) => member.userId === recipientId)
  );

  if (existingConvo) {
    return { conversationId: existingConvo.conversationId };
  }

  // Create new conversation
  const convoId = crypto.randomUUID();
  await db.insert(conversations).values({ id: convoId });
  
  await db.insert(conversationMembers).values([
    { conversationId: convoId, userId: clerkUser.id },
    { conversationId: convoId, userId: recipientId },
  ]);

  revalidatePath("/dashboard/messages");
  return { conversationId: convoId };
}
