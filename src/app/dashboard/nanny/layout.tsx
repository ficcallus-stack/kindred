import { syncUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";
import NannyDashboardLayout from "./layout-client";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function ServerLayout({ children }: LayoutProps) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "caregiver" && user.role !== "admin") {
    redirect("/dashboard/parent");
  }

  return <NannyDashboardLayout>{children}</NannyDashboardLayout>;
}
