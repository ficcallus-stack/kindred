import { db } from "@/db";
import { conversations, messages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { MaterialIcon } from "@/components/MaterialIcon";
import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { ModeratorSupportSidebar } from "@/components/dashboard/ModeratorSupportSidebar";

export default async function SupportTicketsPage() {
  const user = await syncUser();
  if (!user || (user.role !== "moderator" && user.role !== "admin")) redirect("/login");

  // Fetch all support conversations for Sidebar
  const allSupportConvos = await db.query.conversations.findMany({
    where: eq(conversations.isSupport, true),
    orderBy: [desc(conversations.updatedAt)],
    with: {
      members: {
        with: { user: true }
      },
      messages: { limit: 1, orderBy: [desc(messages.createdAt)] }
    }
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f8faff]">
      {/* TopNavBar */}
      <header className="bg-slate-50/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex justify-between items-center w-full px-6 h-16 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold text-blue-950 tracking-tight">Moderator Hub</span>
          <nav className="hidden md:flex gap-6 items-center h-full pt-1">
            <a className="font-headline font-medium text-slate-500 hover:text-blue-700 transition-colors" href="/dashboard/moderator/support">Overview</a>
            <a className="font-headline font-medium text-blue-900 border-b-2 border-blue-900 pb-1" href="#">Support Intelligence</a>
            <a className="font-headline font-medium text-slate-500 hover:text-blue-700 transition-colors" href="#">Insights</a>
            <a className="font-headline font-medium text-slate-500 hover:text-blue-700 transition-colors" href="#">Audits</a>
          </nav>
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
             <a 
               href="/dashboard/moderator/support"
               className="w-12 h-12 flex items-center justify-center text-slate-400 hover:bg-slate-200 rounded-xl transition-all"
             >
               <MaterialIcon name="grid_view" />
             </a>
             <a 
               href="#"
               className="w-12 h-12 flex items-center justify-center bg-white text-blue-900 rounded-xl shadow-sm scale-110 duration-200 border border-slate-200/50"
             >
               <MaterialIcon name="support_agent" />
             </a>
           </div>
        </aside>

        <div className="flex-1 flex overflow-hidden">
          <ModeratorSupportSidebar 
            conversations={allSupportConvos} 
            activeId="" 
          />

          <section className="flex-1 bg-white flex flex-col items-center justify-center p-20 text-center space-y-6">
             <div className="w-24 h-24 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-200">
                <MaterialIcon name="forum" className="text-5xl" />
             </div>
             <div className="space-y-2">
                <h2 className="text-3xl font-black text-primary italic tracking-tight">Select a Ticket</h2>
                <p className="text-on-surface-variant font-medium italic opacity-60">
                    Pick a conversation from the sidebar to begin providing elite level assistance.
                </p>
             </div>
          </section>
        </div>
      </main>
    </div>
  );
}
