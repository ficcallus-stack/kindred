import { syncUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";
import ModeratorDashboardLayoutClient from "./layout-client";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function ServerLayout({ children }: LayoutProps) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "moderator" && user.role !== "admin") {
    redirect("/dashboard/parent");
  }

  return <ModeratorDashboardLayoutClient>{children}</ModeratorDashboardLayoutClient>;
}
