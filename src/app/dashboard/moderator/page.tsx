"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export default function ModeratorOverviewPage() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section>
        <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Welcome back, Alex</h2>
        <p className="text-on-surface-variant max-w-2xl">
          Today is {currentDate}. You have <span className="text-primary font-semibold">14 urgent items</span> that require your immediate attention to maintain KindleCare safety standards.
        </p>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <MaterialIcon name="person_search" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-primary px-3 py-1 bg-primary/10 rounded-full tracking-wider">NANNIES</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">28</p>
            <p className="text-xs text-on-surface-variant font-medium">Pending Verifications</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center text-secondary">
              <MaterialIcon name="family_history" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-secondary px-3 py-1 bg-secondary/10 rounded-full tracking-wider">FAMILIES</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">12</p>
            <p className="text-xs text-on-surface-variant font-medium">Account Approvals</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <MaterialIcon name="confirmation_number" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-indigo-600 px-3 py-1 bg-indigo-50 rounded-full tracking-wider">ACTIVE</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">45</p>
            <p className="text-xs text-on-surface-variant font-medium">Open Support Tickets</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-error-container/50 rounded-xl flex items-center justify-center text-error">
              <MaterialIcon name="flag" className="text-xl" />
            </div>
            <span className="text-[10px] font-bold text-error px-3 py-1 bg-error-container rounded-full tracking-wider">URGENT</span>
          </div>
          <div>
            <p className="text-3xl font-black text-primary font-headline">09</p>
            <p className="text-xs text-on-surface-variant font-medium">Flagged Content</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* High Priority Queue */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-headline text-xl font-bold text-primary">High Priority Queue</h3>
            <button className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
              View All Tasks <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Verification Request */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-6 hover:shadow-md transition-shadow group border border-outline-variant/5">
              <img 
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 shadow-sm"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA6eR4UjBlMFJ6_8LnC63XFBmFgGaODgO90K5jEcViGVtqskH9NVqTlU0WxL3OQVvXfGlcPd1ZdgL6hS8oT_OtTqMqPzJ1TUuiqSg5NLExRzojwC8SAiEvbusdFO87HjIi-4ChuNg900qX-HfI5O5tsZKc65BWBswAuNJJcSzC1WZCNBW70Zf8WBdG3gDp3uqyz6GR9fP5v-gboBKStAORgW2ihWbR0UKigCA9IxL3UkpF1tFW4dIpWQpr2u2e952-Rm-G4BnA4cs" 
                alt="Sarah Jenkins"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-primary">Sarah Jenkins</h4>
                  <span className="bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold px-2 py-0.5 rounded uppercase">NEW NANNY</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-1 italic">"Background check uploaded, pending reference verification..."</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] text-on-surface-variant font-medium">Requested 2h ago</span>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 text-xs font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm">Verify</button>
                  <button className="p-1.5 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors border border-outline-variant/10">
                    <MaterialIcon name="more_vert" className="text-sm" />
                  </button>
                </div>
              </div>
            </div>

            {/* Flagged Profile */}
            <div className="bg-surface-container-lowest p-5 rounded-2xl flex items-center gap-6 border-l-4 border-error hover:shadow-md transition-shadow shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-error-container flex items-center justify-center text-error flex-shrink-0 shadow-sm">
                <MaterialIcon name="report" className="text-3xl" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-primary">Reported Profile: UID #9921</h4>
                  <span className="bg-error-container text-error text-[10px] font-bold px-2 py-0.5 rounded uppercase">INAPPROPRIATE PHOTO</span>
                </div>
                <p className="text-xs text-on-surface-variant line-clamp-1 italic">Reported by: Maria S. (Family Member)</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-[10px] text-error font-bold uppercase tracking-wider">Immediate Action</span>
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 text-xs font-bold border border-outline-variant/30 text-primary rounded-xl hover:bg-surface-container-low transition-colors">Review</button>
                  <button className="px-4 py-1.5 text-xs font-bold bg-error text-white rounded-xl hover:opacity-90 transition-opacity shadow-sm">Suspend</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Activity Log */}
        <div className="space-y-6">
          <h3 className="font-headline text-xl font-bold text-primary">Recent Activity</h3>
          <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="space-y-6">
              <div className="flex gap-4 relative pb-6 border-l border-slate-100 last:border-0 ml-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-secondary border-4 border-white"></div>
                <div className="pl-4">
                  <p className="text-xs text-primary font-bold">Mark M. approved</p>
                  <p className="text-[11px] text-on-surface-variant">Nanny verification complete for UID #1024</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">12 mins ago</p>
                </div>
              </div>

              <div className="flex gap-4 relative pb-6 border-l border-slate-100 last:border-0 ml-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white"></div>
                <div className="pl-4">
                  <p className="text-xs text-primary font-bold">Ticket #4421 Resolved</p>
                  <p className="text-[11px] text-on-surface-variant">Billing inquiry transferred to admin tier</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">45 mins ago</p>
                </div>
              </div>

              <div className="flex gap-4 relative last:border-0 ml-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-error border-4 border-white"></div>
                <div className="pl-4">
                  <p className="text-xs text-primary font-bold">Photo Rejected</p>
                  <p className="text-[11px] text-on-surface-variant">User 'Lara B.' notified of profile guidelines</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">1 hour ago</p>
                </div>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 bg-surface-container-low text-primary text-xs font-bold rounded-xl hover:bg-surface-container-high transition-colors tracking-wider uppercase">
              Download Report
            </button>
          </div>

          {/* Safety Tip */}
          <div className="bg-primary text-white p-6 rounded-2xl relative overflow-hidden group shadow-xl shadow-primary/10">
            <div className="relative z-10">
              <MaterialIcon name="lightbulb" className="text-amber-300 text-2xl mb-2 font-fill" fill />
              <h4 className="font-bold text-lg mb-2 font-headline">Safety Tip</h4>
              <p className="text-xs text-blue-100 leading-relaxed font-medium">Cross-reference social links for any nanny profile lacking a complete background check. Authenticity is our priority.</p>
            </div>
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
