"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { ResumeJobBanner } from "@/components/dashboard/ResumeJobBanner";
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  MessageSquare, 
  Wallet, 
  HelpCircle,
  ShieldCheck,
  Diamond,
  PlusCircle,
  Home as HouseholdIcon,
  HelpCircle as SupportIcon,
  LogOut
} from "lucide-react";

interface ParentDashboardLayoutProps {
  children: React.ReactNode;
  user: any;
}

const NAV_ITEMS = [
  { id: "overview", label: "Family Hub", icon: "grid_view", href: "/dashboard/parent" },
  { id: "jobs", label: "Job Postings", icon: "work_outline", href: "/dashboard/parent/jobs" },
  { id: "bookings", label: "Bookings", icon: "calendar_today", href: "/dashboard/parent/bookings" },
  { id: "messages", label: "Messages", icon: "chat_bubble_outline", href: "/dashboard/messages" },
  { id: "wallet", label: "Billing & Credits", icon: "account_balance_wallet", href: "/dashboard/parent/wallet" },
  { id: "help", label: "Help Center", icon: "help_outline", href: "/dashboard/parent/help" },
];

export default function ParentDashboardLayout({ children, user }: ParentDashboardLayoutProps) {
  const pathname = usePathname();
  const isPostJob = pathname.startsWith("/dashboard/parent/post-job");

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen antialiased pb-24 md:pb-0">
      <ResumeJobBanner />
      {/* Global Navbar is now handled in RootLayout */}

      <div className="flex pt-20 min-h-screen relative">
        {/* Side Navigation Bar (Desktop Only) */}
        {!isPostJob && (
          <aside className="h-[calc(100vh-5rem)] w-72 hidden md:flex flex-col sticky top-20 left-0 bg-slate-50 border-r border-slate-200/50 flex-shrink-0">
            <div className="flex flex-col gap-2 pt-12 pb-8 px-4 flex-grow overflow-y-auto">
              {/* User Profile Summary */}
              <div className="mb-8 px-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary overflow-hidden shadow-md flex items-center justify-center text-white">
                    {user?.photoURL ? (
                      <img src={user.photoURL} alt="Family" className="w-full h-full object-cover" />
                    ) : (
                      <HouseholdIcon size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline text-sm font-bold text-blue-900 leading-tight truncate">
                      {user.fullName?.split(" ")[0]}'s Family
                    </p>
                    {user.isPremium ? (
                      <div className="flex items-center gap-1 text-secondary animate-pulse mt-1">
                        <Diamond size={12} className="fill-secondary" />
                        <p className="text-[10px] font-black uppercase tracking-wider">Premium Member</p>
                      </div>
                    ) : (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Account</p>
                    )}
                  </div>
                </div>
              </div>

              {!user.isPremium && (
                <div className="mb-6 px-4">
                  <Link 
                    href="/dashboard/parent/subscription"
                    className="flex items-center justify-between p-4 bg-secondary/5 rounded-2xl border border-secondary/10 group/premium transition-all hover:bg-secondary/10"
                  >
                    <div>
                      <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">Kindred Premium</p>
                      <p className="text-xs font-bold text-blue-900">Unlock Messaging</p>
                    </div>
                    <MaterialIcon name="arrow_forward" className="text-secondary group-hover/premium:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}

              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "px-6 py-4 flex items-center gap-3 transition-all font-headline font-medium",
                    pathname === item.href
                      ? "bg-white text-blue-900 shadow-sm font-bold rounded-2xl mx-2"
                      : "text-slate-600 hover:text-blue-900 hover:translate-x-1"
                  )}
                >
                  <MaterialIcon name={item.icon} className={cn("transition-all", pathname === item.href ? "opacity-100" : "opacity-40")} />
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="mt-8 px-4 space-y-3">
                <Link 
                  href="/dashboard/parent/post-job"
                  className="block w-full py-4 bg-primary text-white rounded-2xl font-headline font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-center"
                >
                  <PlusCircle size={14} className="inline-block mr-2" />
                  Post a New Job
                </Link>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200/50 flex flex-col gap-4">
              <Link href="/dashboard/support" className="flex items-center gap-3 text-slate-500 font-headline text-sm font-medium hover:text-blue-900 transition-colors">
                <SupportIcon size={18} /> Support
              </Link>
              <button 
                onClick={() => window.location.href = "/login"}
                className="flex items-center gap-3 text-slate-500 font-headline text-sm font-medium hover:text-blue-900 transition-colors w-full text-left"
              >
                <LogOut size={18} className="text-secondary" /> Sign Out
              </button>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={cn("flex-grow bg-surface-container-low min-h-full transition-all overflow-hidden")}>
          <div className={cn(isPostJob ? "w-full" : "max-w-7xl mx-auto")}>
            {children}
          </div>
        </main>

        {/* Mobile Navigation Shell (Bottom Tab Bar) */}
        {!isPostJob && (
          <div className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-outline-variant/10 flex justify-around py-4 px-2 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
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
                <span className="text-[9px] font-black uppercase tracking-widest mt-1.5">
                  {item.label === "Job Postings" ? "Jobs" : item.label.split(" ")[0]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
