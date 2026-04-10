"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface HiredModalProps {
  booking: any;
  show: boolean;
  onClose: () => void;
}

export function HiredModal({ booking, show, onClose }: HiredModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [clashStatus, setClashStatus] = useState<{ hasClash: boolean; conflicts: any[] } | null>(null);
  const [acknowledgedClash, setAcknowledgedClash] = useState(false);

  useEffect(() => {
    if (show && booking) {
      const checkClashes = async () => {
        try {
          const { checkNannyAvailabilityAction } = await import("@/lib/actions/booking-actions");
          // Estimate duration (approx 8 hours if not ad-hoc)
          const res = await checkNannyAvailabilityAction({
            nannyId: booking.caregiverId,
            startDate: format(new Date(booking.startDate), "yyyy-MM-dd"),
            startTime: format(new Date(booking.startDate), "HH:mm"),
            hiringMode: booking.hiringMode,
            pulseGrid: booking.refinedSchedule
          });
          setClashStatus(res);
        } catch (err) {
          console.error("Clash check failed", err);
        }
      }
      checkClashes();
    }
  }, [show, booking]);

  if (!booking || !show) return null;

  const subtotal = booking.totalAmount / 1.075;
  const earnings = subtotal * 0.954; // Total subtotal minus Kindred 4.6% fee approx
  const days = Math.ceil(Math.abs(new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Stable random fallback illustration based on booking ID
  const illustrationId = (booking.id.charCodeAt(0) % 4) + 1;
  const familyPhoto = booking.parent?.parentProfile?.familyPhoto || `/illustrations/family_${illustrationId}.png`;

  const handleAction = async (action: "accept" | "reject") => {
    if (action === "accept" && clashStatus?.hasClash && !acknowledgedClash) {
      alert("Please acknowledge the schedule conflict before accepting.");
      return;
    }
    
    setLoading(action);
    try {
      const { updateBookingStatusNanny } = await import("@/lib/actions/booking-actions");
      await updateBookingStatusNanny({ bookingId: booking.id, action });
      onClose();
      router.refresh();
    } catch (err) {
      alert("Operation failed. Please try again.");
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-primary/40 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white rounded-[3.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20"
        >
          {/* Top Progress bar */}
          <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary to-tertiary-fixed-dim" />

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 z-[110] w-12 h-12 flex items-center justify-center bg-white/80 backdrop-blur-md rounded-full text-primary hover:bg-white transition-all shadow-xl hover:scale-110 active:scale-95"
          >
            <MaterialIcon name="close" className="text-xl" />
          </button>

          <div className="flex flex-col md:flex-row min-h-[500px]">
            {/* Image Section */}
            <div className="relative w-full md:w-[45%] h-64 md:h-auto overflow-hidden bg-primary/5">
               <motion.img 
                 initial={{ scale: 1.2, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 1.2 }}
                 alt="Family" 
                 className="absolute inset-0 w-full h-full object-cover" 
                 src={familyPhoto} 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent" />
               <div className="absolute bottom-10 left-10 right-10">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest mb-3">
                    <MaterialIcon name="verified" className="text-xs" fill /> Verified Family
                  </span>
                  <p className="text-white font-headline text-2xl font-black italic leading-tight">Your next <br/> adventure starts here.</p>
               </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 p-10 md:p-14 flex flex-col justify-between space-y-8">
              <header>
                <div className="flex items-center gap-3 mb-6">
                   <div className="bg-secondary-fixed text-on-secondary-fixed p-3 rounded-2xl shadow-lg shadow-secondary/10">
                      <MaterialIcon name="auto_awesome" fill />
                   </div>
                   <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Success!</h4>
                      <h2 className="text-3xl font-headline font-black italic text-primary tracking-tighter">You've been hired.</h2>
                   </div>
                </div>

                {clashStatus?.hasClash && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="mb-8 p-5 bg-error/5 border-l-4 border-error rounded-r-2xl space-y-3"
                  >
                     <div className="flex items-center gap-3 text-error">
                        <MaterialIcon name="warning" className="text-xl" fill />
                        <p className="text-[10px] font-black uppercase tracking-widest">Schedule Conflict Alert</p>
                     </div>
                     <p className="text-[11px] font-medium text-error opacity-80 leading-relaxed">
                        This placement overlaps with a 30-minute buffer of your existing shift.
                     </p>
                     <label className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={acknowledgedClash}
                          onChange={(e) => setAcknowledgedClash(e.target.checked)}
                          className="w-4 h-4 rounded border-error text-error focus:ring-error"
                        />
                        <span className="text-[10px] font-bold text-error uppercase tracking-tighter group-hover:underline">I understand and want to continue</span>
                     </label>
                  </motion.div>
                )}

                <p className="text-sm font-medium text-slate-500 italic leading-relaxed">
                  The <span className="text-primary font-black underline decoration-secondary decoration-2 underline-offset-4">{booking.parent?.fullName.split(' ')[0]} Family</span> has selected you for their upcoming care needs.
                </p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Your Earnings</p>
                    <p className="text-3xl font-headline font-black italic text-primary leading-none">${earnings.toFixed(2)}</p>
                    <p className="text-[9px] font-bold text-secondary mt-2 flex items-center gap-1">
                       <MaterialIcon name="account_balance_wallet" className="text-xs" fill /> Escrow Secured
                    </p>
                 </div>
                 <div className="bg-primary/5 p-5 rounded-3xl border border-primary/10">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 mb-1">Duration</p>
                    <p className="text-xl font-headline font-black italic text-primary leading-none">{days} Days</p>
                    <p className="text-[9px] font-bold text-primary mt-2 flex items-center gap-1 uppercase tracking-tighter">
                       Starts {format(new Date(booking.startDate), "MMM d, h:mm a")}
                    </p>
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                 <button 
                   onClick={() => handleAction("accept")}
                   disabled={!!loading || (clashStatus?.hasClash && !acknowledgedClash)}
                   className={cn(
                     "flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl active:scale-95",
                     (clashStatus?.hasClash && !acknowledgedClash) 
                       ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                       : "bg-primary text-white shadow-primary/20 hover:bg-secondary hover:shadow-secondary/20"
                   )}
                 >
                    {loading === "accept" ? "Finalizing..." : "Accept Placement"}
                 </button>
                 <button 
                   onClick={() => handleAction("reject")}
                   disabled={!!loading}
                   className="px-8 py-5 rounded-[1.5rem] border-2 border-outline-variant text-on-surface-variant font-black uppercase tracking-[0.2em] text-[10px] hover:bg-surface-container-high transition-all active:scale-95"
                 >
                    {loading === "reject" ? "Processing..." : "Decline"}
                 </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
