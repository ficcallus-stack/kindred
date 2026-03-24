"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeProviderProps {
  children: React.ReactNode;
  clientSecret?: string;
}

export function StripeProvider({ children, clientSecret }: StripeProviderProps) {
  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe" as const,
          variables: {
            colorPrimary: "#031f41",
            colorBackground: "#ffffff",
            colorText: "#031f41",
            colorDanger: "#ba1a1a",
            fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
            borderRadius: "12px",
            spacingUnit: "4px",
          },
          rules: {
            ".Input": {
              border: "1px solid #e2e8f0",
              boxShadow: "none",
              padding: "14px 16px",
            },
            ".Input:focus": {
              border: "1px solid #031f41",
              boxShadow: "0 0 0 3px rgba(3,31,65,0.1)",
            },
            ".Label": {
              fontWeight: "700",
              fontSize: "14px",
              marginBottom: "8px",
            },
          },
        },
      }
    : undefined;

  if (!clientSecret) {
    return <>{children}</>;
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}

export { stripePromise };
