import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { getConversation, getConversations, getConversationMessages } from "../actions";
import { getSupportConversations } from "@/lib/actions/support";
import ConversationClient from "../ConversationClient";

export const metadata = {
  title: "Conversation | KindredCare US",
  description: "Secure, real-time messaging.",
};

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await syncUser();
  if (!user) redirect("/login");

  const [conversation, messages, conversations, supportConversations] = await Promise.all([
    getConversation(id),
    getConversationMessages(id),
    getConversations(),
    getSupportConversations(),
  ]);

  if (!conversation) redirect("/dashboard/messages");

  return (
    <ConversationClient 
      conversation={conversation} 
      messages={messages}
      conversations={conversations}
      supportConversations={supportConversations}
      currentUser={user}
      otherMember={conversation.otherMember}
    />
  );
}
