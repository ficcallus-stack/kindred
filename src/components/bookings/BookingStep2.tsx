"use client";

import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface BookingStep2Props {
  onNext: () => void;
  onBack: () => void;
  clientSecret: string;
  amount: number;
  nannyName: string;
  schedule: string;
  hoursPerDay: number;
  hourlyRate: number;
  bookingId: string;
}

export default function BookingStep2({
  onNext,
  onBack,
  clientSecret,
  amount,
  nannyName,
  schedule,
  hoursPerDay,
  hourlyRate,
  bookingId,
}: BookingStep2Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Payment failed");
      setIsProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/parent/bookings?success=true&bookingId=${bookingId}`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment confirmation failed");
      setIsProcessing(false);
      return;
    }

    // Payment authorized (escrow hold)
    onNext();
  };

  const totalDollars = (amount / 100).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Left Column: Payment Form */}
      <div className="lg:col-span-7 space-y-10">
        <header>
          <h1 className="text-4xl font-extrabold font-headline text-primary tracking-tight mb-4">
            Complete Payment
          </h1>
          <p className="text-on-surface-variant text-lg">
            Your booking with {nannyName} is almost confirmed. All transactions are encrypted and secure.
          </p>
        </header>

        {/* Security Badges */}
        <div className="flex items-center space-x-4 p-6 bg-surface-container-low rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mr-4">
            Powered by
          </span>
          <div className="flex space-x-3">
            {["credit_card", "lock", "verified_user"].map((icon) => (
              <div
                key={icon}
                className="w-12 h-8 bg-surface-container-lowest rounded-md flex items-center justify-center border border-outline-variant/15"
              >
                <MaterialIcon name={icon} className="text-primary text-xl" />
              </div>
            ))}
          </div>
          <div className="ml-auto flex items-center text-on-tertiary-container text-xs font-semibold">
            <MaterialIcon name="verified_user" className="mr-2 text-sm" fill />
            Stripe Secure Checkout
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform Credits Toggle (Teaser) */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl flex items-center justify-between opacity-70 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 text-purple-600 flex items-center justify-center rounded-xl">
                 <MaterialIcon name="diamond" />
              </div>
              <div>
                 <p className="font-bold text-slate-700 text-sm">Apply Platform Credits</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Use earned cashback</p>
              </div>
            </div>
            <button type="button" disabled className="px-4 py-2 bg-slate-200 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-lg cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          {/* Stripe Payment Element */}
          <div className="bg-white rounded-2xl p-6 border border-outline-variant/15 shadow-sm">
            <PaymentElement
              options={{
                layout: "tabs",
              }}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <MaterialIcon name="error" className="text-lg" fill />
              {error}
            </div>
          )}

          {/* Escrow Info */}
          <div className="bg-green-50 border border-green-200 p-5 rounded-xl flex items-start gap-3">
            <MaterialIcon name="security" className="text-green-600 text-xl mt-0.5" fill />
            <div>
              <p className="text-green-900 font-bold text-sm">Escrow Protection</p>
              <p className="text-green-700 text-xs mt-1">
                Your payment is held securely until the booking is completed. Funds are only released to the caregiver after you confirm satisfaction.
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button
              className="w-full bg-gradient-to-br from-primary to-primary-container text-white font-bold py-5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center space-x-3 text-lg disabled:opacity-50"
              type="submit"
              disabled={!stripe || isProcessing}
            >
              <MaterialIcon name="lock" fill />
              <span>{isProcessing ? "Processing..." : `Confirm & Pay $${totalDollars}`}</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isProcessing}
              className="w-full py-4 text-on-surface-variant font-bold hover:text-primary transition-colors text-sm disabled:opacity-50"
            >
              Back to Details
            </button>
            <p className="text-center text-[10px] text-on-surface-variant font-medium">
              By clicking Confirm & Pay, you agree to our Terms of Service and Cancellation Policy.
            </p>
          </div>
        </form>
      </div>

      {/* Right Column: Order Summary */}
      <aside className="lg:col-span-5">
        <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-[0_4px_32px_rgba(3,31,65,0.04)] border border-outline-variant/10 sticky top-32">
          <h2 className="text-2xl font-bold font-headline text-primary mb-8 underline decoration-secondary/30 underline-offset-8">Booking Summary</h2>

          <div className="space-y-2 mb-8">
            <div className="flex justify-between items-center py-4 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium text-sm">Caregiver</span>
              <span className="text-primary font-bold text-sm">{nannyName}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium text-sm">Schedule</span>
              <span className="text-primary font-bold text-sm">{schedule}</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium text-sm">Hours/Day</span>
              <span className="text-primary font-bold text-sm">{hoursPerDay} hrs</span>
            </div>
            <div className="flex justify-between items-center py-4 border-b border-surface-container">
              <span className="text-on-surface-variant font-medium text-sm">Hourly Rate</span>
              <span className="text-primary font-bold text-sm">${hourlyRate.toFixed(2)} / hr</span>
            </div>
          </div>

          <div className="space-y-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
            <div className="flex justify-between text-on-surface-variant text-sm font-medium">
              <span>Subtotal</span>
              <span>${totalDollars}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-sm font-medium">
              <span>Service Fee</span>
              <span>$0.00</span>
            </div>
            <div className="pt-4 border-t border-outline-variant/20 flex justify-between items-baseline">
              <span className="text-primary font-extrabold text-xl">Total</span>
              <span className="text-primary font-extrabold text-3xl font-headline">${totalDollars}</span>
            </div>
          </div>

          <div className="mt-8 flex items-center p-4 bg-secondary-fixed-dim/10 rounded-xl border border-secondary-fixed-dim/20">
            <MaterialIcon name="lightbulb" className="text-secondary mr-3" />
            <p className="text-xs text-on-secondary-fixed-variant leading-tight">
              <span className="font-bold">Escrow Hold:</span> Payment is held securely and only released after your confirmation.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
