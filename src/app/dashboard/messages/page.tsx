import { Suspense } from "react";
import MessagesClient from "./MessagesClient";
import { getServerUser } from "@/lib/get-server-user";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, conversations, conversationMembers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const serverUser = await getServerUser();
  if (!serverUser) {
    redirect("/login");
  }

  // Fetch full user record
  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, serverUser.uid),
  });

  if (!currentUser) {
    redirect("/login");
  }

  // Fetch initial conversations for this user
  const userConvos = await db.select({
    id: conversations.id,
    isSupport: conversations.isSupport,
    updatedAt: conversations.updatedAt,
    isArchived: conversationMembers.isArchived,
  })
  .from(conversations)
  .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
  .where(and(
    eq(conversationMembers.userId, currentUser.id),
    eq(conversations.isSupport, false)
  ))
  .orderBy(desc(conversations.updatedAt));

  // Fetch support conversations
  const supportConvos = await db.select({
    id: conversations.id,
    isSupport: conversations.isSupport,
    updatedAt: conversations.updatedAt,
  })
  .from(conversations)
  .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
  .where(and(
    eq(conversationMembers.userId, currentUser.id),
    eq(conversations.isSupport, true)
  ))
  .orderBy(desc(conversations.updatedAt));

  // Get other members for each conversation to show names/photos
  const enrichedConvos = await Promise.all(userConvos.map(async (convo) => {
    const members = await db.select({
      id: users.id,
      fullName: users.fullName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(conversationMembers)
    .innerJoin(users, eq(conversationMembers.userId, users.id))
    .where(and(
      eq(conversationMembers.conversationId, convo.id),
      // eq(users.id, currentUser.id) // This is wrong, we want the OTHER user
    ));
    
    const otherMember = members.find(m => m.id !== currentUser.id);
    return { ...convo, otherMember };
  }));

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading Messages...</div>}>
      <MessagesClient 
        initialConversations={enrichedConvos}
        supportConversations={supportConvos}
        currentUser={currentUser}
      />
    </Suspense>
  );
}
