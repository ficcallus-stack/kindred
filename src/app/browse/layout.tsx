import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Elite Nannies | KindredCare US",
  description: "Find highly qualified, vetted, and trusted childcare professionals in your area.",
};

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
