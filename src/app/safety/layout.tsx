import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety & Trust Center | KindredCare US",
  description: "Learn about our rigorous vetting process, background checks, and how we ensure a safe environment for your family.",
};

export default function SafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
