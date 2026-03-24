"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "home", label: "Dashboard Home", icon: "dashboard", href: "/dashboard/nanny" },
  { id: "wallet", label: "Wallet", icon: "account_balance_wallet", href: "/dashboard/nanny/wallet" },
  { id: "profile", label: "Profile", icon: "person", href: "/dashboard/nanny/profile" },
  { id: "messages", label: "Messages", icon: "mail", href: "/dashboard/messages" },
  { id: "verification", label: "Verification", icon: "verified_user", href: "/dashboard/nanny/verification" },
  { id: "certifications", label: "Certifications", icon: "workspace_premium", href: "/dashboard/nanny/certifications" },
];

export default function NannyDashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 py-3 max-w-full shadow-sm shadow-slate-200/50">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-slate-900 tracking-tight font-headline">
            KindredCare US
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "transition-colors font-medium text-sm",
                  pathname === item.href ? "text-slate-900 font-semibold border-b-2 border-slate-900 pb-1" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {item.label.split(" ")[item.label.split(" ").length - 1]}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-slate-50 rounded-lg transition-all active:scale-95">
            <MaterialIcon name="notifications" className="text-slate-600" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
            <img
              alt="Nanny Profile Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmozMkgG39vlaMDe__WG87IeYCwaKusefFYNaT9d8Sttaq0wyLTfZ-gTo4MZF_go3xM_G_65yXiiEeOCGdy3BmfdWClVonTBYCsmhDt-Pdg663MuPD9VNug4BYqPMJ-sf7X2egrCPS1csz_bX-hMUG2TtCiD0t1QA0VI4m7vAMjMTjoJXMYLmlGxGjm70ADdgv7Mqrc0XINOgcs6Pb1qJodkImYQwZa_9hXuPdyLTZELC6_f-TWLFNo8kM4hy1p0uv3xPZpBmv3uA"
            />
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation Shell (Desktop) */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-slate-50 border-r border-slate-200/50 hidden md:flex flex-col py-6 pt-20">
        <div className="px-6 mb-8">
          <div className="flex flex-col gap-1">
            <h3 className="font-headline font-bold text-lg text-primary">Sarah Jenkins</h3>
            <span className="text-xs font-medium text-secondary uppercase tracking-wider">Elite Caregiver</span>
          </div>
          <button className="mt-4 w-full py-2 px-4 bg-white border border-outline-variant/30 text-xs font-semibold rounded-xl hover:bg-slate-100 transition-all text-primary">
            View Public Profile
          </button>
        </div>
        <nav className="flex-grow flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 mx-2 transition-all rounded-xl font-medium text-sm active:translate-x-1 duration-150",
                pathname === item.href ? "bg-white text-slate-900 shadow-sm shadow-slate-200/50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              <MaterialIcon name={item.icon} fill={pathname === item.href} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-2 flex flex-col gap-1">
          <Link
            href="/dashboard/nanny/support"
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-xl font-medium text-sm"
          >
            <MaterialIcon name="help" />
            Support
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-all rounded-xl font-medium text-sm"
          >
            <MaterialIcon name="logout" className="text-error" />
            Logout
          </Link>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-24 px-6 pb-24 md:pb-12 min-h-screen bg-surface">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Shell (Bottom) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around py-3 px-2 z-50">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center flex-1 transition-colors",
              pathname === item.href ? "text-primary" : "text-slate-400"
            )}
          >
            <MaterialIcon name={item.icon} fill={pathname === item.href} />
            <span className="text-[10px] font-bold mt-1">
              {item.label.split(" ")[item.label.split(" ").length - 1]}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
