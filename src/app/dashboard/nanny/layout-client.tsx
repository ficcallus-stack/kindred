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
  { id: "open_roles", label: "Open Roles", icon: "work", href: "/dashboard/nanny/open-roles" },
  { id: "wallet", label: "Wallet", icon: "account_balance_wallet", href: "/dashboard/nanny/wallet" },
  { id: "referrals", label: "Referrals", icon: "group_add", href: "/dashboard/nanny/referrals" },
  { id: "verification", label: "Verification", icon: "verified_user", href: "/dashboard/nanny/verification" },
  { id: "certifications", label: "Certifications", icon: "workspace_premium", href: "/dashboard/nanny/certifications" },
];

export default function NannyDashboardLayout({ children, user }: DashboardLayoutProps & { user: any }) {
  const pathname = usePathname();

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 py-4 max-w-full border-b border-outline-variant/10 shadow-sm">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-primary tracking-tighter font-headline italic">
            KindredCare US
          </Link>
          <div className="hidden lg:flex gap-8 items-center border-l border-outline-variant/20 pl-8">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "transition-all font-black uppercase tracking-widest text-[10px]",
                  pathname === item.href ? "text-primary" : "text-on-surface-variant/40 hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Messages Link in Topbar */}
          <Link 
            href="/dashboard/messages" 
            className={cn(
                "w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-95",
                pathname === "/dashboard/messages" ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-on-surface-variant/40 hover:bg-slate-50"
            )}
            title="Messages"
          >
            <MaterialIcon name="mail" fill={pathname === "/dashboard/messages"} />
          </Link>

          {/* Notifications Placeholder */}
          <button className="w-12 h-12 flex items-center justify-center rounded-2xl text-on-surface-variant/40 hover:bg-slate-50 transition-all active:scale-95">
            <MaterialIcon name="notifications" />
          </button>
          
          <div className="h-8 w-[1px] bg-outline-variant/20 mx-2"></div>

          {/* Profile Gateway */}
          <Link 
            href="/dashboard/nanny/profile"
            className={cn(
                "flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-2xl border transition-all active:scale-95",
                pathname === "/dashboard/nanny/profile" 
                    ? "bg-primary/5 border-primary/20" 
                    : "border-transparent hover:bg-slate-50"
            )}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm flex-shrink-0">
                <img
                    alt="Nanny Profile Avatar"
                    className="w-full h-full object-cover"
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
                />
            </div>
            <div className="hidden sm:block text-left">
                <div className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">Elite Account</div>
                <div className="text-xs font-bold text-on-surface leading-none">{user?.fullName?.split(" ")[0]}</div>
            </div>
          </Link>
        </div>
      </nav>

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
              <MaterialIcon name={item.icon} fill={pathname === item.href} className="text-lg" />
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
              <MaterialIcon name="help" className="text-lg" />
              Support
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-4 px-5 py-3 text-on-surface-variant/60 hover:text-error transition-all rounded-xl font-bold text-sm"
            >
              <MaterialIcon name="logout" className="text-lg" />
              Logout
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Canvas */}
      <main className="md:ml-64 pt-28 px-6 pb-24 md:pb-12 min-h-screen bg-surface">
        <div className="max-w-6xl mx-auto">
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
