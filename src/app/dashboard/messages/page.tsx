import { redirect } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { syncUser } from "@/lib/user-sync";
import { getConversations } from "./actions";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Messages | KindredCare US",
  description: "Your messages and conversations",
};

export default async function MessagesPage() {
  const user = await syncUser();
  if (!user) redirect("/login");

  const conversations = await getConversations();

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="font-headline text-4xl font-black text-primary tracking-tighter">Messages</h1>
          <p className="text-on-surface-variant text-sm font-medium mt-2">
            {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
          </p>
        </header>

        <div className="space-y-4">
          {conversations.length > 0 ? (
            conversations.map((convo: any) => {
              const otherUser = convo.otherMembers[0];
              const lastMsg = convo.lastMessage;

              return (
                <Link
                  key={convo.id}
                  href={`/dashboard/messages/${convo.id}`}
                  className="flex items-center gap-6 p-6 bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/5 hover:shadow-xl hover:border-outline-variant/15 transition-all group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="font-black text-xl text-primary">
                      {otherUser?.fullName?.charAt(0) || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-headline font-bold text-primary text-lg truncate">
                      {otherUser?.fullName || "Unknown"}
                    </h3>
                    <p className="text-on-surface-variant text-sm truncate opacity-60">
                      {lastMsg?.content || "No messages yet"}
                    </p>
                  </div>
                  {lastMsg && (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                      {new Date(lastMsg.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  <MaterialIcon name="chevron_right" className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </Link>
              );
            })
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 italic">
              <MaterialIcon name="chat_bubble_outline" className="text-7xl mb-6" />
              <p className="font-headline font-bold text-2xl text-primary">No conversations yet</p>
              <p className="text-sm">Messages will appear here once you start chatting with a nanny or family.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
