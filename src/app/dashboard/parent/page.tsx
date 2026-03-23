"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

const CHILDREN = [
  { 
    name: "Liam", 
    age: 4, 
    type: "Pre-schooler", 
    icon: "child_care", 
    tags: ["ASD Level 1", "Sensory Sensitive"],
    tagColor: "bg-tertiary-fixed text-on-tertiary-fixed"
  },
  { 
    name: "Sophie", 
    age: 2, 
    type: "Toddler", 
    icon: "baby_changing_station", 
    tags: ["Food Allergies", "Nap Routine"],
    tagColor: "bg-error-container text-on-error-container"
  },
];

const APPLICANTS = [
  {
    id: 1,
    name: "Elena Rodriguez",
    role: "Full-time Caregiver",
    experience: "6 Years Exp.",
    skills: ["CPR Certified"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCX-9HbCGIJdd43IbmipcwpZ1aanR5L9XnpKIPyfHqjcSF2rzFESlcK9i40IkOGQ5yvTkLb4oU1ICcSIyo5xdq4SXTyRBi-t0CBCQ2unqpiZHKcKpwhUuU09tKXhlmJEtPhl_YrquGk3tQ_nFA5C5MtFTGTWTmWEWm_qlsX7cxu7F7xfYDBqpNgxy6hg0Eve-99iyK7egDLq3u5IFzCnhZKbWHaz4Q8dmIf11AqXh8Jy0B89ympH3vWV1PDfe9igevRv9vQ_b0n41s",
    rotate: "-rotate-3"
  },
  {
    id: 2,
    name: "Jessica Thompson",
    role: "Weekend Sitter",
    experience: "3 Years Exp.",
    skills: ["Special Needs"],
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuABUshUUWT0xV00-NzwnNN4lPcK6LEdXnGhcj5Fr-XjLwZMj2VyNGk1NRlZqtROsi7M5Vqxk3FoAb6-a4IE2zc6eIZJ8soRkEGa-JRnvw_jxBhL2FDBEiXDwa-hnp7Q0ppTwMgHlLPtjh4y9TZRQZeWKlMfWOSWUJUPWPKmduiS6rqStPfhNgjT53e4BsoKfqzbDYrm0yl44R7C-rHGuuYT9yfTMNFB4IsTsThrznCF0jjXUM02qjwgqczaxbpvyM1Yu6BOt27GEsA",
    rotate: "rotate-3"
  }
];

const SCHEDULE = [
  { date: "14", day: "Today", title: "Interview: Elena R.", time: "4:00 PM - 4:45 PM", isToday: true },
  { date: "16", day: "Fri", title: "Booking: Clara W.", time: "6:00 PM - 11:00 PM", isToday: false },
];

export default function FamilyDashboard() {
  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Hero Welcome Section */}
        <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-container p-10 md:p-14 text-white shadow-2xl shadow-primary/20 group">
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-headline text-4xl md:text-5xl font-black tracking-tighter mb-6 leading-none italic">
              Welcome back, <br className="md:hidden" /> Sarah Miller
            </h1>
            <p className="font-body text-xl text-on-primary-container leading-relaxed mb-10 opacity-90 italic">
              Your household is humming. You have 2 new applications for the Weekend Sitter role and 1 interview scheduled for today at 4:00 PM.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="px-8 py-4 bg-secondary-fixed-dim text-on-secondary-fixed font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 transition-transform shadow-xl shadow-orange-950/20">
                Review Applicants
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white/20 transition-all">
                View Schedule
              </button>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
          <div className="absolute right-12 bottom-0 w-80 h-80 opacity-10 group-hover:opacity-20 transition-opacity translate-y-20">
            <MaterialIcon name="family_history" className="text-[20rem]" />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Primary Sections */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* My Children Section */}
            <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
              <div className="flex justify-between items-center mb-10 px-2">
                <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic">My Children</h2>
                <button className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-8">
                  <MaterialIcon name="edit" className="text-xl" />
                  Edit Profiles
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {CHILDREN.map(child => (
                  <div key={child.name} className="bg-surface-container-low p-8 rounded-[2.5rem] border-l-8 border-secondary shadow-inner relative group hover:shadow-xl transition-all">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="font-headline text-2xl font-bold text-primary tracking-tight leading-none mb-1">{child.name}, {child.age}</h3>
                        <p className="text-on-surface-variant text-sm font-black uppercase tracking-widest opacity-40">{child.type}</p>
                      </div>
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                        <MaterialIcon name={child.icon} className="text-3xl" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Special Considerations</p>
                      <div className="flex flex-wrap gap-2">
                        {child.tags.map(tag => (
                          <span key={tag} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest", child.tagColor)}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent Applicants Section */}
            <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
              <h2 className="font-headline text-3xl font-black text-primary mb-10 px-2 tracking-tighter italic">Recent Applicants</h2>
              <div className="space-y-8">
                {APPLICANTS.map(applicant => (
                  <div key={applicant.id} className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-[2.5rem] hover:bg-surface-container-low transition-all group border border-transparent hover:border-outline-variant/10">
                    <div className="relative shrink-0">
                      <img 
                        src={applicant.image} 
                        className={cn("w-24 h-24 rounded-2xl object-cover shadow-xl transition-all duration-500 group-hover:rotate-0", applicant.rotate)} 
                      />
                      <div className="absolute -bottom-2 -right-2 bg-primary rounded-full p-2 text-white border-4 border-white shadow-lg">
                        <MaterialIcon name="verified" className="text-xs" fill />
                      </div>
                    </div>
                    <div className="flex-grow text-center md:text-left space-y-2 min-w-0">
                      <h4 className="font-headline text-2xl font-black text-primary tracking-tight leading-none truncate">{applicant.name}</h4>
                      <p className="text-on-surface-variant text-sm font-medium opacity-60 italic">Applied for: <span className="text-primary font-bold not-italic">{applicant.role}</span></p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                        <span className="text-[9px] font-black text-slate-500 border-2 border-outline-variant/30 px-3 py-1 rounded-xl uppercase tracking-widest">{applicant.experience}</span>
                        {applicant.skills.map(skill => (
                          <span key={skill} className="text-[9px] font-black text-slate-500 border-2 border-outline-variant/30 px-3 py-1 rounded-xl uppercase tracking-widest">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <button className="flex-1 md:flex-none px-6 py-4 text-primary border-2 border-outline-variant/30 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white hover:shadow-lg transition-all">Profile</button>
                      <button className="flex-1 md:flex-none px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">Message</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column: Sidebar Modules */}
          <div className="lg:col-span-4 space-y-10">
            
            {/* Verification Center */}
            <section className="bg-white rounded-[3rem] p-10 border-l-[12px] border-tertiary-fixed shadow-2xl shadow-primary/5 group relative overflow-hidden">
              <Link 
                href="/dashboard/parent/verification"
                className="absolute inset-0 z-10"
              />
              <div className="flex items-center gap-6 mb-8 relative z-0">
                <div className="p-4 bg-tertiary-fixed rounded-[1.5rem] shadow-inner group-hover:rotate-12 transition-transform">
                  <MaterialIcon name="verified_user" className="text-on-tertiary-fixed text-4xl" fill />
                </div>
                <div>
                  <h3 className="font-headline font-black text-2xl text-primary tracking-tight italic leading-none truncate">Verified Parent</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 mt-1">Trust Score: Excellent</p>
                </div>
              </div>
              <div className="space-y-4 relative z-0">
                {["Identity Verified", "Background Check Cleared", "Home Safety Assessment"].map(item => (
                  <div key={item} className="flex items-center gap-4 text-sm font-black text-slate-600 transition-all hover:translate-x-1">
                    <MaterialIcon name="check_circle" className="text-emerald-500 text-lg" fill />
                    <span className="tracking-tight">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Upcoming Schedule */}
            <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
              <h3 className="font-headline text-2xl font-black text-primary mb-10 tracking-tighter italic">Upcoming</h3>
              <div className="space-y-10 px-2">
                {SCHEDULE.map(entry => (
                  <div key={entry.date} className="flex gap-6 group cursor-pointer">
                    <div className="flex-shrink-0 w-14 text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{entry.day}</p>
                      <p className={cn("font-headline text-4xl font-black leading-none italic", entry.isToday ? "text-secondary" : "text-primary")}>{entry.date}</p>
                    </div>
                    <div className="flex-grow space-y-2">
                      <p className="font-black text-primary text-lg tracking-tight leading-none group-hover:text-secondary transition-colors">{entry.title}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 flex items-center gap-2">
                        <MaterialIcon name="schedule" className="text-base" />
                        {entry.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-12 py-5 bg-surface-container-low text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl border-2 border-transparent hover:border-primary/5 transition-all active:scale-95">Full Calendar</button>
            </section>

            {/* Premium Upsell Banner */}
            <section className="relative overflow-hidden bg-secondary-container rounded-[3rem] p-10 shadow-2xl shadow-orange-950/20 group">
              <div className="relative z-10 text-on-secondary-container space-y-4">
                <h3 className="font-headline text-3xl font-black tracking-tighter leading-none italic">Upgrade to <span className="text-secondary">Premium</span></h3>
                <p className="text-sm font-medium opacity-80 leading-relaxed italic">Unlock limitless possibilities for your family's care needs.</p>
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <MaterialIcon name="star" className="text-xl" fill /> Unlimited Messaging
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <MaterialIcon name="electric_bolt" className="text-xl" fill /> Priority Support
                  </div>
                </div>
                <div className="pt-8 flex items-baseline gap-2">
                  <span className="text-5xl font-black font-headline tracking-tighter">$50</span>
                  <span className="text-sm font-black uppercase tracking-widest opacity-40">/month</span>
                </div>
                <Link 
                  href="/premium"
                  className="block w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40 transition-all active:scale-95 text-center"
                >
                  Go Premium Now
                </Link>
              </div>
              {/* Background Accent */}
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary-fixed opacity-30 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
