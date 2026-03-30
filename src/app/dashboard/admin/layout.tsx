export const dynamic = "force-dynamic";

import { syncUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";
import AdminDashboardLayoutClient from "./layout-client";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: LayoutProps) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "admin") {
    redirect("/");
  }

  return <AdminDashboardLayoutClient user={user}>{children}</AdminDashboardLayoutClient>;
}
