"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import Link from "next/link";

const JOBS = [
  {
    id: 1,
    family: "The Thompson Family",
    location: "Brooklyn, NY • 2 miles away",
    children: "2 Children (2 yrs & 4 yrs)",
    schedule: "Mon-Fri, 30 hrs/week",
    budget: "$35 - $45",
    isNew: true,
    isVerified: true
  },
  {
    id: 2,
    family: "The Rodriguez Household",
    location: "Park Slope, NY • 0.8 miles away",
    children: "1 Infant (6 months)",
    schedule: "Tue-Thu, 24 hrs/week",
    budget: "$40 - $55",
    isNew: false,
    isVerified: true,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfjwgHoqxThhZHcNxvwwpVNN3S3wX6FiV4rtxs-jd_mRZc1q9xXNH6HHSC9X_w1qitsnq_C6gWd0E6Yni4RJ375dbuf9FxvkLqF7ay10G69dEEPO63mamkS9bnjZTvpHUEmsV34TaS0jxdi8kKBup-VxqVzade7HpqyPykCniGb4_S5Y_9O92IG8eiVYxR-nb0uCGeDyzJqWubOXlyG0NGlazNVHUkz2-Z20wlpLHySXpqA4UdiaazuPMKIjs0o0M3hhxKxiI69Mw"
  },
  {
    id: 3,
    family: "The Chen-Wong Family",
    location: "Williamsburg, NY • 3.5 miles away",
    children: "3 Children (School age)",
    schedule: "Mon-Fri, 35 hrs/week",
    budget: "$30 - $38",
    isNew: false,
    isVerified: true,
    experience: "5+ Years Required"
  }
];

