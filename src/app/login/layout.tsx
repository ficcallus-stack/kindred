import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | KindredCare US",
  description: "Access your KindredCare account to manage your childcare bookings and profile.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
