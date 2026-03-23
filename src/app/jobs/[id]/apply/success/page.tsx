"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";

export default function JobApplicationSuccess() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 md:p-12 bg-surface font-body text-on-surface animate-in fade-in duration-1000">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Illustration (Desktop Only) */}
        <div className="lg:col-span-5 relative hidden lg:block">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary-fixed opacity-20 rounded-full blur-3xl animate-pulse"></div>
          <div className="relative z-10 transition-transform hover:scale-105 duration-1000">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl rotate-3 bg-surface-container-lowest p-5 border-2 border-white">
              <img 
                alt="Caregiver success" 
                className="rounded-[1.5rem] w-full h-[450px] object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgXyKka_Kiw9DjYc7QFWmXZA2DwkOymdI8gAej5wxMBLj_ri9YXGGFQeYaMowXFtTffTQdwhdpW8_7QcJqR_hiBV4R2UyvnvpBcnFYRFmeNZx0Srqv-Z0K1_WN6B28NkLTQR-bNfsj0HVe1yfDRh1cgSloZRTHa99VH8DuMt1oHmtPlIY9GaUDaaGGwKREMTheCgj0Sedxx2GucAR7OApAQhdaU6jS3ipqrKGuNZmGukzttD2sSH0AT12ADJBeGvnOmP034CqLCzo" 
              />
            </div>
            <div className="absolute -bottom-8 -right-8 bg-tertiary-fixed p-8 rounded-[2rem] shadow-2xl -rotate-6 border-4 border-white animate-in zoom-in duration-700">
              <MaterialIcon name="check_circle" className="text-on-tertiary-fixed text-5xl" style={{ fontVariationSettings: "'FILL' 1" }} />
            </div>
          </div>
        </div>

        {/* Right Column: Success Content */}
        <div className="lg:col-span-7 space-y-12">
          
          {/* Header Section */}
          <header className="space-y-6">
            <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-black tracking-[0.2em] uppercase shadow-sm">
              <MaterialIcon name="task_alt" className="text-lg" />
              Application Sent
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black text-primary leading-none tracking-tighter italic">
              You're one step <span className="text-orange-600 block">closer.</span>
            </h1>
            <p className="text-on-surface-variant text-xl font-medium leading-relaxed max-w-lg opacity-80 italic">
              We’ve delivered your application to the family. Your expertise and warmth are exactly what parents are looking for.
            </p>
          </header>

          {/* Job Summary Module */}
          <section className="bg-surface-container-lowest p-8 rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-outline-variant/10 group hover:shadow-2xl transition-all">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6 opacity-40">Application Summary</h2>
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-[1.5rem] bg-surface-container-low flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all">
                <MaterialIcon name="home_work" className="text-4xl" />
              </div>
              <div>
                <h3 className="font-headline text-2xl font-black text-primary tracking-tight">The Thompson Family</h3>
                <p className="text-on-surface-variant font-medium opacity-70 italic text-lg mt-1">Full-Time Sitter • Upper East Side, NY</p>
                <div className="flex gap-3 mt-6">
                  <span className="bg-tertiary-fixed/40 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-tertiary-fixed">Applied today</span>
                  <span className="bg-surface-container-low px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">$25-30/hr</span>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps Roadmap */}
          <section className="space-y-8">
            <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic">What happens next?</h2>
            <div className="grid gap-6">
              {[
                { title: "Family Review", desc: "The Thompsons usually respond within 24-48 hours after reviewing matching profiles.", icon_num: 1 },
                { title: "Notification", desc: "We'll notify you via message and email for interview requests or direct questions.", icon_num: 2 },
                { title: "Live Updates", desc: "Track all your active applications and their real-time status in your dashboard.", icon_num: 3 },
              ].map(step => (
                <div key={step.title} className="flex gap-6 p-6 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all duration-300 group/step border border-transparent hover:border-outline-variant/5">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center text-lg font-black shadow-lg group-hover/step:rotate-12 transition-transform">{step.icon_num}</div>
                  <div className="space-y-1 pt-1">
                    <h4 className="font-black text-primary text-xl tracking-tight">{step.title}</h4>
                    <p className="text-on-surface-variant text-base font-medium opacity-60 italic leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTAs */}
          <footer className="flex flex-col sm:flex-row gap-6 pt-6 mb-12">
            <Link 
              href="/jobs"
              className="flex-1 bg-gradient-to-br from-primary to-primary-container text-white px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              Back to Available Jobs
              <MaterialIcon name="arrow_forward" className="group-hover:translate-x-2 transition-transform" />
            </Link>
            <Link 
              href="/dashboard/nanny"
              className="flex-1 bg-white border-2 border-primary/10 text-primary px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs hover:bg-slate-50 active:scale-95 transition-all text-center"
            >
              View My Dashboard
            </Link>
          </footer>

        </div>
      </div>
    </main>
  );
}
