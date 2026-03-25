import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Server-side admin guard.
 * Checks DB role for "admin".
 */
export async function requireAdmin() {
  const serverUser = await getServerUser();

  if (!serverUser) {
    redirect("/login");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, serverUser.uid),
  });

  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }

  return dbUser;
}

/**
 * Non-redirecting admin check for conditional rendering.
 * Returns the user if admin, null otherwise.
 */
export async function isAdmin() {
  const serverUser = await getServerUser();
  if (!serverUser) return null;

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, serverUser.uid),
  });

  return dbUser?.role === "admin" ? dbUser : null;
}
