import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { getConversations } from "./actions";
import { getSupportConversations } from "@/lib/actions/support";
import MessagesClient from "./MessagesClient";

export const metadata = {
  title: "Message Center | KindredCare US",
  description: "Secure, real-time messaging with nannies and support.",
};

export default async function MessagesPage() {
  const user = await syncUser();
  if (!user) redirect("/login");

  const [conversations, supportConversations] = await Promise.all([
    getConversations(),
    getSupportConversations(),
  ]);

  return (
    <MessagesClient 
      initialConversations={conversations} 
      supportConversations={supportConversations} 
      currentUser={user}
    />
  );
}
