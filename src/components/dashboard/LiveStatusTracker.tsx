"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useAblyPresence } from "@/hooks/useAbly";
import { useState, useEffect } from "react";

interface LiveStatusTrackerProps {
  channelName: string; // family-presence:parent-id
  nannyName: string;
}

export function LiveStatusTracker({ channelName, nannyName }: LiveStatusTrackerProps) {
  const { presentMembers } = useAblyPresence(channelName);
  const isActive = presentMembers.length > 0;
  const [tickerTime, setTickerTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setTickerTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isActive) return (
     <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/10 flex items-center justify-between opacity-60 grayscale scale-[0.98] transition-all">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                <MaterialIcon name="person" />
            </div>
            <div>
               <p className="text-xs font-black text-primary italic">No Active Shifts Currently</p>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Awaiting Clock-in</p>
            </div>
        </div>
        <div className="text-right">
             <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{tickerTime}</p>
        </div>
     </div>
  );

  return (
    <div className="relative overflow-hidden bg-white p-6 rounded-[2.5rem] border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/5 animate-in fade-in zoom-in duration-700">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[60px] animate-pulse"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-5">
           <div className="relative">
              <div className="w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <MaterialIcon name="play_arrow" className="text-3xl" fill />
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full animate-ping opacity-70"></span>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></span>
           </div>
           <div>
              <div className="flex items-center gap-2">
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-100">Live Pulse</span>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/40 italic">Check-in at 8:58 AM</span>
              </div>
              <h3 className="font-headline text-2xl font-black text-primary tracking-tighter leading-tight italic mt-1">
                {nannyName.split(" ").pop()} is On-Shift
              </h3>
           </div>
        </div>

        <div className="flex items-center gap-8">
             <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Session Duration</p>
                  <div className="flex items-center gap-3">
                       <span className="text-2xl font-black text-primary tracking-tighter">06:02</span>
                       <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                            <div className="h-full bg-emerald-500 w-[75%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                       </div>
                  </div>
             </div>
             
             <button className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-md active:scale-90">
                 <MaterialIcon name="notifications_active" fill />
             </button>
        </div>
      </div>
    </div>
  );
}
