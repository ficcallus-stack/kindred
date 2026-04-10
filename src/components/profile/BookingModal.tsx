"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { motion, AnimatePresence } from "framer-motion";
import { HireSuccessView } from "./HireSuccessView";
import { bookJobApplicant } from "@/app/dashboard/parent/jobs/actions";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  nanny: {
    id: string;
    name: string;
    hourlyRate: string;
    weeklyRate?: string;
  };
  jobContext?: {
    id: string;
    title: string;
    applicationId: string;
    budget: string;
    duration: string;
    location: string;
  };
}

export function BookingModal({ isOpen, onClose, nanny, jobContext }: BookingModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standard Booking State (unused in quick-hire)
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    hoursPerDay: 8,
    notes: "",
  });

  const isQuickHire = !!jobContext;

  const handleHireConfirm = async () => {
    if (!jobContext) return;
    setLoading(true);
    setError(null);
    try {
      const result = await bookJobApplicant(jobContext.applicationId);
      if (result.success) {
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm hire. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStandardSubmit = async () => {
    alert("Standard booking is being updated. Please use the Quick Hire workflow for job applicants.");
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="relative w-full max-w-xl bg-surface-container-low rounded-[3rem] shadow-2xl overflow-hidden border border-white/5"
        >
          {isSuccess ? (
            <HireSuccessView 
              nannyName={nanny.name} 
              jobTitle={jobContext?.title || "Care Job"} 
              onClose={onClose} 
            />
          ) : (
            <>
              {/* Header */}
              <div className="bg-primary p-10 text-white relative">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <MaterialIcon name={isQuickHire ? "verified_user" : "lock"} size={28} fill />
                  </div>
                  <div>
                    <h2 className="font-headline text-3xl font-black italic tracking-tighter">
                      {isQuickHire ? "Confirm Hire" : "Secure Booking"}
                    </h2>
                    <p className="opacity-80 text-[10px] uppercase font-black tracking-[0.2em]">With {nanny.name}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="absolute top-10 right-10 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <MaterialIcon name="close" />
                </button>
              </div>

              <div className="p-10 space-y-8">
                {error && (
                  <div className="bg-error-container text-on-error-container p-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-shake">
                    <MaterialIcon name="error" /> {error}
                  </div>
                )}

                {isQuickHire ? (
                  /* QUICK HIRE SUMMARY VIEW */
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase text-secondary tracking-widest font-label">Agreement Summary</div>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/5">
                           <div className="text-secondary font-black text-xl italic font-headline uppercase tracking-tighter mb-1">"{jobContext.title}"</div>
                           <div className="text-xs font-bold text-on-surface-variant/60 flex items-center gap-2">
                              <MaterialIcon name="calendar_today" size={16} /> 
                              {jobContext.duration} • {jobContext.location}
                           </div>
                        </div>
                        <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 flex justify-between items-end">
                           <div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-primary font-label">Pre-Paid Budget</div>
                              <div className="text-3xl font-black text-primary italic font-headline tracking-tighter">{jobContext.budget}</div>
                           </div>
                           <div className="text-right">
                              <div className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40 font-label">Payment Method</div>
                              <div className="text-sm font-bold text-on-surface-variant">Escrow (Stripe)</div>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-surface-dim/30 p-6 rounded-3xl border border-outline-variant/10 flex gap-4 items-start">
                      <MaterialIcon name="privacy_tip" className="text-secondary" />
                      <div>
                        <h4 className="font-black text-[11px] uppercase tracking-widest text-primary mb-1">Implicit Disclosure</h4>
                        <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed">
                          By clicking "Confirm & Hire", your mobile number will be automatically shared with {nanny.name.split(' ')[0]} to facilitate coordination.
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={handleHireConfirm}
                      disabled={loading}
                      className="w-full py-5 bg-gradient-to-r from-primary to-primary-container text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3 font-label"
                    >
                      {loading ? "Completing Hire..." : "Confirm & Hire Now"} <MaterialIcon name="check_circle" fill />
                    </button>
                  </div>
                ) : (
                  /* STANDARD BOOKING VIEW (Legacy Fallback) */
                  <div className="space-y-6">
                    <p className="text-sm text-center font-medium opacity-60 italic">Please use the Hire button next to applicant names for job-based bookings.</p>
                  </div>
                )}

                <p className="text-[9px] text-center text-on-surface-variant font-bold uppercase tracking-widest opacity-30 px-8 leading-relaxed font-label">
                   Locked in global escrow by Kindred Security
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
