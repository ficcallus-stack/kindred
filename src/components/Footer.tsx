import Link from "next/link";
import { MaterialIcon } from "./MaterialIcon";

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 w-full py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="text-xl font-bold text-slate-900 font-headline">KindredCare US</div>
          <p className="text-slate-500 font-body text-sm leading-relaxed">
            Redefining elite childcare through trust, safety, and human connection.
          </p>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
              <MaterialIcon name="social_leaderboard" className="text-xl" />
            </button>
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all">
              <MaterialIcon name="camera" className="text-xl" />
            </button>
          </div>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-slate-900 font-headline">Quick Links</h4>
          <ul className="space-y-4 text-sm font-body text-slate-500">
            <li><Link href="/browse" className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">Browse All Nannies</Link></li>
            <li><Link href="/register/nanny" className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">Become a Nanny</Link></li>
            <li><button className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">FAQ</button></li>
            <li><button className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">Safety Center</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-slate-900 font-headline">Legal</h4>
          <ul className="space-y-4 text-sm font-body text-slate-500">
            <li><button className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">Privacy Policy</button></li>
            <li><button className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">Terms of Service</button></li>
            <li><button className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">Cookie Settings</button></li>
            <li><button className="hover:text-slate-900 underline decoration-2 underline-offset-4 duration-200">Contact Us</button></li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold mb-6 text-slate-900 font-headline">Newsletter</h4>
          <p className="text-slate-500 text-sm mb-4">Get the latest parenting tips and caregiver insights.</p>
          <div className="flex gap-2">
            <input
              className="flex-1 bg-white border-none rounded-lg focus:ring-1 focus:ring-primary text-sm px-4"
              placeholder="Your email"
              type="email"
            />
            <button className="bg-primary text-white p-2 rounded-lg">
              <MaterialIcon name="send" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-slate-200">
        <p className="text-slate-500 text-sm font-body">© 2024 KindredCare US. All rights reserved.</p>
      </div>
    </footer>
  );
}
