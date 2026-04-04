"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading: isLoading, role, signOut } = useAuth();
  const isSignedIn = !!user && !user.isAnonymous;
  const isLoaded = !isLoading;

  const NavLink = ({ href, label, icon, secondaryIcon }: { href: string; label: string; icon: string; secondaryIcon?: string }) => (
    <Link href={href} className="hover:text-primary transition-all duration-300 py-2 flex items-center gap-1.5 px-3 rounded-xl hover:bg-primary/5 group">
      <MaterialIcon name={icon} className={cn("text-lg", secondaryIcon && "group-hover:text-secondary")} />
      <span className="font-headline font-bold text-[13px] tracking-tight">{label}</span>
    </Link>
  );

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-500">
        <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group whitespace-nowrap">
            <div className="w-10 h-10 bg-primary/90 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-all duration-500 hover:rotate-3">
              <span className="text-white font-black text-xl italic tracking-tighter">KC</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 font-headline hidden sm:block">
              KindredCare <span className="text-primary italic">US</span>
            </span>
          </Link>

          {/* Context-Aware Navigation */}
          <div className="hidden lg:flex items-center gap-2 text-on-surface-variant flex-1 justify-center">
            {isLoaded && isSignedIn && (
              <>
                {/* ROLE: PARENT */}
                {role === "parent" && (
                  <>
                    <NavLink href="/dashboard/parent" label="Dashboard" icon="grid_view" />
                    <NavLink href="/browse" label="Browse Nannies" icon="groups" />
                    <NavLink href="/dashboard/parent/post-job" label="Post Job" icon="post_add" />
                    <NavLink href="/dashboard/messages" label="Messages" icon="chat_bubble" />
                  </>
                )}

                {/* ROLE: NANNY */}
                {role === "caregiver" && (
                  <>
                    <NavLink href="/dashboard/nanny" label="Dashboard" icon="grid_view" />
                    <NavLink href="/jobs" label="Find Jobs" icon="work" />
                    <NavLink href="/dashboard/messages" label="Messages" icon="chat_bubble" />
                  </>
                )}

                {/* ROLE: MODERATOR */}
                {role === "moderator" && (
                  <>
                    <NavLink href="/dashboard/moderator" label="Dashboard" icon="grid_view" />
                    <NavLink href="/dashboard/moderator/verifications" label="Verifications" icon="verified" />
                    <NavLink href="/dashboard/moderator/support" label="Support" icon="support_agent" />
                    <NavLink href="/dashboard/messages" label="Messages" icon="chat_bubble" />
                  </>
                )}

                {/* ROLE: ADMIN */}
                {role === "admin" && (
                  <>
                    <NavLink href="/dashboard/admin" label="Admin" icon="admin_panel_settings" />
                    <NavLink href="/dashboard/moderator" label="Moderation" icon="shield_person" />
                    <NavLink href="/dashboard/messages" label="Messages" icon="chat_bubble" />
                  </>
                )}
              </>
            )}

            {/* GUEST ONLY */}
            {isLoaded && !isSignedIn && (
              <>
                <NavLink href="/browse" label="Find Nannies" icon="groups" />
                <NavLink href="/register/nanny" label="Become a Nanny" icon="card_membership" />
                <NavLink href="/referrals" label="Refer & Earn" icon="volunteer_activism" />
                <NavLink href="/#how-it-works" label="How it Works" icon="help_outline" />
                <NavLink href="/safety" label="Safety" icon="verified_user" />
                <NavLink href="/pricing" label="Pricing" icon="payments" />
              </>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isLoaded && !isSignedIn && (
              <>
                <Link href="/login" className="hidden sm:block text-slate-600 font-bold font-headline text-sm px-4 py-2 hover:text-primary transition-all">
                  Login
                </Link>
                <Link href="/signup" className="hidden sm:block bg-slate-900 text-white px-7 py-3 rounded-2xl font-black font-headline text-sm shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-wider">
                  Join Now
                </Link>
              </>
            )}
            
            {isLoaded && isSignedIn && (
              <>
                {/* Support Button */}
                <Link
                  href="/dashboard/messages"
                  className="w-11 h-11 rounded-full bg-primary/5 text-primary flex items-center justify-center hover:bg-primary/10 transition-all shadow-sm border border-primary/10 relative"
                  title="Live Support"
                >
                  <MaterialIcon name="support_agent" className="text-xl" />
                  <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white pointer-events-none"></span>
                </Link>

                <div className="relative group">
                  <Link
                    href={`/dashboard/${role === 'admin' ? 'admin' : role === 'moderator' ? 'moderator' : role === 'caregiver' ? 'nanny' : 'parent'}/settings`}
                    className="flex items-center gap-4 bg-slate-50 p-1.5 pr-3 rounded-2xl border border-slate-200/50 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MaterialIcon name="person" className="text-lg text-primary" />
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                        {role === "parent" ? "Family" : role === "caregiver" ? "Nanny" : role?.toUpperCase() || "Member"}
                      </p>
                      <p className="text-[12px] font-bold text-slate-700 leading-none">
                        {user?.displayName || "Account"}
                      </p>
                    </div>
                  </Link>
                  
                  {/* Desktop Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="p-2 space-y-1">
                      <Link
                        href={`/dashboard/${role === 'admin' ? 'admin' : role === 'moderator' ? 'moderator' : role === 'caregiver' ? 'nanny' : 'parent'}/settings`}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all"
                      >
                        <MaterialIcon name="settings" className="text-[18px]" />
                        Account Settings
                      </Link>
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <MaterialIcon name="logout" className="text-[18px]" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Mobile hamburger */}
            <button 
              className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-slate-50 border border-slate-200/50 hover:bg-slate-100 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <MaterialIcon name={mobileOpen ? "close" : "sort"} className="text-2xl text-slate-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-4 top-4 bottom-4 w-[280px] bg-white rounded-[2.5rem] shadow-2xl flex flex-col animate-in slide-in-from-right-8 duration-500 overflow-hidden border border-slate-200/50">
            <div className="p-8 flex items-center justify-between">
              <span className="font-headline font-black text-2xl text-primary tracking-tighter italic">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>
            
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
              {isLoaded && isSignedIn && (
                <>
                  {role === "parent" && (
                    <>
                      <MobileNavLink href="/dashboard/parent" label="Dashboard" icon="grid_view" onClick={() => setMobileOpen(false)} />
                      <MobileNavLink href="/browse" label="Browse Nannies" icon="groups" onClick={() => setMobileOpen(false)} />
                      <MobileNavLink href="/dashboard/parent/post-job" label="Post a Job" icon="post_add" onClick={() => setMobileOpen(false)} />
                    </>
                  )}
                  {role === "caregiver" && (
                    <>
                      <MobileNavLink href="/dashboard/nanny" label="Dashboard" icon="grid_view" onClick={() => setMobileOpen(false)} />
                      <MobileNavLink href="/jobs" label="Find Jobs" icon="work" onClick={() => setMobileOpen(false)} />
                    </>
                  )}
                  {role === "moderator" && (
                    <>
                      <MobileNavLink href="/dashboard/moderator" label="Dashboard" icon="grid_view" onClick={() => setMobileOpen(false)} />
                      <MobileNavLink href="/dashboard/moderator/verifications" label="Verifications" icon="verified" onClick={() => setMobileOpen(false)} />
                    </>
                  )}
                  {role === "admin" && (
                    <>
                      <MobileNavLink href="/dashboard/admin" label="Admin Panel" icon="admin_panel_settings" onClick={() => setMobileOpen(false)} />
                    </>
                  )}
                  <MobileNavLink href="/dashboard/messages" label="Messages" icon="chat_bubble" onClick={() => setMobileOpen(false)} />
                </>
              )}
              {!isSignedIn && (
                <>
                  <MobileNavLink href="/browse" label="Browse Nannies" icon="groups" onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/register/nanny" label="Become a Nanny" icon="card_membership" onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/referrals" label="Refer & Earn" icon="volunteer_activism" onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/#how-it-works" label="How it Works" icon="help_outline" onClick={() => setMobileOpen(false)} />
                  <MobileNavLink href="/pricing" label="Pricing" icon="payments" onClick={() => setMobileOpen(false)} />
                </>
              )}
              <MobileNavLink href="/safety" label="Trust & Safety" icon="verified_user" onClick={() => setMobileOpen(false)} />
            </nav>

            <div className="p-6 bg-slate-50/50 space-y-3">
              {!isSignedIn && (
                <>
                  <Link href="/signup" className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center">Sign Up</Link>
                  <Link href="/login" className="w-full py-4 text-slate-600 font-bold text-sm hover:text-primary transition-all flex items-center justify-center">Login</Link>
                </>
              )}
              {isSignedIn && (
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200/50 shadow-sm">
                  <button
                    onClick={signOut}
                    className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                  >
                    <MaterialIcon name="logout" className="text-lg text-primary" />
                  </button>
                  <div>
                    <p className="text-xs font-black text-primary italic leading-none">{role?.toUpperCase() || "MEMBER"}</p>
                    <p className="text-sm font-bold text-slate-700">{user?.displayName || "Account"}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MobileNavLink({ href, label, icon, onClick }: { href: string; label: string; icon: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-4 px-6 py-4 rounded-3xl text-slate-600 font-headline font-bold text-sm hover:bg-primary/5 hover:text-primary transition-all group"
    >
      <MaterialIcon name={icon} className="text-xl opacity-30 group-hover:opacity-100 transition-opacity" />
      {label}
    </Link>
  );
}
