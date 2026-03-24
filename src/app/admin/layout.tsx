"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

const ADMIN_USER_IDS = (process.env.NEXT_PUBLIC_ADMIN_USER_IDS || "").split(",").filter(Boolean);

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      // If no admin IDs are configured, allow access (dev mode)
      // In production, set ADMIN_USER_IDS env var
      if (ADMIN_USER_IDS.length === 0 || ADMIN_USER_IDS.includes(user.id)) {
        setIsAuthorized(true);
      }
    }
  }, [isLoaded, user]);

  const navItems = [
    { label: "Overview", href: "/admin", icon: "dashboard" },
    { label: "Analytics", href: "/admin/analytics", icon: "insights" },
    { label: "Caregiver Vetting", href: "/admin/caregivers", icon: "verified_user" },
    { label: "Family Vetting", href: "/admin/families", icon: "family_restroom" },
    { label: "Payments", href: "/admin/payments", icon: "payments" },
    { label: "Settings", href: "/admin/settings", icon: "settings" },
  ];

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#fcfcff] flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
          <div className="absolute inset-0 rounded-full border-4 border-[#002B5B] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#fcfcff] flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-red-50 rounded-3xl flex items-center justify-center mx-auto">
            <MaterialIcon name="lock" className="text-5xl text-red-500" />
          </div>
          <div className="space-y-3">
            <h1 className="font-headline text-3xl font-black text-[#002B5B] tracking-tighter">
              Access Denied
            </h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              You don't have permission to access the admin panel. Please contact an administrator.
            </p>
          </div>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-[#002B5B] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:-translate-y-1 transition-all"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcff] text-on-surface flex min-h-screen">
      {/* Shared Component: SideNavBar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] z-50 bg-white border-r border-slate-100 flex flex-col p-6 space-y-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-black/10">
            <div className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Kindred</div>
          </div>
          <div>
            <h1 className="text-[17px] font-black text-[#002B5B] leading-tight tracking-tight">Kindred Core</h1>
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400 font-black">Marketplace Admin</p>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={cn(
                  "py-3 px-4 flex items-center gap-4 rounded-xl transition-all duration-300 group",
                  isActive 
                    ? "bg-white text-[#002B5B] shadow-[0_10px_25px_rgba(0,0,0,0.05)] border border-slate-50 scale-[1.02]" 
                    : "text-slate-500 hover:text-[#002B5B] hover:bg-slate-50"
                )}
              >
                <MaterialIcon 
                  name={item.icon} 
                  fill={isActive}
                  className={cn(
                    "text-[22px]",
                    isActive ? "text-[#002B5B]" : "text-slate-400 group-hover:text-[#002B5B]"
                  )} 
                />
                <span className={cn(
                  "text-[14px] font-black tracking-tight",
                  isActive ? "opacity-100" : "opacity-80 group-hover:opacity-100"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="pt-8 border-t border-slate-100 space-y-2 mt-auto">
          <div className="px-5 py-5 bg-[#C7E6EB] text-[#002021] rounded-[1.75rem] mb-4">
            <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.15em] mb-3">
              <span>System Health</span>
              <span>100%</span>
            </div>
            <div className="w-full bg-[#002021]/10 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#1A4E50] h-full w-full"></div>
            </div>
          </div>
          
          <Link href="/admin/support" className="text-slate-500 py-3 px-5 flex items-center gap-4 hover:bg-slate-50 rounded-xl transition-all font-black uppercase tracking-widest text-[9px] opacity-60">
            <MaterialIcon name="help_outline" className="text-lg" />
            <span>Support</span>
          </Link>
          <Link href="/" className="w-full text-slate-500 py-3 px-5 flex items-center gap-4 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all font-black uppercase tracking-widest text-[9px] opacity-60">
            <MaterialIcon name="logout" className="text-lg" />
            <span>Back to Site</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] min-h-screen flex flex-col relative">
        {/* Shared Component: TopNavBar */}
        <header className="fixed top-0 right-0 w-[calc(100%-280px)] z-40 bg-white border-b border-slate-100/60 h-20 flex justify-between items-center px-10 ml-auto shadow-sm shadow-black/5">
          <div className="flex items-center gap-6">
            <div className="relative group">
              <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-[20px] group-focus-within:text-[#002B5B] transition-colors" />
              <input 
                className="pl-12 pr-6 py-3 bg-[#F8F9FE] border-none rounded-2xl text-[14px] w-96 focus:ring-2 focus:ring-[#002B5B]/10 transition-all font-bold placeholder:text-slate-400 placeholder:font-bold" 
                placeholder="Search caregivers..." 
                type="text" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-[#002B5B] hover:bg-slate-50 rounded-2xl transition-all relative">
              <MaterialIcon name="notifications" className="text-[24px]" />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-[3px] border-white ring-1 ring-red-500/20"></span>
            </button>
            <button className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-[#002B5B] hover:bg-slate-50 rounded-2xl transition-all">
              <MaterialIcon name="settings_suggest" className="text-[24px]" />
            </button>
            
            <div className="h-8 w-px bg-slate-100 mx-4"></div>
            
            <div className="flex items-center gap-4 pl-2">
              <div className="text-right">
                <p className="text-[15px] font-black text-[#002B5B] leading-tight tracking-tight">{user?.fullName || "Admin"}</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Administrator</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-[#002B5B] flex items-center justify-center text-white font-black text-lg">
                {user?.firstName?.charAt(0) || "A"}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pt-20">
          {children}
        </div>
      </main>
    </div>
  );
}
