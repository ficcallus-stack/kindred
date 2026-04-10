"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { getActivityFeed } from "@/app/dashboard/parent/care-team/actions";

interface ActivityEvent {
  id: string;
  type: string;
  action: string;
  timestamp: any;
  metadata?: any;
}

interface CareActivityFeedProps {
  events: ActivityEvent[];
}

export function CareActivityFeed({ events: initialEvents }: CareActivityFeedProps) {
  const [events, setEvents] = useState<ActivityEvent[]>(initialEvents);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialEvents.length === 10);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      const nextBatch = await getActivityFeed(page, 10);
      if (nextBatch.length < 10) {
        setHasMore(false);
      }
      setEvents([...events, ...nextBatch]);
      setPage(page + 1);
    } catch (err) {
      console.error("Failed to load more activities:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Household Activity Ledger</h3>
         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
      </div>

      <div className="relative space-y-4">
        {/* Connection Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-outline-variant/10 -z-0"></div>

        {events.map((event, idx) => (
          <div key={`${event.id}-${idx}`} className="flex gap-6 group/event animate-in fade-in slide-in-from-left-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shrink-0 transition-transform group-hover/event:scale-110 relative z-10",
              event.type === "system" ? "bg-amber-100 text-amber-600 shadow-amber-500/5 border border-amber-200/20" : 
              event.type === "financial" ? "bg-emerald-100 text-emerald-600 shadow-emerald-500/5 border border-emerald-200/20" :
              "bg-primary/10 text-primary shadow-primary/5 border border-primary/20"
            )}>
               <MaterialIcon 
                 name={
                   event.type === "system" ? "settings" : 
                   event.type === "financial" ? "finance_chip" : 
                   "verified_user"
                 } 
                 className="text-lg"
                 fill={idx === 0}
               />
            </div>

            <div className="flex-1 pt-1 space-y-2">
               <div className="flex items-center justify-between gap-4">
                  <p className={cn(
                    "text-xs font-black italic tracking-tight leading-none",
                    idx === 0 ? "text-primary" : "text-primary/60"
                  )}>
                    {event.action}
                  </p>
                  <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">
                    {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                  </span>
               </div>
               
               <div className="space-y-3">
                 {event.metadata && (
                   <p className="text-[10px] font-medium text-slate-400 italic leading-snug">
                     {event.metadata.summary || "Action successfully synchronized to household ledger."}
                   </p>
                 )}

                 {(event.metadata?.photoUrl || event.metadata?.videoUrl) && (
                   <div className="rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm max-w-sm group/media h-40 relative">
                     {event.metadata.photoUrl ? (
                       <img 
                        src={event.metadata.photoUrl} 
                        className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-700" 
                        alt="Care Log" 
                       />
                     ) : (
                       <video 
                        src={event.metadata.videoUrl} 
                        controls 
                        className="w-full h-full object-cover" 
                       />
                     )}
                   </div>
                 )}
               </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <p className="text-center text-[10px] font-black text-slate-300 py-10 uppercase tracking-widest italic">
            Ledger holds no current records.
          </p>
        )}

        {hasMore && (
          <div className="pt-6 flex justify-center">
             <button 
               onClick={handleLoadMore}
               disabled={loading}
               className="px-8 py-3 bg-white border border-outline-variant/10 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 hover:text-primary hover:border-primary/20 transition-all active:scale-95 disabled:opacity-50"
             >
                {loading ? "Syncing..." : "Load Older Records"}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
