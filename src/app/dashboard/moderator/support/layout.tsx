import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ModeratorSupportLayout({ children }: { children: React.ReactNode }) {
  const clerkUser = await requireUser();
  const dbUser = await db.query.users.findFirst({ where: eq(users.id, clerkUser.uid) });
  
  if (dbUser?.role !== "moderator" && dbUser?.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
      {children}
    </div>
  );
}