export default function JobsPage() {
  return (
    <div className="bg-background min-h-screen">
      <Navbar />

      <div className="flex pt-20">
        {/* SideNavBar / Filters */}
        <aside className="hidden lg:flex flex-col p-8 space-y-2 h-[calc(100vh-80px)] sticky top-20 w-80 bg-surface-container-low border-r border-outline-variant/10 overflow-y-auto">
          <div className="mb-10 px-4">
            <h2 className="text-2xl font-black text-primary font-headline tracking-tighter">Filters</h2>
            <p className="text-xs text-on-surface-variant font-black uppercase tracking-[0.2em] opacity-60">Refine your job search</p>
          </div>
          <nav className="space-y-3">
            {[
              { label: "Distance", icon: "map" },
              { label: "Hourly Rate", icon: "payments" },
              { label: "Schedule", icon: "calendar_month" },
              { label: "Experience", icon: "star" },
              { label: "Requirements", icon: "verified_user" }
            ].map((filter, i) => (
              <button 
                key={filter.label} 
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group hover:bg-white hover:shadow-xl hover:translate-x-1 duration-300",
                  i === 0 ? "bg-white text-primary font-black shadow-lg" : "text-on-surface-variant font-medium"
                )}
              >
                <div className={cn("p-2 rounded-xl group-hover:bg-primary/5 transition-colors", i === 0 ? "bg-primary/5" : "bg-transparent")}>
                  <MaterialIcon name={filter.icon} className="text-xl" fill={i === 0} />
                </div>
                <span className="font-headline text-sm tracking-tight">{filter.label}</span>
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-10 px-4">
            <button className="w-full py-5 bg-primary text-on-primary rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:shadow-primary/40 hover:-translate-y-1 transition-all">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Main Content Canvas */}
        <main className="flex-1 p-6 md:p-10 lg:p-16 max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-12">
          {/* Job List Column */}
          <div className="xl:col-span-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex justify-between items-end mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter font-headline">Available Jobs</h1>
                <p className="text-on-surface-variant font-medium mt-2 text-lg opacity-80">Found 24 jobs matching your profile in Brooklyn</p>
              </div>
            </header>

            {JOBS.map((job) => (
              <div key={job.id} className="group bg-surface-container-lowest rounded-[2.5rem] p-4 md:p-10 shadow-sm border border-outline-variant/10 hover:border-primary/20 hover:shadow-2xl transition-all flex flex-col md:flex-row gap-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-secondary transition-all group-hover:w-3"></div>
                
                {job.image && (
                   <div className="hidden md:block w-40 h-full bg-surface-container-low rounded-3xl overflow-hidden shrink-0">
                     <img alt={job.family} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" src={job.image} />
                   </div>
                )}

                <div className="flex-1 space-y-8">
                  <div className="flex flex-wrap items-center gap-3">
                    {job.isVerified && (
                      <span className="inline-flex items-center px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black rounded-full uppercase tracking-widest shadow-sm">
                        <MaterialIcon name="verified" className="text-lg mr-2" fill />
                        Verified Family
                      </span>
                    )}
                    {job.isNew && (
                      <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant bg-surface-container-low px-4 py-1.5 rounded-full">New Posting</span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-3xl font-black text-primary mb-2 font-headline tracking-tight">{job.family}</h3>
                    <p className="text-on-surface-variant flex items-center gap-2 text-sm font-medium opacity-70">
                      <MaterialIcon name="location_on" className="text-xl text-secondary" />
                      {job.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-fixed p-3 rounded-2xl text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <MaterialIcon name="child_care" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-on-surface-variant/40 tracking-[0.2em] mb-1">Children</p>
                        <p className="text-sm font-bold text-primary">{job.children}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="bg-primary-fixed p-3 rounded-2xl text-primary shadow-sm group-hover:scale-110 transition-transform">
                        <MaterialIcon name={job.experience ? "workspace_premium" : "schedule"} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-black text-on-surface-variant/40 tracking-[0.2em] mb-1">
                          {job.experience ? "Experience" : "Schedule"}
                        </p>
                        <p className="text-sm font-bold text-primary">{job.experience || job.schedule}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-outline-variant/10 gap-8">
                    <div className="flex flex-col text-center sm:text-left">
                      <span className="text-[10px] uppercase font-black text-on-surface-variant/40 tracking-[0.2em] mb-1">Budget</span>
                      <span className="text-3xl font-black text-primary tabular-nums">{job.budget}<span className="text-xs font-black text-slate-400 align-middle ml-1">/HR</span></span>
                    </div>
                    <div className="flex gap-4 w-full sm:w-auto">
                      <button className="flex-1 sm:flex-none px-10 py-4 text-primary font-black uppercase tracking-widest text-xs hover:bg-surface-container rounded-2xl transition-all">Quick View</button>
                      <Link 
                        href={`/jobs/${job.id}/apply`}
                        className="flex-1 sm:flex-none px-10 py-5 bg-primary text-on-primary font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-center"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Sidebar Module */}
          <aside className="xl:col-span-4 space-y-10 animate-in fade-in slide-in-from-right-4 duration-1000">
            <div className="bg-primary-container text-on-primary-container rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/10 blur-3xl -mr-24 -mt-24 rounded-full group-hover:bg-secondary/20 transition-colors"></div>
              <div className="relative z-10">
                <div className="bg-secondary-container/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-10 shadow-inner">
                  <MaterialIcon name="shield_with_heart" className="text-secondary-fixed text-3xl" fill />
                </div>
                <h2 className="text-3xl font-black text-white mb-6 font-headline leading-tight tracking-tighter italic">Safety First, Always.</h2>
                <p className="text-on-primary-container leading-relaxed mb-10 text-lg font-medium opacity-90">We curate every single profile to ensure you work in a safe, professional, and respectful environment.</p>
                <ul className="space-y-8">
                  {[
                    { title: "Verified Families", desc: "All background checks completed before posting.", icon: "verified" },
                    { title: "Secure Payments", icon: "lock", desc: "Automated payroll with tax withholding." },
                    { title: "24/7 Support", icon: "support_agent", desc: "Dedicated concierge for caregivers." }
                  ].map(item => (
                    <li key={item.title} className="flex gap-6 items-start group/item">
                      <div className="shrink-0 pt-1">
                        <MaterialIcon name={item.icon} className="text-secondary-fixed text-2xl group-hover/item:scale-125 transition-transform" />
                      </div>
                      <div>
                        <p className="font-black text-white text-base tracking-tight mb-1">{item.title}</p>
                        <p className="text-sm text-on-primary-container/70 font-medium leading-relaxed">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Featured Tip Card */}
            <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-outline-variant/10 hover:shadow-xl transition-all group">
              <h4 className="font-black text-primary mb-6 flex items-center gap-4 font-headline tracking-tighter">
                <MaterialIcon name="lightbulb" className="text-3xl text-secondary animate-pulse" />
                Caregiver Tip
              </h4>
              <p className="text-lg text-on-surface-variant leading-relaxed italic font-medium opacity-80">
                "Verified families are 4x more likely to respond to applications that include a personalized introductory video."
              </p>
              <button className="mt-8 text-secondary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-4 transition-all">
                Record yours now 
                <MaterialIcon name="arrow_forward" />
              </button>
            </div>

            {/* Map View Placeholder */}
            <div className="rounded-[2.5rem] overflow-hidden h-72 relative shadow-2xl group border-8 border-white p-2 bg-surface-container-low">
              <img alt="Map" className="w-full h-full object-cover rounded-[2rem] opacity-40 group-hover:scale-105 transition-transform duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDP4J5qU3YnY2E-_wtntDBTAmdydoKpyiAAIymu3b5GNxobUZu7eypIB2xH89yac2b1s_Q_xucit0ec3o9ETCeGEZhiQiwUGaeceCRNKVIH_yjZ9nMQ9bQLd5SjfJav8A6dBvke7mosfkktAE2DH7jAqCxoWjmRH4vW5QruD-QOoiXBGyB9F6y-fDWb5r4wBxCc0XmNuiB_gFDSp4BBMKizPO0CWZuExG-sL0swhmVxOTjruIKA034VXwHOB8u5fFKpmrS0gu6o_Ps" />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="bg-white text-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-3 active:scale-95 transition-all animate-in zoom-in-50">
                  <MaterialIcon name="map" className="text-xl" fill />
                  View on Map
                </button>
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
