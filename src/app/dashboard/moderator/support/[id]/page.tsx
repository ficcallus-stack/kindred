import { db } from "@/db";
import { conversations, conversationMembers } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { MaterialIcon } from "@/components/MaterialIcon";
import { notFound, redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { getConversationMessages } from "@/app/dashboard/messages/actions";
import { ChatWindow } from "@/components/dashboard/ChatWindow";
import { updateSupportChatStatus } from "@/app/dashboard/messages/actions";

export default async function SupportChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await syncUser();
  if (!user || (user.role !== "moderator" && user.role !== "admin")) redirect("/login");

  const conversation = (await db.query.conversations.findFirst({
    where: eq(conversations.id, id),
    with: {
      members: {
        with: { user: true }
      }
    }
  })) as any;

  if (!conversation || !conversation.isSupport) notFound();

  // Ensure Mod is a member so they can send Ably messages natively
  const isMember = (conversation.members as any[]).some((m: any) => m.userId === user.id);
  if (!isMember) {
    await db.insert(conversationMembers).values({
      conversationId: id,
      userId: user.id
    });
    // Optional: assign mod if unassigned
    if (!conversation.assignedModeratorId) {
      // await db.update(conversations).set({ assignedModeratorId: user.id }).where(eq(conversations.id, id));
    }
  }

  const userMember = (conversation.members as any[]).find((m: any) => m.user?.role !== "moderator" && m.user?.role !== "admin")?.user;

  const messages = await getConversationMessages(id);

  async function handleAction(formData: FormData) {
    "use server";
    const status = formData.get("status") as "open" | "closed";
    await updateSupportChatStatus(id, status);
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-hidden">
      <header className="h-16 bg-white border-b border-outline-variant/10 flex items-center justify-between px-8 shrink-0 shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <h1 className="font-headline font-black text-primary tracking-tight italic flex items-center gap-2">
            Secure Channel
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
              KC-REALTIME-{id.slice(0, 8)}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-4">Status: {conversation.supportStatus}</span>
          <form action={handleAction}>
            {conversation.supportStatus === "open" ? (
              <input type="hidden" name="status" value="closed" />
            ) : (
              <input type="hidden" name="status" value="open" />
            )}
            <button 
              type="submit" 
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                conversation.supportStatus === "open" 
                  ? "bg-green-50 text-green-700 hover:bg-green-100 border-green-200" 
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              {conversation.supportStatus === "open" ? "Resolve Chat" : "Re-open Chat"}
            </button>
          </form>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <ChatWindow 
          conversationId={id}
          initialMessages={messages}
          currentUser={user}
          otherMember={userMember}
          isSupport={true}
        />

        <aside className="w-80 bg-white border-l border-outline-variant/10 p-8 flex flex-col gap-8 hidden lg:flex overflow-y-auto shrink-0 relative z-10 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="space-y-4">
            <h3 className="font-headline font-black text-primary text-xl tracking-tighter italic">User Intelligence</h3>
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
               <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Full Name</span>
                  <p className="font-bold text-sm text-primary">{userMember?.fullName || "Unregistered"}</p>
               </div>
               <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Account Role</span>
                  <p className="font-black text-xs text-secondary uppercase tracking-widest">{userMember?.role}</p>
               </div>
               <div>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Member Since</span>
                  <p className="text-xs text-slate-500 font-medium">{userMember?.createdAt ? new Date(userMember.createdAt).toLocaleDateString() : "Just now"}</p>
               </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
