import Link from "next/link";
import { MaterialIcon } from "./MaterialIcon";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white w-full py-16 font-body z-10 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          <div className="text-2xl font-black font-headline tracking-tighter text-white">KindredCare US</div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">
            Redefining elite childcare through trust, safety, and human connection.
          </p>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-950 shadow-xl shadow-black/20">
              <MaterialIcon name="workspace_premium" className="text-2xl" fill />
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-slate-950 shadow-xl shadow-black/20">
              <MaterialIcon name="photo_camera" className="text-2xl" fill />
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-slate-500 font-bold mb-8 text-xs uppercase tracking-[0.2em] font-headline">Quick Links</h4>
          <ul className="space-y-4 text-sm font-semibold">
            <li><Link href="/browse" className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">Browse All Nannies</Link></li>
            <li><Link href="/register/nanny" className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">Become a Nanny</Link></li>
            <li><Link href="/faq" className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">FAQ</Link></li>
            <li><Link href="/safety" className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">Safety Center</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-500 font-bold mb-8 text-xs uppercase tracking-[0.2em] font-headline">Legal</h4>
          <ul className="space-y-4 text-sm font-semibold">
            <li><button className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">Privacy Policy</button></li>
            <li><button className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">Terms of Service</button></li>
            <li><button className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">Cookie Settings</button></li>
            <li><button className="text-slate-200 hover:text-white hover:underline underline-offset-8 transition-all">Contact Us</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-slate-500 font-bold mb-8 text-xs uppercase tracking-[0.2em] font-headline">Newsletter</h4>
          <p className="text-slate-400 text-sm mb-6 max-w-[220px] font-medium leading-relaxed">Get the latest parenting tips and caregiver insights.</p>
          <div className="flex bg-white rounded-xl p-1.5 shadow-inner">
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 text-sm font-semibold px-4 placeholder:text-slate-400"
              placeholder="Your email"
              type="email"
            />
            <button className="bg-[#1a2e4c] text-white w-12 h-12 rounded-lg flex items-center justify-center hover:bg-slate-900 transition-colors shadow-lg">
              <MaterialIcon name="send" className="text-xl rotate-[-45deg] translate-x-1" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-8 mt-24 pt-12 border-t border-white/5">
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em] opacity-80">
          © 2024 KindredCare US. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
