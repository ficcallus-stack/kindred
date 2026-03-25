import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Server-side admin guard.
 * Checks Clerk publicMetadata for { role: "admin" }.
 * 
 * Usage in any server component or server action:
 *   const user = await requireAdmin();
 *
 * To set an admin, go to Clerk Dashboard → Users → [user] → Metadata
 * and set publicMetadata to: { "role": "admin" }
 */
export async function requireAdmin() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const role = (user.publicMetadata as { role?: string })?.role;

  if (role !== "admin") {
    redirect("/");
  }

  return user;
}

/**
 * Non-redirecting admin check for conditional rendering.
 * Returns the user if admin, null otherwise.
 */
export async function isAdmin() {
  const user = await currentUser();
  if (!user) return null;

  const role = (user.publicMetadata as { role?: string })?.role;
  return role === "admin" ? user : null;
}
