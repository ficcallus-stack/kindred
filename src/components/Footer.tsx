"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "./MaterialIcon";
import { NewsletterForm } from "./NewsletterForm";

export default function Footer() {
  const pathname = usePathname();

  const isAuthPage = [
    "/login", 
    "/signup", 
    "/forgot-password", 
    "/verify-email",
    "/register/nanny",
    "/register/parent"
  ].includes(pathname);

  const isDashboardPage = pathname.startsWith("/dashboard");

  if (isAuthPage || isDashboardPage) return null;

  return (
    <footer className="bg-[#f8faff] text-primary w-full py-16 font-body z-10 relative border-t border-primary/5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-2xl font-black font-headline tracking-tighter">KindredCare US</div>
          <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs font-medium opacity-80 italic">
            Redefining elite childcare through trust, safety, and human connection.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-primary hover:bg-white transition-all shadow-sm">
              <MaterialIcon name="verified" className="text-xl" fill />
            </div>
            <div className="w-10 h-10 rounded-full border border-primary/10 flex items-center justify-center text-primary hover:bg-white transition-all shadow-sm">
              <MaterialIcon name="photo_camera" className="text-xl" fill />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-primary font-black mb-8 text-[11px] uppercase tracking-[0.2em] font-headline opacity-60">Explore</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><Link href="/browse" className="text-on-surface-variant hover:text-primary transition-all">Browse All Nannies</Link></li>
            <li><Link href="/register/nanny" className="text-on-surface-variant hover:text-primary transition-all">Become a Nanny</Link></li>
            <li><Link href="/faq" className="text-on-surface-variant hover:text-primary transition-all">FAQ</Link></li>
            <li><Link href="/safety" className="text-on-surface-variant hover:text-primary transition-all">Safety Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-primary font-black mb-8 text-[11px] uppercase tracking-[0.2em] font-headline opacity-60">Legal & Support</h4>
          <ul className="space-y-4 text-sm font-bold">
            <li><Link href="/privacy" className="text-on-surface-variant hover:text-primary transition-all">Privacy Policy</Link></li>
            <li><Link href="/terms" className="text-on-surface-variant hover:text-primary transition-all">Terms of Service</Link></li>
            <li><Link href="/cookies" className="text-on-surface-variant hover:text-primary transition-all">Cookie Settings</Link></li>
            <li><Link href="/safety" className="text-on-surface-variant hover:text-primary transition-all">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-primary font-black mb-8 text-[11px] uppercase tracking-[0.2em] font-headline opacity-60">Newsletter</h4>
          <p className="text-on-surface-variant text-sm mb-6 max-w-[220px] font-medium leading-relaxed opacity-80">Get the latest parenting tips and caregiver insights.</p>
          <NewsletterForm />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 mt-24 pt-12 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
          © 2026 KindredCare US. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
           <span className="text-primary text-[10px] font-black tracking-[0.2em] uppercase opacity-60 italic">Excellence in Care</span>
           <div className="flex gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <div className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed" />
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
           </div>
        </div>
      </div>
    </footer>
  );
}
