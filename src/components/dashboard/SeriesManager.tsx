"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface BookingSeriesInstance {
  id: string;
  caregiverName: string;
  daysOfWeek: number[]; // [1, 3, 5]
  startTime: string;
  endTime: string;
  status: string;
  nextSessionDate: string;
}

interface SeriesManagerProps {
  series: BookingSeriesInstance[];
}

const DAY_MAP: Record<number, string> = {
  1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat", 7: "Sun"
};

export function SeriesManager({ series }: SeriesManagerProps) {
  if (series.length === 0) return null;

  return (
    <div className="bg-white rounded-[3rem] p-10 border border-outline-variant/10 shadow-sm space-y-8 relative overflow-hidden group/series">
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] -z-0"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h3 className="font-headline text-3xl font-black text-primary tracking-tighter leading-none italic">Manage Your Series</h3>
          <p className="text-sm font-medium opacity-60 italic text-on-surface-variant flex items-center gap-2">
            <MaterialIcon name="auto_mode" className="text-xs text-secondary-fixed" fill />
            Active recurring commitments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {series.map((s) => (
          <div 
            key={s.id}
            className="p-6 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 hover:bg-white transition-all space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                    <MaterialIcon name="repeat" className="text-primary text-xl" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Regular Nanny</p>
                    <p className="font-black text-primary tracking-tight leading-tight">{s.caregiverName}</p>
                 </div>
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Active</span>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                <div 
                  key={day}
                  className={cn(
                    "h-8 flex items-center justify-center rounded-lg text-[9px] font-black tracking-tighter transition-all",
                    s.daysOfWeek.includes(day) ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : "bg-white/50 text-slate-300"
                  )}
                >
                  {DAY_MAP[day]}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
               <div>
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Shift Hours</p>
                  <p className="text-xs font-bold text-on-surface-variant">{s.startTime} - {s.endTime}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Next Session</p>
                  <p className="text-xs font-bold text-on-surface-variant italic">{s.nextSessionDate}</p>
               </div>
            </div>

            <div className="pt-2 flex items-center gap-2">
                <button className="flex-1 py-3 bg-white text-primary rounded-xl font-black uppercase tracking-widest text-[9px] border border-outline-variant/10 hover:bg-slate-50 transition-all">
                  Modify Weekly
                </button>
                <button className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-black uppercase tracking-widest text-[9px] border border-red-100 hover:bg-red-100 transition-all">
                  Pause Series
                </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/50 relative z-10 flex items-center gap-4 group-hover/series:border-secondary/20 transition-colors">
        <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center rounded-2xl text-secondary">
          <MaterialIcon name="tips_and_updates" fill />
        </div>
        <p className="text-xs font-medium text-on-surface-variant leading-relaxed opacity-60">
           <strong>Pro Tip</strong>: You can pause an entire series if you are going on vacation, and resume it with one click when you return!
        </p>
      </div>
    </div>
  );
}
