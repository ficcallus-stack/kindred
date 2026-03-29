"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  user: any;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard Overview", icon: "dashboard", href: "/dashboard/moderator" },
  { id: "verifications", label: "Verifications", icon: "verified_user", href: "/dashboard/moderator/verifications" },
  { id: "moderation", label: "User Moderation", icon: "gavel", href: "/dashboard/moderator/moderation" },
  { id: "support", label: "Support & Tickets", icon: "confirmation_number", href: "/dashboard/moderator/support" },
  { id: "exams-marking", label: "Exam Marking", icon: "assignment", href: "/dashboard/moderator/certifications" },
  { id: "exams-mgmt", label: "Exam Management", icon: "quiz", href: "/dashboard/moderator/exams" },
  { id: "referrals", label: "Referrals", icon: "group_add", href: "/dashboard/moderator/referrals" },
];

export default function ModeratorDashboardLayoutClient({ children, user }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen antialiased flex">
      {/* Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-screen w-64 z-50 bg-slate-50 border-r border-slate-200/50 flex flex-col p-4 gap-2 font-headline text-sm antialiased">
        <div className="px-2 py-6 mb-4">
          <h1 className="text-xl font-extrabold text-blue-950 tracking-tight leading-none italic">Moderator Hub</h1>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Trust & Safety Team</p>
        </div>
        
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.id === "verifications" && pathname.startsWith("/dashboard/moderator/verifications"));
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-white text-blue-900 shadow-sm border border-slate-200/50 font-bold translate-x-1"
                    : "text-slate-600 hover:text-blue-800 hover:bg-blue-50/50"
                )}
              >
                <MaterialIcon 
                  name={item.icon} 
                  className={cn("text-[20px]", isActive ? "text-blue-900" : "text-slate-400 group-hover:text-blue-600")} 
                  fill={isActive}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-slate-200/50 pt-4 space-y-1">
          <button className="w-full mb-4 py-3 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/10 hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 italic">
            <MaterialIcon name="bolt" className="text-sm" fill />
            Quick Verify
          </button>
          
          <Link 
            href="/dashboard/moderator/settings"
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-blue-800 hover:bg-blue-50/50 rounded-lg transition-all duration-200"
          >
            <MaterialIcon name="settings" className="text-[20px] text-slate-400" />
            <span>Settings</span>
          </Link>
          
          <Link 
            href="/login"
            className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-error hover:bg-error/5 rounded-lg transition-all duration-200"
          >
            <MaterialIcon name="logout" className="text-[20px] text-slate-400" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative">
        {/* Top App Bar (Glass) */}
        <header className="fixed top-0 right-0 left-64 z-40 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 py-3 h-16 shadow-sm shadow-blue-900/5 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <span className="text-xs font-black text-blue-950 uppercase tracking-widest italic leading-none">
              {NAV_ITEMS.find(i => pathname === i.href)?.label || "Moderator Hub"}
            </span>
            <div className="h-4 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 text-slate-400 focus-within:text-primary transition-colors group">
              <MaterialIcon name="search" className="text-xl" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-64 placeholder:text-slate-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors relative group">
                <MaterialIcon name="notifications" className="text-xl group-hover:scale-110 transition-transform" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                <MaterialIcon name="help_outline" className="text-xl" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-blue-950 leading-none">{user?.fullName || "Moderator"}</p>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">Personnel ID: {user?.id?.slice(0, 6) || "TEAM"}</p>
              </div>
              <img 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.fullName || "Mod"}`} 
                alt="Profile" 
                className="w-9 h-9 rounded-xl object-cover border-2 border-primary/10 shadow-sm"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-24 pb-12 px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
