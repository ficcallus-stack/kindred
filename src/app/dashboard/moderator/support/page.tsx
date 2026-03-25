import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { getSupportTickets } from "./actions";

export const metadata = {
  title: "Support Queue | Moderator Dashboard",
};

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const validFilter = ["all", "urgent", "technical"].includes(filter || "") ? filter : "all";
  
  const tickets = await getSupportTickets(validFilter as any);

  // Stats for the sidebar
  const totalCount = tickets.length;
  const urgentCount = tickets.filter(t => t.priority === "urgent").length;
  const techCount = tickets.filter(t => t.category === "technical").length;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Quick Filter Sidebar */}
      <aside className="w-full md:w-64 space-y-8">
        <section>
          <h3 className="font-headline text-xs font-extrabold uppercase tracking-[0.2em] text-on-surface-variant mb-6">Filter Queue</h3>
          <div className="space-y-1">
            <Link 
              href="?filter=all"
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium",
                validFilter === "all" ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold" : "hover:bg-surface-container text-on-surface-variant"
              )}
            >
              <span className="flex items-center gap-3"><MaterialIcon name="all_inbox" className="text-[20px]" /> All Tickets</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", validFilter === "all" ? "bg-white/20" : "")}>{totalCount}</span>
            </Link>
            <Link 
              href="?filter=urgent"
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium",
                validFilter === "urgent" ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold" : "hover:bg-surface-container text-on-surface-variant"
              )}
            >
              <span className="flex items-center gap-3"><MaterialIcon name="priority_high" className={cn("text-[20px]", validFilter === "urgent" ? "text-white" : "text-error")} /> Urgent</span>
              <span className="text-xs font-bold">{urgentCount}</span>
            </Link>
            <Link 
              href="?filter=technical"
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors font-medium",
                validFilter === "technical" ? "bg-primary text-white shadow-md shadow-primary/20 font-semibold" : "hover:bg-surface-container text-on-surface-variant"
              )}
            >
              <span className="flex items-center gap-3"><MaterialIcon name="memory" className={cn("text-[20px]", validFilter === "technical" ? "text-white" : "text-slate-400")} /> Technical</span>
              <span className="text-xs font-bold">{techCount}</span>
            </Link>
          </div>
        </section>

        <section className="p-6 rounded-2xl bg-primary/5 border border-outline-variant/10 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <MaterialIcon name="auto_awesome" className="text-primary text-lg" fill />
            <span className="text-sm font-headline font-bold text-primary">System Triage</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed mb-4 font-medium">
            Tickets are automatically prioritized based on their category and user role. Urgent matters are pinned to the top.
          </p>
        </section>
      </aside>

      {/* Ticket List Container */}
      <div className="flex-1">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Active Queue</h2>
            <p className="text-on-surface-variant mt-1 max-w-lg">Managing requests across the platform.</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface-variant text-sm font-bold flex items-center gap-2 border border-outline-variant/10 hover:bg-surface-container-highest transition-colors">
            <MaterialIcon name="sort" className="text-sm" /> Newest First
          </button>
        </div>

        {/* Tickets */}
        <div className="space-y-4">
          {tickets.length > 0 ? tickets.map((ticket) => (
            <Link 
              key={ticket.id} 
              href={`/dashboard/moderator/support/${ticket.id}`}
              className="group relative bg-surface-container-lowest p-6 rounded-2xl hover:bg-white transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 flex gap-6 items-start border border-outline-variant/5"
            >
              <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl",
                ticket.priority === "urgent" && "bg-error",
                ticket.priority === "high" && "bg-amber-500",
                ticket.priority === "medium" && "bg-blue-400",
                ticket.priority === "low" && "bg-slate-400"
              )} />
              
              <div className="w-14 h-14 rounded-2xl shrink-0 shadow-sm bg-surface-container overflow-hidden relative flex items-center justify-center text-primary/30">
                {ticket.user?.nannyProfile?.photos?.[0] ? (
                  <Image src={ticket.user.nannyProfile.photos[0]} alt={ticket.user.fullName} fill className="object-cover" />
                ) : (
                  <MaterialIcon name="person" className="text-3xl" />
                )}
              </div>

              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <h4 className="font-headline font-bold text-lg text-primary">{ticket.user?.fullName || "User"}</h4>
                    <span className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                      ticket.status === "open" && "bg-slate-100 text-slate-800",
                      ticket.status === "in_progress" && "bg-amber-100 text-amber-800",
                      ticket.status === "resolved" && "bg-green-100 text-green-800",
                      ticket.status === "closed" && "bg-slate-200 text-slate-500"
                    )}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className="text-xs text-on-surface-variant font-medium">• {ticket.user?.role || "Member"}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full bg-surface-container-low text-slate-600 text-xs font-bold capitalize">{ticket.category}</span>
                  {ticket.priority === "urgent" && (
                    <span className="flex items-center gap-1 text-xs text-error font-bold italic">
                      <MaterialIcon name="emergency_home" className="text-sm" /> Escalated to Security
                    </span>
                  )}
                </div>

                <h5 className="font-bold text-sm text-primary mb-1">{ticket.title}</h5>
                <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 font-medium">
                  {ticket.description || "No description."}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:scale-105 transition-transform shadow-sm">Review</button>
              </div>
            </Link>
          )) : (
            <div className="py-12 flex flex-col items-center justify-center text-on-surface-variant/50">
               <MaterialIcon name="check_circle" className="text-6xl mb-4" />
               <p className="font-headline font-bold text-xl">No tickets found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
