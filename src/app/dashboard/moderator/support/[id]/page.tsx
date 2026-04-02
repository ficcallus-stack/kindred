import { db } from "@/db";
import { conversations, conversationMembers, users, parentProfiles, nannyProfiles, children, careTeam, bookings, payments, messages as messagesTable } from "@/db/schema";
import { eq, and, desc, or, sum } from "drizzle-orm";
import { MaterialIcon } from "@/components/MaterialIcon";
import { notFound, redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { getConversationMessages } from "@/app/dashboard/messages/actions";
import { ChatWindow } from "@/components/dashboard/ChatWindow";
import { ModeratorIntelligence } from "@/components/dashboard/ModeratorIntelligence";
import { ModeratorSupportSidebar } from "@/components/dashboard/ModeratorSupportSidebar";
import { ResolveTicketButton } from "@/components/dashboard/ResolveTicketButton";
import Image from "next/image";
import { format } from "date-fns";

export default async function SupportChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await syncUser();
  if (!user || (user.role !== "moderator" && user.role !== "admin")) redirect("/login");

  // 1. Fetch current support conversation
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, id),
    with: {
      members: {
        with: { user: true }
      }
    }
  });

  if (!conversation || !conversation.isSupport) notFound();

  // 2. Fetch all support conversations for Sidebar (Column 1)
  const allSupportConvos = await db.query.conversations.findMany({
    where: eq(conversations.isSupport, true),
    orderBy: [desc(conversations.updatedAt)],
    with: {
      members: {
        with: { user: true }
      },
      messages: { limit: 1, orderBy: [desc(messagesTable.createdAt)] }
    }
  });

  // 3. User Intelligence (Column 3)
  const userMember = conversation.members.find((m: any) => m.user?.role !== "moderator" && m.user?.role !== "admin")?.user;
  if (!userMember) notFound();

  let profileDetails: any = null;
  let childrenList: any[] = [];
  
  if (userMember.role === "parent") {
    profileDetails = await db.query.parentProfiles.findFirst({
      where: eq(parentProfiles.id, userMember.id)
    });
    childrenList = await db.query.children.findMany({
      where: eq(children.parentId, userMember.id)
    });
  } else if (userMember.role === "caregiver") {
    profileDetails = await db.query.nannyProfiles.findFirst({
      where: eq(nannyProfiles.id, userMember.id)
    });
  }

  // Financial Stats: Lifetime Spend
  const lifetimeSpendResult = await db.select({ 
    total: sum(payments.amount) 
  })
  .from(payments)
  .where(and(
    eq(payments.userId, userMember.id),
    eq(payments.status, 'captured')
  ));
  
  const lifetimeSpend = Number(lifetimeSpendResult[0]?.total || 0);

  // Care Team Activity
  const careCircle = await db.select({
    id: users.id,
    fullName: users.fullName,
    profileImageUrl: users.profileImageUrl,
    status: careTeam.status,
    role: users.role
  })
  .from(careTeam)
  .innerJoin(users, eq(userMember.role === 'parent' ? careTeam.caregiverId : careTeam.parentId, users.id))
  .where(eq(userMember.role === 'parent' ? careTeam.parentId : careTeam.caregiverId, userMember.id));

  // Consolidated Timeline
  const recentBookings = await db.query.bookings.findMany({
    where: or(eq(bookings.parentId, userMember.id), eq(bookings.caregiverId, userMember.id)),
    orderBy: [desc(bookings.createdAt)],
    limit: 5
  });

  const recentPayments = await db.query.payments.findMany({
    where: eq(payments.userId, userMember.id),
    orderBy: [desc(payments.createdAt)],
    limit: 5
  });

  const messages = await getConversationMessages(id);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f8faff]">
      {/* TopNavBar */}
      <header className="bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex justify-between items-center w-full px-6 h-16 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-blue-950 tracking-tight">Moderator Hub</span>
          <nav className="hidden md:flex gap-6 items-center h-full pt-1">
            <a className="font-headline font-medium text-slate-500 hover:text-blue-700 transition-colors" href="/dashboard/moderator/support">Overview</a>
            <a className="font-headline font-medium text-blue-900 border-b-2 border-blue-900 pb-1" href="/dashboard/moderator/support/tickets">Support Intelligence</a>
            <a className="font-headline font-medium text-slate-500 hover:text-blue-700 transition-colors" href="#">Insights</a>
            <a className="font-headline font-medium text-slate-500 hover:text-blue-700 transition-colors" href="#">Audits</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
            <MaterialIcon name="notifications" />
          </button>
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
            <MaterialIcon name="settings" />
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
             <MaterialIcon name="person" className="text-slate-400" />
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* SideNavBar */}
        <aside className="bg-slate-100 w-20 flex flex-col items-center py-8 gap-8 shrink-0 border-r border-slate-200">
           <div className="flex flex-col items-center gap-1">
             <span className="font-black text-blue-950 text-xs italic tracking-tighter">Kindred</span>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">INTEL</span>
           </div>
           
           <div className="flex flex-col gap-6 flex-1 pt-4">
             {/* Tab 1: Overview */}
             <a 
               href="/dashboard/moderator/support"
               title="Hub Overview" 
               className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-200 rounded-xl transition-all"
             >
               <MaterialIcon name="grid_view" />
             </a>

             {/* Tab 2: Support Queue (Active) */}
             <a 
               href="/dashboard/moderator/support/tickets"
               title="Support Queue" 
               className="w-12 h-12 flex items-center justify-center bg-white text-blue-900 rounded-xl shadow-sm scale-110 duration-200 border border-slate-200/50"
             >
               <MaterialIcon name="support_agent" />
             </a>
           </div>
           
           <div className="flex flex-col gap-4 mb-4">
             <button title="Recent activity" className="text-slate-400 hover:text-blue-900 transition-colors"><MaterialIcon name="history" /></button>
           </div>
        </aside>

        <div className="flex-1 flex overflow-hidden">
          {/* Column 1: Conversations List - Fixed Width */}
          <ModeratorSupportSidebar 
            conversations={allSupportConvos} 
            activeId={id} 
          />

          {/* Column 2: Chat Window - Fluid */}
          <section className="flex-1 bg-white flex flex-col relative overflow-hidden border-r border-slate-100">
             {/* Dynamic Chat Header */}
             <div className="h-20 px-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-sm z-10">
                <div className="flex items-center gap-4">
                   <div className="relative">
                       {userMember.profileImageUrl ? (
                           <Image 
                               src={userMember.profileImageUrl} 
                               alt={userMember.fullName} 
                               width={40} 
                               height={40} 
                               className="rounded-2xl border border-slate-100 shadow-sm"
                           />
                       ) : (
                           <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center font-bold text-primary border border-outline-variant/10">
                               {userMember.fullName.charAt(0)}
                           </div>
                       )}
                       <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></span>
                   </div>
                   <div>
                      <h3 className="font-bold text-primary flex items-center gap-2">
                        {userMember.fullName}
                      </h3>
                      <span className="text-[10px] text-on-surface-variant flex items-center gap-1 uppercase font-black tracking-widest mt-1">
                         ID: #USR-{userMember.id.slice(0, 8)} • Member since {format(new Date(userMember.createdAt), "yyyy")}
                      </span>
                   </div>
                </div>
                <div className="flex gap-2">
                   <ResolveTicketButton conversationId={id} />
                   <button className="p-2.5 text-slate-400 hover:text-primary transition-colors bg-slate-50 rounded-xl"><MaterialIcon name="more_vert" /></button>
                </div>
             </div>

             <ChatWindow 
                conversationId={id}
                initialMessages={messages}
                currentUser={user}
                otherMember={userMember}
                isSupport={true}
             />
          </section>

          {/* Column 3: Intelligence Panel */}
          <ModeratorIntelligence 
            user={userMember}
            profile={profileDetails}
            childrenList={childrenList}
            careCircle={careCircle}
            bookings={recentBookings}
            payments={recentPayments}
            lifetimeSpend={lifetimeSpend}
          />
        </div>
      </main>
    </div>
  );
}
