"use client";

import { useState, useEffect, useCallback } from "react";
import { getUsers, getUserStats, updateUserRole } from "./actions";
import { MaterialIcon } from "@/components/MaterialIcon";

type UserRole = "parent" | "caregiver" | "admin" | "moderator";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
}

interface Stats {
  total: number;
  parents: number;
  caregivers: number;
  moderators: number;
  admins: number;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers(page, search, roleFilter);
      setUsers(data.users as User[]);
      setTotalPages(data.totalPages);
    } catch (e) {
      console.error("Failed to fetch users:", e);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [fetchUsers, fetchStats]);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!confirm(`Are you sure you want to change this user's role to "${newRole}"?`)) return;
    setUpdating(userId);
    try {
      await updateUserRole(userId, newRole);
      await fetchUsers();
      await fetchStats();
    } catch (e: any) {
      alert(e.message || "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const roleBadgeStyle = (role: string) => {
    const styles: Record<string, string> = {
      parent: "bg-blue-100 text-blue-800",
      caregiver: "bg-green-100 text-green-800",
      moderator: "bg-purple-100 text-purple-800",
      admin: "bg-red-100 text-red-800",
    };
    return styles[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-surface p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-headline text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-on-surface-variant">Manage users, roles, and platform settings.</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { label: "Total Users", value: stats.total, icon: "group", color: "bg-primary/10 text-primary" },
              { label: "Parents", value: stats.parents, icon: "family_restroom", color: "bg-blue-50 text-blue-700" },
              { label: "Caregivers", value: stats.caregivers, icon: "child_care", color: "bg-green-50 text-green-700" },
              { label: "Moderators", value: stats.moderators, icon: "shield_person", color: "bg-purple-50 text-purple-700" },
              { label: "Admins", value: stats.admins, icon: "admin_panel_settings", color: "bg-red-50 text-red-700" },
            ].map((s) => (
              <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
                <div className="flex items-center gap-2 mb-1">
                  <MaterialIcon name={s.icon} className="text-lg" />
                  <span className="text-xs font-medium uppercase tracking-wider">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* User Management Section */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/20 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 md:p-6 border-b border-outline-variant/20">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <h2 className="font-headline text-xl font-bold text-primary flex items-center gap-2">
                <MaterialIcon name="manage_accounts" />
                User Management
              </h2>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="px-4 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none"
                  />
                  <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                    Search
                  </button>
                </form>
                <select
                  value={roleFilter}
                  onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                  className="px-3 py-2 rounded-lg border border-outline-variant/30 bg-surface text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  <option value="">All Roles</option>
                  <option value="parent">Parents</option>
                  <option value="caregiver">Caregivers</option>
                  <option value="moderator">Moderators</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low text-left">
                  <th className="px-6 py-3 font-medium text-on-surface-variant">User</th>
                  <th className="px-6 py-3 font-medium text-on-surface-variant">Email</th>
                  <th className="px-6 py-3 font-medium text-on-surface-variant">Role</th>
                  <th className="px-6 py-3 font-medium text-on-surface-variant">Verified</th>
                  <th className="px-6 py-3 font-medium text-on-surface-variant">Joined</th>
                  <th className="px-6 py-3 font-medium text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                        Loading users...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant">No users found</td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-on-surface">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleBadgeStyle(u.role)}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {u.emailVerified ? (
                        <MaterialIcon name="check_circle" className="text-green-600 text-lg" />
                      ) : (
                        <MaterialIcon name="cancel" className="text-red-400 text-lg" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant text-xs">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {u.role === "admin" ? (
                        <span className="text-xs text-on-surface-variant italic">Protected</span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={updating === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="px-2 py-1 rounded border border-outline-variant/30 bg-surface text-xs disabled:opacity-50 focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                          <option value="parent">Parent</option>
                          <option value="caregiver">Caregiver</option>
                          <option value="moderator">Moderator</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-outline-variant/20 flex items-center justify-between">
              <p className="text-xs text-on-surface-variant">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-outline-variant/30 text-sm disabled:opacity-50 hover:bg-surface-container-low transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-outline-variant/30 text-sm disabled:opacity-50 hover:bg-surface-container-low transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security Note */}
        <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 text-xs text-on-surface-variant">
          <p className="flex items-center gap-2">
            <MaterialIcon name="info" className="text-sm" />
            <strong>Security:</strong> Moderator roles can be assigned here. Admin roles must be set directly in the database for safety.
            Role changes sync to Firebase custom claims immediately.
          </p>
        </div>
      </div>
    </div>
  );
}
