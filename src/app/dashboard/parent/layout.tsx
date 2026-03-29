import { syncUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";
import ParentDashboardLayout from "./layout-client";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function ServerLayout({ children }: LayoutProps) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "parent" && user.role !== "admin") {
    redirect("/dashboard/nanny");
  }

  return <ParentDashboardLayout user={user}>{children}</ParentDashboardLayout>;
}
