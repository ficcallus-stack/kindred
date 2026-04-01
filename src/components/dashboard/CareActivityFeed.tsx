"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

export function CareActivityFeed({ events }: CareActivityFeedProps) {
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
          <div key={event.id} className="flex gap-6 group/event">
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

            <div className="flex-1 pt-1 space-y-1">
               <div className="flex items-center justify-between gap-4">
                  <p className={cn(
                    "text-xs font-black italic tracking-tight leading-none",
                    idx === 0 ? "text-primary" : "text-primary/60"
                  )}>
                    {event.action}
                  </p>
                  <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">
                    {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                  </span>
               </div>
               {event.metadata && (
                 <p className="text-[10px] font-medium text-slate-400 italic leading-snug">
                   {event.metadata.summary || "Action successfully synchronized to household ledger."}
                 </p>
               )}
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <p className="text-center text-[10px] font-black text-slate-300 py-10 uppercase tracking-widest italic">
            Ledger holds no current records.
          </p>
        )}
      </div>
    </div>
  );
}
