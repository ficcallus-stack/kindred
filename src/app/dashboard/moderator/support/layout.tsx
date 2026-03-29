import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { conversations, conversationMembers, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export default async function ModeratorSupportLayout({ children }: { children: React.ReactNode }) {
  const clerkUser = await requireUser();
  const dbUser = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
  if (dbUser?.role !== "moderator" && dbUser?.role !== "admin") {
    redirect("/login");
  }

  // Fetch all support conversations
  const supportChats = await db.query.conversations.findMany({
    where: eq(conversations.isSupport, true),
    orderBy: [desc(conversations.updatedAt)],
    with: {
      members: {
        with: { user: true }
      },
      messages: {
        orderBy: [desc(conversations.createdAt)],
        limit: 1
      }
    }
  });

  return (
    <div className="flex h-[calc(100vh-120px)] -mt-6 -mx-8 bg-surface-container-lowest border-y border-outline-variant/10 overflow-hidden">
      {/* Left Panel - Chat List */}
      <aside className="w-80 border-r border-outline-variant/10 flex flex-col bg-white shrink-0">
        <div className="p-6 border-b border-outline-variant/10 bg-surface-container-lowest/50 backdrop-blur-md">
          <h2 className="font-headline font-black text-2xl text-primary tracking-tight italic">Support Hub</h2>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">Real-time Encrypted</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
          {supportChats.length > 0 ? supportChats.map((chat) => {
            const userMember = chat.members.find(m => m.user?.role !== "moderator" && m.user?.role !== "admin")?.user;
            const isAssigned = chat.assignedModeratorId === clerkUser.uid;

            return (
              <Link
                key={chat.id}
                href={`/dashboard/moderator/support/${chat.id}`}
                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-colors group cursor-pointer border border-transparent hover:border-primary/10"
              >
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors uppercase">
                    {userMember?.fullName?.charAt(0) || "?"}
                  </div>
                  {chat.supportStatus === "open" && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white pointer-events-none animate-pulse"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm text-primary truncate max-w-[120px]">{userMember?.fullName || "User"}</h4>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                      chat.supportStatus === "open" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    )}>
                      {chat.supportStatus}
                    </span>
                    {isAssigned && (
                      <span className="text-[9px] font-black uppercase tracking-widest text-secondary flex items-center gap-0.5">
                        <MaterialIcon name="star" className="text-[10px]" fill /> Assigned
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            )
          }) : (
            <div className="py-12 flex flex-col items-center justify-center text-slate-300">
              <MaterialIcon name="chat_bubble_outline" className="text-4xl mb-3" />
              <p className="text-xs font-black uppercase tracking-widest">No Active Chats</p>
            </div>
          )}
        </div>
      </aside>

      {/* Right Panel - Dynamic Content */}
      <main className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        {children}
      </main>
    </div>
  );
}
