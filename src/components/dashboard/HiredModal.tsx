"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface HiredModalProps {
  booking: any;
  show: boolean;
  onClose: () => void;
}

export function HiredModal({ booking, show, onClose }: HiredModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  if (!booking || !show) return null;

  const earnings = booking.totalAmount / 102.5 * 100 / 100; // Recalculate without fee
  const days = Math.ceil(Math.abs(new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const handleAction = async (action: "accept" | "reject") => {
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-primary/20 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-10 h-10 flex items-center justify-center bg-white/50 backdrop-blur-md rounded-full text-primary hover:bg-white transition-all shadow-sm"
          >
            <MaterialIcon name="close" />
          </button>

          {/* Header & Image */}
          <div className="relative grid md:grid-cols-2 items-stretch min-h-[320px]">
            <div className="p-10 md:p-14 flex flex-col justify-center">
              <div className="mb-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black tracking-widest uppercase">
                 <MaterialIcon name="stars" className="text-sm" fill /> New Booking
              </div>
              <h2 className="text-3xl md:text-4xl font-headline font-black italic text-primary leading-tight tracking-tighter">
                Congratulations! <span className="text-secondary">You've been hired.</span>
              </h2>
              <p className="mt-4 text-on-surface-variant font-bold text-sm">
                The {booking.parent.fullName.split(' ')[0]} Family is looking forward to welcoming you.
              </p>
            </div>
            <div className="relative h-64 md:h-auto overflow-hidden">
               <div className="absolute inset-0 bg-primary/10 m-8 rounded-[2rem] skew-y-2 border-2 border-primary/5" />
               <img 
                 alt="Family" 
                 className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem] shadow-2xl m-4 md:m-8 rotate-1 scale-95" 
                 src="https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop" 
               />
               <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
            </div>
          </div>

          {/* Details Bento */}
          <div className="px-10 md:px-14 pb-12 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/15 flex flex-col justify-between">
                <div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Your Earnings</span>
                   <div className="text-3xl font-headline font-black italic text-primary mt-1">${earnings.toFixed(2)}</div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-primary font-bold text-xs">
                   <MaterialIcon name="payments" className="text-sm" fill /> Paid into wallet upon completion
                </div>
              </div>
              <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/15 space-y-4">
                 <div className="flex items-start gap-4">
                    <MaterialIcon name="calendar_month" className="text-primary opacity-60" fill />
                    <div>
                       <div className="text-[11px] font-black text-primary">Oct 24 - Oct 26</div>
                       <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tight">{days} days x {booking.hoursPerDay} hrs/day</div>
                    </div>
                 </div>
                 <div className="flex items-start gap-4">
                    <MaterialIcon name="location_on" className="text-primary opacity-60" fill />
                    <div>
                       <div className="text-[11px] font-black text-primary">Upper East Side, NY</div>
                       <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">View Map</div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col md:flex-row gap-4">
              <button 
                onClick={() => handleAction("accept")}
                className="w-full md:flex-1 py-5 rounded-2xl bg-primary text-on-primary font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading === "accept" ? "Confirming..." : "Accept Booking"}
              </button>
              <button 
                onClick={() => handleAction("reject")}
                className="w-full md:w-auto px-8 py-5 rounded-2xl border-2 border-outline-variant text-on-surface-variant font-black uppercase tracking-[0.2em] text-[11px] hover:bg-surface-container-high transition-all"
              >
                {loading === "reject" ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
          
          <div className="h-2 w-full bg-gradient-to-r from-primary via-secondary-container to-tertiary-fixed-dim" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
