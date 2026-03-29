"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { format, differenceInMinutes, isAfter } from "date-fns";
import { moderatorManualSessionUpdate } from "../../nanny/bookings/actions";
import { useToast } from "@/components/Toast";

interface SessionOverrideModalProps {
  booking: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SessionOverrideModal({ booking, onClose, onSuccess }: SessionOverrideModalProps) {
  const [checkIn, setCheckIn] = useState(booking.checkInTime ? format(new Date(booking.checkInTime), "yyyy-MM-dd'T'HH:mm") : "");
  const [checkOut, setCheckOut] = useState(booking.checkOutTime ? format(new Date(booking.checkOutTime), "yyyy-MM-dd'T'HH:mm") : "");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    setLoading(true);
    try {
      await moderatorManualSessionUpdate(
        booking.id, 
        checkIn ? new Date(checkIn) : null, 
        checkOut ? new Date(checkOut) : null
      );
      showToast("Session times updated successfully", "success");
      onSuccess();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  // Calculate projected overtime
  let projectedOvertime = 0;
  if (checkOut) {
    const end = new Date(checkOut);
    const scheduled = new Date(booking.endDate);
    if (isAfter(end, scheduled)) {
      projectedOvertime = Math.max(0, differenceInMinutes(end, scheduled));
    }
  }

  const overtimeFee = projectedOvertime * 0.75;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-outline-variant/20">
        <div className="p-10 space-y-8">
          <header className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] mb-2 block italic">Administrative Override</span>
              <h3 className="text-3xl font-black font-headline text-primary tracking-tighter italic leading-none">Adjust Session Log</h3>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
              <MaterialIcon name="close" />
            </button>
          </header>

          <div className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary font-black">
                {booking.caregiver.fullName.charAt(0)}
             </div>
             <div>
                <p className="text-sm font-bold text-primary italic">The {booking.parent.fullName.split(" ").pop()} Family</p>
                <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-0.5">Caregiver: {booking.caregiver.fullName}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-2">Override Check-in</label>
                <input 
                  type="datetime-local" 
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-5 py-4 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
             <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest pl-2">Override Check-out</label>
                <input 
                  type="datetime-local" 
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-5 py-4 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
             </div>
          </div>

          {/* Projection Banner */}
          <div className={cn(
            "p-6 rounded-[2rem] flex items-center justify-between gap-6 transition-all duration-500 italic",
            projectedOvertime > 0 ? "bg-orange-50 border border-orange-200 text-orange-900" : "bg-green-50 border border-green-200 text-green-900"
          )}>
             <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 flex items-center justify-center rounded-xl shadow-inner", projectedOvertime > 0 ? "bg-orange-100" : "bg-green-100")}>
                   <MaterialIcon name={projectedOvertime > 0 ? "payments" : "check_circle"} className="text-xl" fill />
                </div>
                <div>
                   <h4 className="font-black leading-none mb-1">Financial Projection</h4>
                   <p className="text-[10px] font-medium opacity-60">
                     {projectedOvertime > 0 ? `+${projectedOvertime} mins overtime detected` : "No overtime surge detected"}
                   </p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-2xl font-black tracking-tighter leading-none">
                  ${overtimeFee.toFixed(2)}
                </p>
                <span className="text-[9px] font-black uppercase opacity-40 tracking-widest leading-none">Override Fee</span>
             </div>
          </div>

          <footer className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-5 bg-surface-container-high text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={loading}
              className="flex-[2] py-5 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "Synchronizing Storage..." : "Authorize Override & Recalculate"}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
