import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join KindredCare | Premium Childcare Registration",
  description: "Create your KindredCare US account as a parent or caregiver and join our elite childcare community.",
};

export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
