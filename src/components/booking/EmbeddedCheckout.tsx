"use client";

import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { MaterialIcon } from "@/components/MaterialIcon";

interface EmbeddedCheckoutProps {
  bookingId: string;
}

export function EmbeddedCheckout({ bookingId }: EmbeddedCheckoutProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/success?booking_id=${bookingId}`,
      },
    });

    if (error) {
      setErrorMessage(error.message || "An unexpected error occurred.");
      setLoading(false);
    } else {
      // Stripe will redirect the user to return_url
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      <PaymentElement options={{ layout: "tabs" }} />
      
      {errorMessage && (
        <div className="p-4 bg-error-container text-on-error-container rounded-xl flex items-start gap-3">
          <MaterialIcon name="error" className="shrink-0" />
          <p className="text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      <button
        disabled={!stripe || loading}
        className="w-full py-5 bg-primary text-white rounded-2xl font-headline font-black text-lg uppercase tracking-[0.1em] flex items-center justify-center gap-3 shadow-xl shadow-primary/20 hover:bg-primary-container hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0 transition-all group"
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <MaterialIcon name="verified_user" className="text-xl group-hover:rotate-12 transition-transform" fill />
            Authorize & Confirm Booking
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 opacity-40">
        <MaterialIcon name="lock" className="text-sm" />
        <span className="text-[9px] font-black uppercase tracking-widest italic">Secured by Stripe Architecture</span>
      </div>
    </form>
  );
}
