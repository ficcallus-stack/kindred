"use client";

import { useEffect, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { createAblyClient } from "@/lib/ably";

interface CaregiverDashboardAlertsProps {
  userId: string;
  activeBooking?: any;
}

export function CaregiverDashboardAlerts({ userId, activeBooking }: CaregiverDashboardAlertsProps) {
  const [showModal, setShowModal] = useState(false);
  const [showStrip, setShowStrip] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(activeBooking);

  useEffect(() => {
    if (!userId) return;

    // 1. Initial State from server-prop activeBooking
    if (activeBooking && activeBooking.status === "paid") {
      setShowStrip(true);
      const isDismissed = localStorage.getItem(`kindred_booking_popup_${activeBooking.id}`);
      if (!isDismissed) {
        setShowModal(true);
      }
    }

    // 2. Listen for Real-time BOOKING_PAID via Ably
    const ably = createAblyClient(userId);
    if (ably) {
      const channel = ably.channels.get(`user:${userId}`);
      channel.subscribe("BOOKING_PAID", (message) => {
        const data = message.data;
        setBookingDetails(data);
        setShowStrip(true);
        setShowModal(true);
      });

      return () => {
        channel.unsubscribe();
      };
    }
  }, [userId, activeBooking]);

  const handleDismiss = () => {
    if (bookingDetails?.id) {
      localStorage.setItem(`kindred_booking_popup_${bookingDetails.id}`, "true");
    }
    setShowModal(false);
  };

  if (!showStrip && !showModal) return null;

  return (
    <>
      {/* 🥖 Persistent Alert Strip */}
      {showStrip && (
        <div className="bg-primary text-white py-3 px-6 text-center relative z-50 animate-in fade-in slide-in-from-top duration-500 border-b border-white/10 shadow-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary-fixed/10 to-primary opacity-50"></div>
          <div className="relative z-10 flex items-center justify-center gap-4">
             <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400"></div>
             <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] italic">
                Active Booking Confirmed! Tap to coordinate arrival.
             </p>
             <button 
               onClick={() => setShowModal(true)}
               className="ml-4 bg-white text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-md"
             >
                View Details
             </button>
          </div>
        </div>
      )}

      {/* 🎁 New Booking Modal */}
      {showModal && bookingDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-xl" onClick={handleDismiss}></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-outline-variant/10">
            {/* Header / Hero */}
            <div className="bg-primary p-12 text-center relative overflow-hidden">
               <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full" />
               <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2.2rem] bg-white text-primary shadow-2xl rotate-3">
                     <MaterialIcon name="celebration" className="text-3xl" fill />
                  </div>
                  <h2 className="font-headline text-4xl font-black italic text-white tracking-tighter leading-none">New Job Confirmed!</h2>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest">Everything is locked in our Escrow.</p>
               </div>
            </div>

            {/* Contents */}
            <div className="p-10 space-y-8">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Parent Phone</p>
                     <p className="text-lg font-headline font-black italic text-primary tracking-tight">
                        {bookingDetails.phoneNumber || "Verified Mobile"}
                     </p>
                  </div>
                  <div className="space-y-1 text-right">
                     <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Total Earnings</p>
                     <p className="text-2xl font-headline font-black italic text-emerald-600 tracking-tight">
                        ${(bookingDetails.totalAmount / 1.075 / 100).toFixed(2)}
                     </p>
                  </div>
               </div>

               <div className="bg-slate-50 rounded-3xl p-6 border border-outline-variant/5">
                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center flex-shrink-0">
                        <MaterialIcon name="location_on" className="text-primary" fill />
                     </div>
                     <div className="space-y-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Coordination Note</p>
                        <p className="text-[11px] font-medium text-slate-600 leading-relaxed italic">
                           {bookingDetails.locationDescription || "The parent has provided custom instructions. Open details to view the exact address."}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-6 pt-4 border-t border-outline-variant/10">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Children</p>
                    <div className="flex items-center gap-2">
                       <MaterialIcon name="child_care" className="text-primary text-sm" />
                       <span className="text-xs font-black italic text-primary">{bookingDetails.childCount || 1} Registered</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Payout Timeline</p>
                    <div className="flex items-center gap-2">
                       <MaterialIcon name="history" className="text-primary text-sm" />
                       <span className="text-xs font-black italic text-primary">Friday Post-Job</span>
                    </div>
                  </div>
               </div>

               <div className="pt-4">
                  <Link 
                    href={`/dashboard/nanny/bookings/${bookingDetails.id}`}
                    onClick={handleDismiss}
                    className="w-full bg-primary text-white py-5 rounded-2xl font-headline font-black italic uppercase tracking-[0.2em] text-[10px] text-center flex items-center justify-center gap-4 hover:translate-y-[-2px] transition-all shadow-xl shadow-primary/20 group"
                  >
                     View Full Booking Details
                     <MaterialIcon name="arrow_forward" className="text-sm group-hover:translate-x-2 transition-transform" />
                  </Link>
               </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
