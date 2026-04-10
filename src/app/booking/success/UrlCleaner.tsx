"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Removes Stripe-related query parameters from the URL for a cleaner UI.
 */
export function SuccessUrlCleaner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const bookingId = searchParams.get("booking_id");
    
    // Check if we have Stripe clutter in the URL
    if (searchParams.has("payment_intent") || searchParams.has("payment_intent_client_secret")) {
        // Construct clean URL
        const cleanParams = new URLSearchParams();
        if (bookingId) cleanParams.set("booking_id", bookingId);
        
        const cleanUrl = `${window.location.pathname}${cleanParams.toString() ? '?' + cleanParams.toString() : ''}`;
        
        // Use replaceState to avoid adding to history
        window.history.replaceState({}, "", cleanUrl);
        console.log("[URL Cleaner] Cleaned Stripe parameters from success URL.");
    }
  }, [searchParams]);

  return null;
}
