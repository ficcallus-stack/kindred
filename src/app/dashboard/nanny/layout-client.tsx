"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Briefcase, 
  Wallet, 
  UserPlus, 
  ShieldCheck, 
  Award,
  HelpCircle,
  LogOut,
  User as UserIcon,
  MessageSquare
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "home", label: "Dashboard Home", icon: "grid_view", href: "/dashboard/nanny" },
  { id: "schedule", label: "My Schedule", icon: "calendar_today", href: "/dashboard/nanny/bookings" },
  { id: "open_roles", label: "Open Roles", icon: "work_outline", href: "/dashboard/nanny/open-roles" },
  { id: "wallet", label: "Wallet", icon: "account_balance_wallet", href: "/dashboard/nanny/wallet" },
  { id: "identity", label: "Identity & Standards", icon: "verified_user", href: "/dashboard/nanny/verification" },
];

export default function NannyDashboardLayout({ children, user }: DashboardLayoutProps & { user: any }) {
  const pathname = usePathname();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Global Navbar is now handled in RootLayout */}
      
      {/* Sidebar Navigation Shell (Desktop) */}
      <aside className="h-screen w-64 fixed left-0 top-0 z-40 bg-surface-container-low border-r border-outline-variant/10 hidden md:flex flex-col py-6 pt-24">
        <div className="px-6 mb-8 pt-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-headline font-black text-xl italic text-primary leading-tight tracking-tighter">{user?.fullName || "Caregiver"}</h3>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] opacity-60">Professional Caregiver</span>
          </div>
          <Link 
            href={`/nannies/${user?.id}`}
            className="mt-6 w-full py-3 px-4 bg-white border border-outline-variant/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all text-primary text-center block shadow-sm italic"
          >
            Public Resume
          </Link>
        </div>

        <nav className="flex-grow flex flex-col gap-1.5 px-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-5 py-3.5 transition-all rounded-[1.25rem] font-bold text-sm active:translate-x-1 duration-150",
                pathname === item.href 
                    ? "bg-primary text-white shadow-xl shadow-primary/10" 
                    : "text-on-surface-variant/60 hover:text-primary hover:bg-primary/5"
              )}
            >
              <MaterialIcon name={item.icon} className={cn("transition-all", pathname === item.href ? "opacity-100" : "opacity-40")} />
              <span className="tracking-tight">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-4 pb-6 flex flex-col gap-3">
          <div className="p-5 bg-gradient-to-br from-tertiary to-tertiary-container rounded-[2rem] shadow-xl shadow-tertiary/10 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="font-headline font-black text-on-tertiary-container text-sm uppercase tracking-tighter italic mb-1">Refer & Earn</h4>
                <p className="text-[10px] text-on-tertiary-container/60 font-medium mb-4 leading-relaxed">Earn up to $500 for every family you refer to KindredCare US.</p>
                <Link
                    href="/dashboard/nanny/referrals"
                    className="w-full inline-block py-2.5 bg-white text-on-tertiary-container text-[10px] font-black uppercase tracking-widest rounded-xl text-center hover:scale-105 active:scale-95 transition-all shadow-sm"
                >
                    Get Code
                 </Link>
              </div>
              <MaterialIcon name="stars" className="absolute -bottom-4 -right-4 text-6xl text-on-tertiary-container opacity-10 group-hover:rotate-45 transition-transform duration-700" />
          </div>

          <div className="flex flex-col gap-1 opacity-60 hover:opacity-100 transition-opacity">
            <Link
              href="/dashboard/nanny/support"
              className="flex items-center gap-4 px-5 py-3 text-on-surface-variant/60 hover:text-primary transition-all rounded-xl font-bold text-sm"
            >
              <HelpCircle size={18} />
              Support
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-4 px-5 py-3 text-on-surface-variant/60 hover:text-error transition-all rounded-xl font-bold text-sm"
            >
              <LogOut size={18} />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-24 px-6 pb-24 md:pb-12 min-h-screen bg-surface">
        <div className="max-w-[1440px] mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation Shell (Bottom) */}
      <div className="md:hidden fixed bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t border-outline-variant/10 flex justify-around py-4 px-4 z-50 shadow-2xl">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "flex flex-col items-center flex-1 transition-all active:scale-90",
              pathname === item.href ? "text-primary" : "text-on-surface-variant/30"
            )}
          >
            <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                pathname === item.href ? "bg-primary/5" : ""
            )}>
                <MaterialIcon name={item.icon} fill={pathname === item.href} />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest mt-1">
              {item.label.split(" ").pop()}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
