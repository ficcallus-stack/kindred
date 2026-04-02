import { getServerUser } from "@/lib/get-server-user";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users, conversations, conversationMembers, bookings, chatUnlocks, applications, jobs } from "@/db/schema";
import { eq, and, desc, or, inArray, sql } from "drizzle-orm";
import MessagesLayoutClient from "./MessagesLayoutClient";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const serverUser = await getServerUser();
  if (!serverUser) {
    redirect("/login");
  }

  const currentUser = await db.query.users.findFirst({
    where: eq(users.id, serverUser.uid),
  });

  if (!currentUser) {
    redirect("/login");
  }

  // 1. Get existing conversations (with last message)
  const existingConvos = await db.select({
    id: conversations.id,
    isSupport: conversations.isSupport,
    updatedAt: conversations.updatedAt,
    lastMessage: sql<string>`(SELECT content FROM messages WHERE messages.conversation_id = ${conversations.id} ORDER BY created_at DESC LIMIT 1)`,
  })
  .from(conversations)
  .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
  .where(and(
    eq(conversationMembers.userId, currentUser.id),
    eq(conversations.isSupport, false)
  ))
  .orderBy(desc(conversations.updatedAt));

  // 2. Get contact IDs from Bookings, Unlocks, and Applications
  const allContactIds = new Set<string>();
  
  if (currentUser.role === 'parent') {
    const parentBookings = await db.select({ id: bookings.caregiverId }).from(bookings).where(eq(bookings.parentId, currentUser.id));
    const parentUnlocks = await db.select({ id: chatUnlocks.caregiverId }).from(chatUnlocks).where(eq(chatUnlocks.parentId, currentUser.id));
    const parentApplications = await db.select({ id: applications.caregiverId })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(jobs.parentId, currentUser.id));

    parentBookings.forEach(b => allContactIds.add(b.id));
    parentUnlocks.forEach(u => allContactIds.add(u.id));
    parentApplications.forEach(a => allContactIds.add(a.id));
  } else {
    const caregiverBookings = await db.select({ id: bookings.parentId }).from(bookings).where(eq(bookings.caregiverId, currentUser.id));
    const caregiverUnlocks = await db.select({ id: chatUnlocks.parentId }).from(chatUnlocks).where(eq(chatUnlocks.caregiverId, currentUser.id));
    const caregiverApplications = await db.select({ id: jobs.parentId })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.caregiverId, currentUser.id));

    caregiverBookings.forEach(b => allContactIds.add(b.id));
    caregiverUnlocks.forEach(u => allContactIds.add(u.id));
    caregiverApplications.forEach(a => allContactIds.add(a.id));
  }

  // 3. Get existing conversation partner IDs and deduplicate real conversations
  const activePartnerIds = new Set<string>();
  const uniqueEnrichedConvos: any[] = [];
  
  for (const convo of existingConvos) {
    const members = await db.select({
      id: users.id,
      fullName: users.fullName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(conversationMembers)
    .innerJoin(users, eq(conversationMembers.userId, users.id))
    .where(eq(conversationMembers.conversationId, convo.id));
    
    const otherMember = members.find(m => m.id !== currentUser.id);
    if (otherMember) {
      if (!activePartnerIds.has(otherMember.id)) {
        activePartnerIds.add(otherMember.id);
        uniqueEnrichedConvos.push({ ...convo, otherMember });
      }
    }
  }

  // 4. Identify "Available" contacts (no conversation yet)
  const remainingContactIds = Array.from(allContactIds).filter(id => !activePartnerIds.has(id));
  
  let availableContacts: any[] = [];
  if (remainingContactIds.length > 0) {
    availableContacts = await db.select({
      id: users.id,
      fullName: users.fullName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(users)
    .where(inArray(users.id, remainingContactIds));
  }

  // Map available contacts to "pseudo-conversations"
  const pseudoConvos = availableContacts.map(user => ({
    id: `new-${user.id}`, // Temporary ID prefix
    isSupport: false,
    updatedAt: new Date(0), // Sort to bottom
    otherMember: user,
    isPseudo: true
  }));

  const allConvos = [...uniqueEnrichedConvos, ...pseudoConvos].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  const supportConvos = await db.select({
    id: conversations.id,
    isSupport: conversations.isSupport,
    assignedModeratorId: conversations.assignedModeratorId,
    supportStatus: conversations.supportStatus,
    updatedAt: conversations.updatedAt,
    moderatorName: users.fullName,
    moderatorImage: users.profileImageUrl
  })
  .from(conversations)
  .leftJoin(users, eq(conversations.assignedModeratorId, users.id))
  .innerJoin(conversationMembers, eq(conversations.id, conversationMembers.conversationId))
  .where(and(
    eq(conversationMembers.userId, currentUser.id),
    eq(conversations.isSupport, true)
  ));

  const contactIdsArray = Array.from(allContactIds);

  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-headline font-black italic text-[#031f41]">Kindred Syncing...</div>}>
      <MessagesLayoutClient 
        currentUser={currentUser}
        initialConversations={allConvos}
        supportConversations={supportConvos}
        contactIds={contactIdsArray}
      >
        {children}
      </MessagesLayoutClient>
    </Suspense>
  );
}
