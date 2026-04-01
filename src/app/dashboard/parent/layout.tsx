export const dynamic = "force-dynamic";

import { syncUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";
import ParentDashboardLayout from "./layout-client";

import { RoleGate } from "@/components/dashboard/RoleGate";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface LayoutProps {
  children: React.ReactNode;
}

export default async function ServerLayout({ children }: LayoutProps) {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role !== "parent" && user.role !== "admin") {
    // Fetch last switch time directly from DB
    const [dbUser] = await db.select({ lastRoleSwitchedAt: users.lastRoleSwitchedAt }).from(users).where(eq(users.id, user.id)).limit(1);

    return (
      <ParentDashboardLayout user={user}>
        <RoleGate 
           currentRole={user.role} 
           intendedRole="parent" 
           lastSwitchedAt={dbUser?.lastRoleSwitchedAt}
        />
      </ParentDashboardLayout>
    );
  }

  return <ParentDashboardLayout user={user}>{children}</ParentDashboardLayout>;
}
