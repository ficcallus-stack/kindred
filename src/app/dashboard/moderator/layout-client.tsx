"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Overview", icon: "dashboard", href: "/dashboard/moderator" },
  { id: "verifications", label: "Verifications", icon: "verified_user", href: "/dashboard/moderator/verifications" },
  { id: "moderation", label: "User Moderation", icon: "gavel", href: "/dashboard/moderator/moderation" },
  { id: "support", label: "Support & Tickets", icon: "confirmation_number", href: "/dashboard/moderator/support" },
];

export default function ModeratorDashboardLayoutClient({ children }: LayoutProps) {
  const pathname = usePathname();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen antialiased flex">
      {/* SideNavBar */}
      <aside className="h-screen w-64 border-r border-slate-200 dark:border-slate-800 fixed left-0 top-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col py-6 font-headline text-sm font-medium">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-white font-fill">verified_user</span>
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-blue-900 dark:text-blue-200 leading-tight">Moderator Portal</h1>
            <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">Safety & Trust</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold duration-200 text-sm",
                pathname === item.href
                  ? "bg-blue-100/50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-blue-900 dark:hover:text-blue-200 hover:bg-white dark:hover:bg-slate-900 hover:shadow-sm"
              )}
            >
              <MaterialIcon name={item.icon} fill={pathname === item.href} className="text-xl" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-3 mt-auto space-y-1">
          <Link href="/dashboard/moderator/help" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-blue-900 transition-all font-semibold text-sm">
            <MaterialIcon name="help" className="text-xl" />
            <span>Help Center</span>
          </Link>
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-error transition-all font-semibold text-sm">
            <MaterialIcon name="logout" className="text-xl text-error" />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 min-h-screen">
        {/* Top App Bar */}
        <header className="fixed top-0 left-64 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-8 py-4 border-b border-slate-100 dark:border-slate-800 shadow-sm shadow-blue-900/5">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors material-symbols-outlined text-xl">search</span>
              <input 
                type="text" 
                placeholder="Search application ID or user..." 
                className="w-full bg-slate-100 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-blue-50/50 rounded-full transition-all active:scale-95 relative">
              <MaterialIcon name="notifications" className="text-xl" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-blue-50/50 rounded-full transition-all active:scale-95">
              <MaterialIcon name="settings" className="text-xl" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyQG9iW4uAzlqP--n2wmBmazv4mMCIH_nyPHhak3nMkBgDJybBEyk2KjK6e9Qk_QZTWN-BWoQXkOqa7hqRCdrSozChs2ZwqhAAc5ku410J_QvJAMt34NZXbfm2zfYHmUkrCWuCWFZ9XeSkpx0D1TAc0LZeDWVepf8ZQNhHst7JRvQ88tHFt2RFTNkRwBqx6PPmKmzECjatPkpNhE9gNW5gSPwPcoE_QTuEQlPoClafkmU6IbTl_Dd4CzStvUmEZmuQ-nsFEgAok3k" 
                alt="Mod Avatar" 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold text-blue-950 leading-none">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500 font-medium">Senior Moderator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Canvas */}
        <div className="pt-24 px-8 pb-12 max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
