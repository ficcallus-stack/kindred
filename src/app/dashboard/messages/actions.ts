"use server";

import { db } from "@/db";
import { users, conversations, conversationMembers, messages } from "@/db/schema";
import { eq, and, or, desc, ne } from "drizzle-orm";
import { getServerUser } from "@/lib/get-server-user";

export async function getUsers() {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  // Fetch all users except the current one (for testing/simplicity in this stage)
  return await db.query.users.findMany({
    where: ne(users.id, serverUser.uid),
    limit: 50,
  });
}

export async function getConversationMessages(conversationId: string) {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  return await db.select({
    id: messages.id,
    content: messages.content,
    senderId: messages.senderId,
    imageUrl: messages.imageUrl,
    createdAt: messages.createdAt,
  })
  .from(messages)
  .where(eq(messages.conversationId, conversationId))
  .orderBy(desc(messages.createdAt))
  .limit(100);
}

export async function sendMessage({ 
  conversationId, 
  content, 
  imageUrl 
}: { 
  conversationId: string; 
  content: string; 
  imageUrl?: string;
}) {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  const [newMessage] = await db.insert(messages).values({
    conversationId,
    senderId: serverUser.uid,
    content,
    imageUrl,
  }).returning();

  // Update conversation timestamp
  await db.update(conversations)
    .set({ updatedAt: new Date() })
    .where(eq(conversations.id, conversationId));

  return newMessage;
}

export async function getOrCreateConversation(otherUserId: string) {
  const serverUser = await getServerUser();
  if (!serverUser) throw new Error("Unauthorized");

  const myId = serverUser.uid;

  if (otherUserId === "kindred-support") {
    // Check for existing support convo for this user
    const existingSupport = await db.select({ id: conversations.id })
      .from(conversations)
      .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
      .where(and(
        eq(conversationMembers.userId, myId),
        eq(conversations.isSupport, true)
      ))
      .limit(1);

    if (existingSupport.length > 0) return existingSupport[0].id;

    const [newConvo] = await db.insert(conversations).values({
      isSupport: true,
    }).returning();

    await db.insert(conversationMembers).values({
      conversationId: newConvo.id,
      userId: myId,
    });

    return newConvo.id;
  }

  // 1. Find if a direct conversation already exists between these two
  const existingConvos = await db.select({
    id: conversations.id
  })
  .from(conversations)
  .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
  .where(and(
    eq(conversationMembers.userId, myId),
    eq(conversations.isSupport, false)
  ));

  for (const convo of existingConvos) {
    const members = await db.select()
      .from(conversationMembers)
      .where(and(
        eq(conversationMembers.conversationId, convo.id),
        eq(conversationMembers.userId, otherUserId)
      ));
    
    if (members.length > 0) {
      return convo.id;
    }
  }

  // 2. If not, create a new one
  const [newConvo] = await db.insert(conversations).values({
    isSupport: false,
  }).returning();

  await db.insert(conversationMembers).values([
    { conversationId: newConvo.id, userId: myId },
    { conversationId: newConvo.id, userId: otherUserId },
  ]);

  return newConvo.id;
}
