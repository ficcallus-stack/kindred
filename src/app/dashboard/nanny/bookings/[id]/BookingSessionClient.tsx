"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { checkIn, checkOut } from "../actions";
import { format, differenceInSeconds, isAfter } from "date-fns";
import { useToast } from "@/components/Toast";

interface BookingSessionClientProps {
  bookingId: string;
  status: string;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  scheduledEnd: Date;
}

export default function BookingSessionClient({ 
  bookingId, 
  status, 
  checkInTime, 
  checkOutTime,
  scheduledEnd 
}: BookingSessionClientProps) {
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState<number>(0);
  const { showToast } = useToast();

  useEffect(() => {
    let interval: any;
    if (status === "in_progress" && checkInTime) {
      interval = setInterval(() => {
        setElapsed(differenceInSeconds(new Date(), new Date(checkInTime)));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, checkInTime]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await checkIn(bookingId);
      showToast("Checked in! Have a great session.", "success");
      window.location.reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Check-in failed", "error");
    } finally {
      setLoading(true);
    }
  };

  const handleCheckOut = async () => {
    if (!confirm("Are you sure you want to end this session?")) return;
    setLoading(true);
    try {
      const result = await checkOut(bookingId);
      if (result.overtimeMinutes > 0) {
        showToast(`Session completed with ${result.overtimeMinutes} mins overtime.`, "success");
      } else {
        showToast("Session completed successfully.", "success");
      }
      window.location.reload();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Check-out failed", "error");
    } finally {
      setLoading(true);
    }
  };

  const formatElapsed = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const overstay = isAfter(new Date(), new Date(scheduledEnd));
  const overstayMins = overstay ? Math.floor(differenceInSeconds(new Date(), new Date(scheduledEnd)) / 60) : 0;

  return (
    <div className="bg-surface-container-low p-12 rounded-[3.5rem] border-2 border-primary/5 shadow-2xl relative overflow-hidden group">
      
      {/* Session Header Status */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <span className={cn(
                "w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--color-primary),0.5)]",
                status === "in_progress" ? "bg-green-500 shadow-green-500/50" : "bg-orange-500 shadow-orange-500/50"
              )}></span>
              <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] italic">
                {status === "in_progress" ? "Shift Timer Running" : "Waiting to Start"}
              </p>
           </div>
           <h3 className="text-6xl font-headline font-black text-primary italic tracking-widest leading-none tabular-nums">
             {status === "in_progress" ? formatElapsed(elapsed) : "00:00:00"}
           </h3>
        </div>

        <div className="flex-1 max-w-sm w-full space-y-4">
           {status === "confirmed" && (
             <button 
               onClick={handleCheckIn}
               disabled={loading}
               className="w-full py-6 bg-primary text-white rounded-3xl font-headline font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 italic"
             >
               {loading ? "Initializing..." : "Punch In Now"}
               <MaterialIcon name="play_arrow" className="text-lg" fill />
             </button>
           )}

           {status === "in_progress" && (
             <button 
               onClick={handleCheckOut}
               disabled={loading}
               className="w-full py-6 bg-error text-white rounded-3xl font-headline font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-error/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 italic"
             >
               {loading ? "Calculating..." : "End & Complete Session"}
               <MaterialIcon name="stop" className="text-lg" fill />
             </button>
           )}

           {status === "completed" && (
             <div className="text-center p-6 bg-green-50 rounded-3xl border border-green-100 italic">
                <MaterialIcon name="check_circle" className="text-3xl text-green-600 mb-2" fill />
                <p className="font-bold text-green-800 text-sm">Session Successfully Completed</p>
                <p className="text-xs text-green-600/70 mt-1">Check-out: {format(new Date(checkOutTime!), "h:mm a")}</p>
             </div>
           )}
        </div>
      </div>

      {/* Overstay/Logic Box */}
      {status === "in_progress" && overstay && (
        <div className="mt-10 p-6 bg-orange-50 border-2 border-orange-200 rounded-[2.5rem] flex items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500 italic">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-orange-100 flex items-center justify-center text-orange-600 rounded-2xl shadow-inner">
              <MaterialIcon name="warning" className="text-2xl" fill />
            </div>
            <div>
              <h4 className="font-black text-orange-900 leading-none mb-1">Overstay Surge Pricing Active</h4>
              <p className="text-xs text-orange-800/60 font-medium">+ {overstayMins} minutes · Automated Billing @ $45/hr</p>
            </div>
          </div>
          <div className="text-right">
             <p className="text-2xl font-black text-orange-900 tracking-tighter leading-none">${(overstayMins * 0.75).toFixed(2)}</p>
             <span className="text-[9px] font-black uppercase text-orange-700/40 tracking-widest">Added to Total</span>
          </div>
        </div>
      )}

      {/* Decorative background grain/pattern */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
    </div>
  );
}
