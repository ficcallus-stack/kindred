import { getOrCreateConversation } from "../../actions";
import { redirect } from "next/navigation";

export default async function MessageUserRedirect({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  
  // Resolve or create conversation
  const convoId = await getOrCreateConversation(userId);
  
  // Redirect to the direct chat URL
  redirect(`/dashboard/messages/${convoId}`);
}
