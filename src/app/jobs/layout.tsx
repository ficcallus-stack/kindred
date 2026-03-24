import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Available Childcare Jobs | KindredCare US",
  description: "Explore premium childcare opportunities and apply to work with elite families across the nation.",
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
