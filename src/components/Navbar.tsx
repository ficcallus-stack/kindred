import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm transition-all duration-300">
      <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group whitespace-nowrap">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-white font-black text-xl italic tracking-tighter">KC</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 font-headline">
            KindredCare <span className="text-primary italic">US</span>
          </span>
        </Link>

        {/* Desktop Links (Main) */}
        <div className="hidden lg:flex items-center gap-6 font-headline font-bold text-[13px] tracking-tight text-on-surface-variant flex-1">
          <Link href="/dashboard/parent" className="hover:text-primary transition-colors py-2 flex items-center gap-1.5 px-3 rounded-lg hover:bg-slate-50">
            <MaterialIcon name="search" className="text-lg" />
            Find Care
          </Link>
          <Link href="/dashboard/parent/post-job" className="hover:text-primary transition-colors py-2 flex items-center gap-1.5 px-3 rounded-lg hover:bg-slate-50">
            <MaterialIcon name="post_add" className="text-lg" />
            Post Job
          </Link>
          <Link href="/register/nanny" className="hover:text-primary transition-colors py-2 flex items-center gap-1.5 px-3 rounded-lg hover:bg-slate-50">
            <MaterialIcon name="work_history" className="text-lg" />
            Become a Nanny
          </Link>
          <Link href="/jobs" className="hover:text-primary transition-colors py-2 flex items-center gap-1.5 px-3 rounded-lg hover:bg-slate-50">
            <MaterialIcon name="search" className="text-lg text-secondary" />
            Find Jobs
          </Link>
          <Link href="/dashboard/nanny" className="hover:text-primary transition-colors py-2 flex items-center gap-1.5 px-3 rounded-lg hover:bg-slate-50">
            <MaterialIcon name="dashboard" className="text-lg" />
            Nanny Dash
          </Link>
          <Link href="/safety" className="hover:text-primary transition-colors py-2 flex items-center gap-1.5 px-3 rounded-lg hover:bg-slate-50 group">
            <MaterialIcon name="verified_user" className="text-lg group-hover:text-secondary" />
            Trust & Safety
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-slate-600 font-bold font-headline text-sm px-4 py-2 hover:text-primary transition-all">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-primary text-on-primary px-7 py-3 rounded-2xl font-black font-headline text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:scale-95 transition-all uppercase tracking-wider">
                Join Now
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <UserButton />
          </Show>
        </div>
      </div>
    </nav>
  );
}
