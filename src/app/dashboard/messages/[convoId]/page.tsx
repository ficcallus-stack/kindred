import { getServerUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { conversations, conversationMembers, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import ChatClientWrapper from "./ChatClientWrapper";

export default async function ConversationPage({ params }: { params: Promise<{ convoId: string }> }) {
  const { convoId } = await params;
  const serverUser = await getServerUser();
  if (!serverUser) return null;

  const convo = await db.query.conversations.findFirst({
    where: eq(conversations.id, convoId),
  });

  if (!convo) notFound();

  // Get other member info
  const members = await db.select({
    id: users.id,
    fullName: users.fullName,
    profileImageUrl: users.profileImageUrl,
  })
  .from(conversationMembers)
  .innerJoin(users, eq(conversationMembers.userId, users.id))
  .where(eq(conversationMembers.conversationId, convoId));

  const otherMember = members.find(m => m.id !== serverUser.uid);

  const enrichedConvo = {
    ...convo,
    otherMember
  };

  return <ChatClientWrapper convo={enrichedConvo} />;
}
