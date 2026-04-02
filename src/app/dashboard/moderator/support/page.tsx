import { db } from "@/db";
import { conversations, users, payments, bookings, messages as messagesTable } from "@/db/schema";
import { eq, and, isNull, desc, gt, count, sql } from "drizzle-orm";
import { MaterialIcon } from "@/components/MaterialIcon";
import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { ModeratorSupportSidebar } from "@/components/dashboard/ModeratorSupportSidebar";
import { format } from "date-fns";

export default async function SupportOverviewPage() {
  const user = await syncUser();
  if (!user || (user.role !== "moderator" && user.role !== "admin")) redirect("/login");

  // 1. Fetch moderator specific tickets (Assigned to me)
  const myTickets = await db.query.conversations.findMany({
    where: and(
      eq(conversations.isSupport, true),
      eq(conversations.assignedModeratorId, user.id),
      eq(conversations.supportStatus, "open")
    ),
    with: {
      members: { with: { user: true } },
      messages: { limit: 1, orderBy: [desc(messagesTable.createdAt)] }
    },
    orderBy: [desc(conversations.updatedAt)]
  });

  // 2. Fetch global pending tickets (Not assigned yet)
  const pendingTickets = await db.query.conversations.findMany({
    where: and(
      eq(conversations.isSupport, true),
      isNull(conversations.assignedModeratorId),
      eq(conversations.supportStatus, "open")
    ),
    with: {
      members: { with: { user: true } },
      messages: { limit: 1, orderBy: [desc(messagesTable.createdAt)] }
    },
    orderBy: [desc(conversations.updatedAt)]
  });

  // 3. Platform Health Metrics
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  const onlineUsersCountResult = await db.select({ value: count() }).from(users).where(gt(users.lastActive, tenMinutesAgo));
  const totalUsersCountResult = await db.select({ value: count() }).from(users);
  
  const onlineUsers = onlineUsersCountResult[0].value;
  const totalUsers = totalUsersCountResult[0].value;

  // 4. Financial Velocity (Last 24h)
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dailyRevResult = await db.select({ 
    total: sql<number>`SUM(${payments.amount})` 
  })
  .from(payments)
  .where(and(
    eq(payments.status, 'captured'),
    gt(payments.createdAt, oneDayAgo)
  ));
  
  const dailyRevenue = (Number(dailyRevResult[0]?.total || 0) / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // 5. Recent Family Signups
  const recentFamilies = await db.query.users.findMany({
    where: eq(users.role, "parent"),
    limit: 5,
    orderBy: [desc(users.createdAt)]
  });

  // 6. Recent Platform Activity (Bookings)
  const recentBookings = await db.query.bookings.findMany({
    limit: 5,
    orderBy: [desc(bookings.createdAt)],
    with: {
      parent: true,
      caregiver: true
    }
  });

  // Combine conversations for the sidebar
  const allConversations = [...myTickets, ...pendingTickets];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f8faff]">
      {/* TopNavBar */}
      <header className="bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex justify-between items-center w-full px-6 h-16 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-blue-950 tracking-tight">Moderator Hub</span>
          <nav className="hidden md:flex gap-6 items-center h-full pt-1">
            <a className="font-headline font-medium text-blue-900 border-b-2 border-blue-900 pb-1" href="/dashboard/moderator/support">Overview</a>
            <a className="font-headline font-medium text-slate-500 hover:text-blue-700 transition-colors" href="#">Support Intelligence</a>
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
        {/* SideNavBar: Simplified to 2 primary tabs */}
        <aside className="bg-slate-100 w-20 flex flex-col items-center py-8 gap-8 shrink-0 border-r border-slate-200">
           <div className="flex flex-col items-center gap-1">
             <span className="font-black text-blue-950 text-xs italic tracking-tighter">Kindred</span>
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">INTEL</span>
           </div>
           
           <div className="flex flex-col gap-6 flex-1 pt-4">
             {/* Tab 1: Overview (Active) */}
             <button 
               title="Hub Overview" 
               className="w-12 h-12 flex items-center justify-center bg-white text-blue-900 rounded-xl shadow-sm scale-110 duration-200 border border-slate-200/50"
             >
               <MaterialIcon name="grid_view" />
             </button>

             {/* Tab 2: Support Queue */}
             <a 
               href="/dashboard/moderator/support/tickets"
               title="Support Queue" 
               className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-200 rounded-xl transition-all"
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
            conversations={allConversations} 
            activeId="" 
          />

          {/* Column 2: Dashboard Overview - Fluid */}
          <section className="flex-1 overflow-y-auto p-8 lg:p-14 space-y-12 bg-white">
            <header className="flex flex-col gap-2 max-w-5xl">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary opacity-40 italic">System Command Center</span>
                <h1 className="text-5xl font-headline font-black text-primary italic tracking-tighter leading-none">Intelligence Overview</h1>
                <p className="text-on-surface-variant text-lg font-medium italic opacity-60">High-fidelity platform health and ticket metrics.</p>
            </header>

            {/* Metric Tiles - More spread out on wide screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Active Tickets", value: myTickets.length, icon: "assignment_ind", color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Global Pending", value: pendingTickets.length, icon: "pending", color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Online Users", value: onlineUsers, icon: "sensors", color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "24h Velocity", value: dailyRevenue, icon: "trending_up", color: "text-primary", bg: "bg-primary/5" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all group">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform`}>
                            <MaterialIcon name={stat.icon} className="text-2xl" />
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 leading-none">{stat.label}</div>
                        <div className="text-4xl font-black text-primary italic tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-12 gap-14">
                {/* Live Activity Feed */}
                <div className="2xl:col-span-8 space-y-10">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h3 className="text-3xl font-headline font-black text-primary italic tracking-tight">Recent Platform Activity</h3>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Stream</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {recentBookings.map((booking: any) => (
                            <div key={booking.id} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] flex flex-col gap-6 hover:bg-white hover:shadow-xl transition-all group">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <MaterialIcon name="history_edu" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-black text-primary italic">${(booking.totalAmount / 100).toFixed(2)}</div>
                                        <div className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Captured</div>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-base font-bold text-primary flex items-center gap-3">
                                        <span className="opacity-60">{booking.parent?.fullName?.split(' ')[0]}</span>
                                        <MaterialIcon name="east" className="text-slate-300 text-sm" />
                                        <span className="">{booking.caregiver?.fullName?.split(' ')[0]}</span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 flex items-center gap-2">
                                        <MaterialIcon name="schedule" className="text-xs" />
                                        {format(new Date(booking.createdAt), "h:mm a")} • Secure Booking
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel: New Families */}
                <div className="2xl:col-span-4 space-y-10">
                    <h3 className="text-3xl font-headline font-black text-primary italic tracking-tight">New Families</h3>
                    <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="relative z-10 space-y-8">
                            {recentFamilies.map((fam) => (
                                <div key={fam.id} className="flex items-center gap-5 group items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 text-sm font-black italic group-hover:bg-primary group-hover:border-primary transition-all">
                                        {fam.fullName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-base font-bold group-hover:translate-x-1 transition-transform">{fam.fullName}</div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 leading-none mt-1">Joined {format(new Date(fam.createdAt), "MMM d, yyyy")}</div>
                                    </div>
                                    <MaterialIcon name="north_east" className="ml-auto text-white/10 group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>
                        <MaterialIcon name="family_restroom" className="absolute -bottom-16 -right-16 text-[15rem] opacity-5 group-hover:scale-110 transition-all duration-1000" fill />
                    </div>

                    <div className="p-10 bg-emerald-50/30 border border-emerald-100/50 rounded-[3rem] space-y-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-emerald-700 opacity-60 italic">Platform Integrity</div>
                        <div className="flex items-center gap-4">
                            <span className="w-4 h-4 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]"></span>
                            <span className="text-sm font-black text-emerald-950 italic">All encryption nodes delivering 99.9% uptime</span>
                        </div>
                    </div>
                </div>
            </div>
          </section>

          {/* Column 3: Global Intel Panel - Fixed Width */}
          <aside className="w-80 2xl:w-96 border-l border-slate-100 bg-white shrink-0 hidden xl:flex flex-col overflow-y-auto p-12 space-y-14">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Moderator Access</span>
                    <MaterialIcon name="security" className="text-primary opacity-20" />
                </div>
                <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-primary mx-auto shadow-sm">
                        <MaterialIcon name="verified_user" className="text-2xl" />
                    </div>
                    <h4 className="font-bold text-primary italic">Administrative Vault</h4>
                    <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed italic opacity-60 px-4">
                        Encryption layer active. All moderator interactions are audited for transparency.
                    </p>
                </div>
            </div>

            <div className="space-y-8">
                 <h4 className="text-xl font-headline font-black text-primary italic tracking-tight">Platform Vitals</h4>
                 <div className="space-y-4">
                    {[
                        { label: "Total Members", val: totalUsers, icon: "groups" },
                        { label: "Bookings (24h)", val: "12", icon: "calendar_month" },
                        { label: "Safety Flags", val: "0", icon: "gpp_maybe", color: "text-emerald-600" },
                    ].map((v, i) => (
                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                            <div className="flex items-center gap-4">
                                <MaterialIcon name={v.icon} className={`text-xl ${v.color || "text-primary/40"}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{v.label}</span>
                            </div>
                            <span className="text-sm font-black text-primary italic">{v.val}</span>
                        </div>
                    ))}
                 </div>
            </div>

            <div className="pt-12 mt-auto">
                <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <MaterialIcon name="download" />
                    Export Global Audit
                </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
