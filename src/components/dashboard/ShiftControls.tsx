"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAblyPresence } from "@/hooks/useAbly";
import { clockInAction, clockOutAction } from "@/lib/actions/booking-actions";

interface ShiftControlsProps {
  bookingId: string;
  familyId: string;
  initialCheckIn?: Date | null;
  initialCheckOut?: Date | null;
}

export function ShiftControls({ bookingId, familyId, initialCheckIn, initialCheckOut }: ShiftControlsProps) {
  const [checkedIn, setCheckedIn] = useState(!!initialCheckIn);
  const [checkedOut, setCheckedOut] = useState(!!initialCheckOut);
  const [loading, setLoading] = useState(false);
  
  const { channel } = useAblyPresence(`family-presence:${familyId}`);

  const handleStartShift = async () => {
    setLoading(true);
    try {
      await clockInAction(bookingId);
      if (channel) {
         await channel.presence.enter({ status: "On Shift" });
      }
      setCheckedIn(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    setLoading(true);
    try {
      await clockOutAction(bookingId);
      if (channel) {
         await channel.presence.leave();
      }
      setCheckedOut(true);
    } finally {
      setLoading(false);
    }
  };

  if (checkedOut) return (
     <div className="p-6 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-center space-y-2">
        <MaterialIcon name="task_alt" className="text-emerald-500 text-2xl" />
        <p className="text-xs font-black text-primary uppercase tracking-widest">Shift Completed</p>
        <p className="text-[10px] font-bold text-slate-400">Payroll adjustment processing...</p>
     </div>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm space-y-6 relative overflow-hidden group/shift">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px]"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
            checkedIn ? "bg-emerald-50 text-emerald-600" : "bg-primary/10 text-primary"
        )}>
           <MaterialIcon name={checkedIn ? "timer" : "play_circle"} fill={checkedIn} />
        </div>
        <div>
           <h3 className="text-lg font-black text-primary font-headline tracking-tight leading-none italic uppercase">
             {checkedIn ? "Ongoing Shift" : "Shift Control"}
           </h3>
           <p className="text-[10px] font-black text-on-surface-variant opacity-40 uppercase tracking-widest mt-1">Real-time presence active</p>
        </div>
      </div>

      {!checkedIn ? (
          <button 
            onClick={handleStartShift}
            disabled={loading}
            className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 group/btn"
          >
             {loading ? <MaterialIcon name="sync" className="animate-spin" /> : (
                 <>
                    <MaterialIcon name="login" className="group-hover/btn:translate-x-1 transition-transform" />
                    Start Shift (Clock-in)
                 </>
             )}
          </button>
      ) : (
          <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                      <span className="text-[10px] font-black text-emerald-700 uppercase">Live Now</span>
                  </div>
                  <span className="text-xs font-black text-emerald-900">00:15:32</span>
              </div>
              <button 
                onClick={handleEndShift}
                disabled={loading}
                className="w-full py-5 bg-surface-container-high text-primary rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-slate-100 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <MaterialIcon name="sync" className="animate-spin" /> : (
                    <>
                       <MaterialIcon name="logout" />
                       End Shift (Clock-out)
                    </>
                )}
              </button>
          </div>
      )}

      <p className="text-[10px] text-center italic opacity-40 leading-relaxed relative z-10 px-4">
        "Clock-in logic is synced in real-time with the family's dashboard. Financial adjustments are calculated on clock-out."
      </p>
    </div>
  );
}
