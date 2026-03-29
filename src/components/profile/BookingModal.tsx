"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  nanny: {
    id: string;
    name: string;
    hourlyRate: string;
  };
}

export function BookingModal({ isOpen, onClose, nanny }: BookingModalProps) {
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    hoursPerDay: 8,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Constants
  const PLATFORM_FEE_RATE = 0.025; // 2.5%
  const hourlyRate = parseFloat(nanny.hourlyRate) || 0;

  // Calculate Breakdown
  const calculateTotal = () => {
    if (!formData.startDate || !formData.endDate) return { subtotal: 0, fee: 0, total: 0, days: 0 };
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    // Difference in days (+1 to include both start and end day if it's a range)
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays <= 0) return { subtotal: 0, fee: 0, total: 0, days: 0 };

    const subtotal = diffDays * formData.hoursPerDay * hourlyRate;
    const fee = subtotal * PLATFORM_FEE_RATE;
    const total = subtotal + fee;

    return { subtotal, fee, total, days: diffDays };
  };

  const { subtotal, fee, total, days } = calculateTotal();

  const handleSubmit = async () => {
    if (total <= 0) {
      setError("Please select a valid date range.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Import the action dynamically to avoid bundle bloat
      const { createBookingSession } = await import("@/lib/actions/booking-actions");
      
      const { url } = await createBookingSession({
        caregiverId: nanny.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        hoursPerDay: formData.hoursPerDay,
        totalAmount: Math.round(total * 100), // convert to cents
        notes: formData.notes
      });

      if (url) {
        window.location.href = url;
      } else {
        throw new Error("Failed to generate payment link.");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
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
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl bg-surface-container-low rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10"
        >
          {/* Header */}
          <div className="bg-primary p-8 text-white relative">
            <h2 className="font-headline text-3xl font-black italic tracking-tighter">Secure Booking</h2>
            <p className="opacity-80 text-sm mt-1 uppercase tracking-widest font-bold">With {nanny.name}</p>
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <MaterialIcon name="close" />
            </button>
          </div>

          <div className="p-8 space-y-8">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                <MaterialIcon name="error" /> {error}
              </div>
            )}

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest px-1">Start Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest px-1">End Date</label>
                <input 
                  type="date" 
                  min={formData.startDate || new Date().toISOString().split("T")[0]}
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end mb-2">
                <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest px-1">Hours Per Day</label>
                <span className="text-xl font-black text-primary italic">{formData.hoursPerDay} hrs</span>
              </div>
              <input 
                type="range" min="1" max="24"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursPerDay: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest px-1">Specific Instructions (Optional)</label>
              <textarea 
                placeholder="e.g. Please bring extra outdoor gear..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full bg-surface-container-low border border-outline-variant/20 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm min-h-[100px]"
              />
            </div>

            {/* Price Breakdown */}
            <div className="bg-surface-container p-6 rounded-3xl space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Subtotal ({days} days @ ${nanny.hourlyRate}/hr)</span>
                <span className="font-bold text-on-surface">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant font-medium">Platform Fee (2.5%)</span>
                <span className="font-bold text-on-surface">${fee.toFixed(2)}</span>
              </div>
              <div className="h-px bg-outline-variant/20 my-2" />
              <div className="flex justify-between items-end">
                <span className="text-sm font-black uppercase tracking-widest text-primary">Total to Pay</span>
                <span className="text-3xl font-black text-primary italic tracking-tighter">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleSubmit}
                disabled={loading || total <= 0}
                className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? "Preparing Secure Payment..." : "Proceed to Checkout"} <MaterialIcon name="lock" fill />
              </button>
              <p className="text-[9px] text-center text-on-surface-variant font-medium uppercase tracking-tight opacity-50 px-8 leading-relaxed">
                By clicking "Proceed to Checkout", you will be redirected to Stripe for secure payment processing. Funds are held in escrow until booking completion.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
