import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";

export default function NannyDashboardHome() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="font-headline text-3xl font-extrabold text-primary">Welcome, Sarah!</h1>
        <p className="text-on-surface-variant text-sm font-medium">Monday, March 23, 2026</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Bookings", value: "12", icon: "assignment", color: "bg-blue-100 text-blue-600" },
          { label: "Earnings", value: "$4,250", icon: "payments", color: "bg-green-100 text-green-600" },
          { label: "Messages", value: "3 New", icon: "mail", color: "bg-orange-100 text-orange-600" },
          { label: "Rating", value: "4.9", icon: "star", color: "bg-yellow-100 text-yellow-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/10">
            <div className="flex justify-between items-start mb-4">
              <div className={stat.color + " p-2 rounded-lg"}>
                <MaterialIcon name={stat.icon} />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-primary">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Messages */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline text-xl font-bold text-primary">Recent Messages</h2>
            <button className="text-xs font-bold text-primary underline decoration-2 underline-offset-4">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors cursor-pointer border border-transparent hover:border-outline-variant/10">
                <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0"></div>
                <div className="flex-grow">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="font-bold text-sm text-primary">The Thompson Family</h4>
                    <span className="text-[10px] text-on-surface-variant">2h ago</span>
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-1">Hi Sarah! We loved your profile and would like to schedule a call...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Standards Promo */}
        <div className="bg-gradient-to-br from-primary to-primary-container text-on-primary p-10 rounded-[3rem] shadow-2xl shadow-primary/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:rotate-12 transition-transform">
              <MaterialIcon name="verified_user" className="text-4xl text-secondary" fill />
            </div>
            <h3 className="font-headline text-3xl font-black mb-6 tracking-tighter italic leading-none">Get Global <br /> Certified</h3>
            <p className="text-on-primary/70 text-lg font-medium italic leading-relaxed mb-10">
              Unlock elite bookings and 3x higher pay by completing our vetted Global Standards Program.
            </p>
          </div>
          <Link 
            href="/premium"
            className="relative z-10 w-full py-5 bg-white text-primary font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-on-primary/95 transition-all text-center shadow-xl active:scale-95"
          >
            Start Program
          </Link>
          {/* Decorative Pattern */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary opacity-15 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-[60px]"></div>
        </div>
      </div>
    </div>
  );
}
