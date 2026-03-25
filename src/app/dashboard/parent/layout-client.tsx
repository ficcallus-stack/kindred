"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface ParentDashboardLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { id: "search", label: "Search", icon: "search", href: "/browse" },
  { id: "my-nannies", label: "My Nannies", icon: "diversity_1", href: "/dashboard/parent/nannies" },
  { id: "messages", label: "Messages", icon: "chat_bubble", href: "/dashboard/parent/messages" },
  { id: "bookings", label: "Bookings", icon: "calendar_today", href: "/dashboard/parent/bookings" },
  { id: "jobs", label: "Job Postings", icon: "work_history", href: "/dashboard/parent/jobs" },
  { id: "verification", label: "Verification", icon: "verified_user", href: "/dashboard/parent/verification" },
  { id: "account", label: "Account", icon: "settings_account_box", href: "/dashboard/parent" },
];

export default function ParentDashboardLayout({ children }: ParentDashboardLayoutProps) {
  const pathname = usePathname();
  const isPostJob = pathname.startsWith("/dashboard/parent/post-job");

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen antialiased">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm shadow-blue-900/5 h-20">
        <div className="flex justify-between items-center px-8 h-full w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-xl font-bold text-blue-900 dark:text-blue-100 italic font-headline truncate group transition-all">
              KindredCare US
            </Link>
            <div className="hidden md:flex gap-8 font-headline text-sm font-semibold tracking-tight">
              <Link href="/browse" className="text-slate-500 hover:text-blue-700 transition-colors">Find Care</Link>
              <Link href="#" className="text-slate-500 hover:text-blue-700 transition-colors">How it Works</Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 text-slate-500 font-headline text-sm font-semibold">
              <Link href="#" className="hover:text-blue-700 transition-colors">Help</Link>
              <button className="p-2 hover:bg-slate-50 rounded-lg transition-all active:scale-95">
                <MaterialIcon name="notifications" className="text-xl" />
              </button>
              <button className="p-2 hover:bg-slate-50 rounded-lg transition-all active:scale-95">
                <MaterialIcon name="favorite" className="text-xl" />
              </button>
            </div>
            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden ring-2 ring-primary/5 shadow-sm group cursor-pointer">
              <img 
                alt="User profile" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmWiHpvGr841pc3WOfVTlXVlgcCvS-e_XfGpxJ3R3Mm1lYZRwSBRWIhi0g3wvL0OdJIa5_xAnpy-2EQHb1elqBRbfYUrSDJc_Ae-3JykLSlK8mSUAhaMRFLOEpMibqgHRB0t6m2YXQhwztNDVCOBeA4gOnQjW3NpLCejCB7TkSQj7wZsZVM21PVCp-8v68HhtsN5q8SWKr56X2vrU_jScnDVUT7Psfq2NuKc_vhXSOV08EMIDDyA4P4VJY8vWz3nmjB6DnKNZP5fc" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-20 min-h-screen">
        {/* Side Navigation Bar */}
        {!isPostJob && (
          <aside className="h-[calc(100vh-5rem)] w-72 flex flex-col sticky top-20 left-0 bg-slate-50 border-r border-slate-200/50">
            <div className="flex flex-col gap-2 pt-12 pb-8 px-4 flex-grow">
              <div className="mb-8 px-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-primary overflow-hidden shadow-md">
                    <img 
                      alt="Family portrait" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAftvUkucas0XcbaSaOn3rLiQafr5-qxPdEgugGVI2OpjCfTAdE4OQsNYxIA4aZinBzd_rNKk_oScpOj395pPQBjqzN9mmlk5yfpdy6KpytTOCFKgb30FsSvPRYj3-qFdMdHx-h7lKR9jVAjkSotMQ0SCYR1uWnF20uOonY-dJfILojRo_H_yu-31c42TRxzDU1OJClSs8W6few6ptB4zpQd3jPd5SRRmZUCgYIMVbSt_Rhz9X9sRwu1Q-tKGUkBWdkoT3kSUQdlBs" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="font-headline text-sm font-bold text-blue-900 leading-tight truncate">The Miller Family</p>
                    <p className="text-[10px] font-bold text-secondary uppercase tracking-wider">Premium Member</p>
                  </div>
                </div>
              </div>

              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "pl-6 py-4 flex items-center gap-3 transition-all font-headline font-medium",
                    pathname === item.href
                      ? "bg-white text-blue-900 shadow-sm font-bold rounded-l-full ml-4"
                      : "text-slate-600 hover:text-blue-900 hover:translate-x-1"
                  )}
                >
                  <MaterialIcon name={item.icon} fill={pathname === item.href} />
                  <span>{item.label}</span>
                </Link>
              ))}

              <div className="mt-8 px-4">
                <Link 
                  href="/dashboard/parent/post-job"
                  className="block w-full py-4 bg-primary text-white rounded-xl font-headline font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 duration-200 text-center"
                >
                  Post a New Job
                </Link>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200/50 flex flex-col gap-4">
              <Link href="#" className="flex items-center gap-3 text-slate-500 font-headline text-sm font-medium hover:text-blue-900 transition-colors">
                <MaterialIcon name="contact_support" /> Support
              </Link>
              <Link href="/login" className="flex items-center gap-3 text-slate-500 font-headline text-sm font-medium hover:text-blue-900 transition-colors">
                <MaterialIcon name="logout" /> Sign Out
              </Link>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <div className={cn("flex-grow bg-surface-container-low min-h-full", !isPostJob && "lg:ml-0")}>
          {children}
        </div>
      </div>
    </div>
  );
}
