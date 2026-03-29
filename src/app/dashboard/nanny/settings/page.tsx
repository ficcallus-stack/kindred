"use client";

import { useAuth } from "@/lib/auth-context";
import { MaterialIcon } from "@/components/MaterialIcon";

export default function NannySettingsPage() {
  const { user, dbUser, signOut } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-8">
      <div>
        <h1 className="font-headline text-3xl font-extrabold text-primary tracking-tight">Account Settings</h1>
        <p className="text-on-surface-variant font-medium mt-1">Manage your professional profile and security preferences.</p>
      </div>

      <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 space-y-8">
        
        {/* Profile Info */}
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <MaterialIcon name="face" className="text-4xl text-primary" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="font-headline text-2xl font-bold text-primary">{user?.displayName || "Nanny Account"}</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black px-2 py-0.5 rounded bg-primary text-white uppercase tracking-wider">
                {dbUser?.role === "caregiver" ? "Nanny" : dbUser?.role || "Member"}
              </span>
              <span className="text-sm text-on-surface-variant font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Account Details */}
        <div>
          <h3 className="font-headline text-lg font-bold text-primary mb-4">Account Details</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-surface rounded-2xl border border-outline-variant/10">
              <div>
                <p className="font-bold text-sm text-primary">Email Address</p>
                <p className="text-sm text-on-surface-variant">{user?.email}</p>
              </div>
              <div className="mt-2 sm:mt-0 flex items-center gap-1.5 text-secondary text-sm font-bold bg-secondary/10 px-3 py-1.5 rounded-xl">
                <MaterialIcon name="verified" className="text-[18px]" />
                {dbUser?.emailVerified ? "Verified" : "Pending Verification"}
              </div>
            </div>
          </div>
        </div>

        <hr className="border-outline-variant/20" />

        {/* Danger Zone */}
        <div>
          <h3 className="font-headline text-lg font-bold text-error mb-4">Session Management</h3>
          <div className="bg-error-container/20 p-6 rounded-2xl border border-error/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-error">Current Session</p>
              <p className="text-sm text-error/80 mt-1">Sign out of your nanny account on this device.</p>
            </div>
            <button
              onClick={signOut}
              className="px-6 py-3 bg-error text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm shrink-0 flex items-center gap-2"
            >
              <MaterialIcon name="logout" className="text-[18px]" />
              Sign Out Securely
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
