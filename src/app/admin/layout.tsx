import { ReactNode } from "react";
import { requireAdmin } from "@/lib/auth";
import AdminShell from "@/components/AdminShell";

/**
 * Server-side admin layout.
 * requireAdmin() redirects non-admins to "/" before any data is rendered.
 *
 * To grant admin access, set publicMetadata to { "role": "admin" }
 * in Clerk Dashboard → Users → [user] → Metadata.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <AdminShell
      adminName={admin.fullName || "Admin"}
      adminInitial={admin.firstName?.charAt(0) || "A"}
    >
      {children}
    </AdminShell>
  );
}
