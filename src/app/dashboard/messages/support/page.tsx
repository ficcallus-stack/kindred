import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { initiateSupportChat, getConversationMessages, getConversation } from "../actions";
import { ChatWindow } from "@/components/dashboard/ChatWindow";
import { redirect } from "next/navigation";

export default async function SupportMessageRoute() {
  const clerkUser = await requireUser();
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, clerkUser.uid),
    columns: { id: true, fullName: true, role: true }
  });

  if (!dbUser) {
    redirect("/login");
  }

  const { conversationId } = await initiateSupportChat();
  const initialMessages = await getConversationMessages(conversationId);
  const conversation = await getConversation(conversationId);
  
  return (
    <div className="flex-1 h-[calc(100vh-80px)] mt-20 flex flex-col">
      <ChatWindow 
        conversationId={conversationId}
        initialMessages={initialMessages}
        currentUser={dbUser}
        otherMember={conversation.otherMember}
        isSupport={true}
      />
    </div>
  );
}
