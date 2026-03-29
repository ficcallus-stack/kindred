"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PaymentStepProps {
  booking: any;
  nanny: any;
  savedCards: any[];
}

export function PaymentStep({ booking, nanny, savedCards }: PaymentStepProps) {
  const [loading, setLoading] = useState(false);
  
  // Calculations
  const hourlyRate = parseFloat(nanny.hourlyRate) || 0;
  const days = Math.ceil(Math.abs(new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const subtotal = days * booking.hoursPerDay * hourlyRate;
  const platformFee = subtotal * 0.025;
  const total = subtotal + platformFee;

  const handleSecureFunds = async () => {
    setLoading(true);
    try {
      const { createFinalPaymentSession } = await import("@/lib/actions/booking-actions");
      const { url } = await createFinalPaymentSession({ bookingId: booking.id });
      if (url) window.location.href = url;
    } catch (err) {
      alert("Payment session failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* LHS: Payment & Security */}
      <div className="lg:col-span-7 space-y-8">
        <section className="space-y-6">
          <h1 className="font-headline text-4xl font-extrabold text-primary tracking-tight">Secure Escrow Payment</h1>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-xl">
            Your trust is our priority. We use a secure escrow system to ensure your funds are protected until the service is successfully completed.
          </p>
        </section>

        {/* Escrow Explanation Card */}
        <div className="bg-tertiary-fixed/30 p-8 rounded-2xl flex gap-6 items-start">
          <div className="bg-tertiary-container text-on-tertiary rounded-xl p-3 flex items-center justify-center">
            <MaterialIcon name="verified_user" fill />
          </div>
          <div>
            <h3 className="font-headline text-lg font-bold text-on-tertiary-fixed">Peace of Mind Guarantee</h3>
            <p className="text-on-tertiary-fixed-variant mt-2 leading-relaxed">
              Funds are held securely in escrow and released only after care is completed. <span className="font-bold">100% refund</span> if the booking is cancelled according to our flexible policy.
            </p>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-4">
          <h2 className="font-headline text-xl font-bold text-primary">Select Payment Method</h2>
          <div className="space-y-3">
            {savedCards.length > 0 ? (
              savedCards.map((card, idx) => (
                <label key={card.id} className="group relative flex items-center justify-between p-5 bg-white border-2 border-transparent rounded-xl cursor-pointer hover:bg-surface-container-low transition-all has-[:checked]:border-secondary-container has-[:checked]:bg-white shadow-sm">
                  <input defaultChecked={idx === 0} className="sr-only" name="payment_method" type="radio"/>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-surface-container rounded flex items-center justify-center overflow-hidden">
                       <MaterialIcon name="credit_card" />
                    </div>
                    <div>
                      <p className="font-bold text-on-surface uppercase">{card.card.brand} ending in {card.card.last4}</p>
                      <p className="text-xs text-on-surface-variant">Expires {card.card.exp_month}/{card.card.exp_year}</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-outline-variant group-has-[:checked]:border-secondary-container group-has-[:checked]:bg-secondary-container flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white opacity-0 group-has-[:checked]:opacity-100"></div>
                  </div>
                </label>
              ))
            ) : (
              <div className="p-10 text-center bg-white rounded-2xl border-2 border-dashed border-outline-variant/30 text-on-surface-variant font-medium">
                No saved cards yet. Please add one below.
              </div>
            )}
            
            <button 
              onClick={handleSecureFunds}
              className="w-full flex items-center justify-center gap-2 p-5 border-2 border-dashed border-outline-variant/50 rounded-xl text-on-surface-variant font-medium hover:border-primary/30 hover:text-primary transition-all"
            >
              <MaterialIcon name="add_circle" />
              Add New Payment Method
            </button>
          </div>
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap gap-4 pt-4 items-center opacity-50 grayscale">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
            <MaterialIcon name="lock" className="text-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Bank-grade Encryption</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low rounded-full">
            <MaterialIcon name="shield_with_heart" className="text-sm" />
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Stripe Secure</span>
          </div>
        </div>
      </div>

      {/* RHS Summary Card */}
      <aside className="lg:col-span-5 sticky top-32">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-outline-variant/10 space-y-8 relative overflow-hidden">
          <div>
            <h2 className="font-headline text-2xl font-bold text-primary mb-6">Booking Summary</h2>
            <div className="flex items-center gap-5 mb-8">
              <div className="relative w-24 h-24">
                 <div className="w-full h-full bg-primary-container rounded-2xl rotate-[-3deg] shadow-lg overflow-hidden" />
                 <div className="absolute -bottom-2 -right-2 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
              </div>
              <div>
                <p className="text-[9px] font-black italic text-secondary uppercase tracking-[0.2em] mb-1">Premium Caregiver</p>
                <h3 className="font-headline text-2xl font-black italic text-primary">{nanny.name}</h3>
                <div className="flex items-center text-sm font-bold opacity-60">
                   Brooklyn, NY
                </div>
              </div>
            </div>

            <div className="space-y-4 border-y border-outline-variant/10 py-6">
              <div className="flex justify-between items-center">
                 <span className="text-sm font-black opacity-40 uppercase tracking-widest">Rate</span>
                 <span className="font-black italic text-primary">${hourlyRate}/hr</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-on-surface-variant font-medium">Platform Fee (2.5%)</span>
                <span className="font-bold text-on-surface">${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <div>
                   <p className="text-[9px] font-black uppercase tracking-[0.2em] text-secondary font-label mb-1">Total to Escrow</p>
                   <p className="font-headline text-5xl font-black italic tracking-tighter text-primary">${total.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-on-surface-variant uppercase font-black tracking-tighter opacity-40">Fully Refundable*</p>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={handleSecureFunds}
            disabled={loading}
            className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <MaterialIcon name="lock" fill />
            {loading ? "Authorizing..." : "Secure Funds & Finalize"}
          </button>
          <p className="text-[9px] text-center text-on-surface-variant px-4 opacity-50 font-bold uppercase leading-relaxed">
            By clicking, you authorize KindredCare to hold these funds. They will be transferred only after the care period ends.
          </p>
        </div>
      </aside>
    </div>
  );
}
