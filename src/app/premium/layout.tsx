import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Premium Membership | KindredCare US",
  description: "Upgrade to KindredCare Premium for priority booking, exclusive caregiver access, and concierge support.",
};

export default function PremiumLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
