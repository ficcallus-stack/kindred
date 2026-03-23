"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function SafetyVetting() {
  const steps = [
    {
      number: "01",
      title: "Identity Verification",
      icon: "badge",
      desc: "We utilize multi-factor biometric and document analysis to ensure the individual is exactly who they claim to be, matching government records with live facial recognition.",
      color: "text-secondary-container"
    },
    {
      number: "02",
      title: "SSN Trace",
      icon: "fingerprint",
      desc: "A comprehensive Social Security Number history search to identify all previous addresses and potential aliases, ensuring no part of their past is hidden.",
      color: "text-secondary-container"
    },
    {
      number: "03",
      title: "National Criminal Search",
      icon: "gavel",
      desc: "Scanning millions of records across thousands of jurisdictions, including county, state, and federal databases for any relevant criminal history.",
      color: "text-secondary-container"
    },
    {
      number: "04",
      title: "Sex Offender Registry Check",
      icon: "person_search",
      desc: "Continuous monitoring against all 50 state sex offender registries and the National Sex Offender Public Website (NSOPW).",
      color: "text-secondary-container"
    },
    {
      number: "05",
      title: "Reference Audits",
      icon: "history_edu",
      desc: "Our specialized team speaks directly with past employers to verify reliability, temperament, and quality of care beyond simple dates of employment.",
      color: "text-secondary-container"
    },
    {
      number: "06",
      title: "Behavioral Interviews",
      icon: "record_voice_over",
      desc: "A mandatory 1-on-1 video screening with our safety experts to assess situational judgment, communication skills, and empathy.",
      color: "text-secondary-container"
    },
    {
      number: "07",
      title: "Global Care Standards Certification",
      icon: "workspace_premium",
      desc: "Applicants must pass our proprietary safety and pedagogy curriculum, ensuring they meet world-class standards for specialized care.",
      color: "text-secondary-container"
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative mb-24 pb-12 border-b border-outline-variant/10">
        <div className="max-w-3xl">
          <span className="text-secondary font-headline font-black uppercase tracking-[0.3em] text-[10px] bg-secondary/10 px-4 py-1.5 rounded-full mb-6 inline-block">Vetting Protocol</span>
          <h1 className="font-headline text-5xl md:text-7xl font-black text-primary mb-8 leading-[0.9] tracking-tighter">
            Our 10-Step <span className="text-secondary italic">Trust</span> Architecture
          </h1>
          <p className="text-on-surface-variant text-xl leading-relaxed max-w-2xl font-medium opacity-80">
            We don't just "check boxes." We conduct a deep-dive editorial audit into every caregiver's history, behavior, and professional standards.
          </p>
        </div>
        <div className="absolute -top-12 -right-12 hidden xl:block w-80 h-80 rounded-[2.5rem] overflow-hidden shadow-2xl rotate-6 border-8 border-white p-2 bg-surface-container-low transition-transform hover:rotate-0 duration-700">
          <img 
            alt="Caregiver with child" 
            className="w-full h-full object-cover rounded-2xl" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiQTDKNNQLhwK-h751yIoOc5vD3ozLxhKnxEZfA5z4pArh2V20QCl8-p43kCPR7NR6xL3kEFI-XzuRWiou5R1CJQAGn96tfswRvZ6JJZmYpv8X0V3bHIHJo6tEfvJNI0_p6QFGxP7OzfZjp1SiOUqZBF8j2ayeIVGMyzNL1AfpfRxotZO4L5jJN_xpDMX1HrLRbNZgOJqst1xS9JSRwAns0niOgze14uAb_xNk4lE9mj0-EpvTtGUlhVWMT24iLQoGEPie5kBy5vM" 
          />
        </div>
      </section>

      {/* Vetting Process: Vertical Timeline */}
      <div className="max-w-4xl mx-auto space-y-6 pb-24 relative">
        {/* Animated Progress Line */}
        <div className="absolute left-[23px] top-6 bottom-6 w-[2px] bg-gradient-to-b from-primary via-primary-container to-surface-container-high hidden md:block opacity-20"></div>

        {steps.map((step, index) => (
          <div key={step.number} className="group relative flex flex-col md:flex-row gap-8 items-start md:items-center">
            {/* Number Indicator */}
            <div className="flex flex-col items-center shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-headline font-black z-10 shadow-xl group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                {step.number}
              </div>
            </div>

            {/* Content Card */}
            <div className="flex-1 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
              <div className="bg-surface-container-lowest p-8 md:p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all border border-outline-variant/10 hover:border-primary/20 relative overflow-hidden group/card text-left">
                <div className="flex items-center gap-6 mb-6">
                  <div className="p-3 bg-secondary/10 rounded-xl group-hover/card:bg-secondary group-hover/card:text-white transition-colors">
                    <MaterialIcon name={step.icon} className={cn("text-3xl transition-colors", step.color, "group-hover/card:text-white")} />
                  </div>
                  <h3 className="font-headline text-3xl font-black text-primary tracking-tight">{step.title}</h3>
                </div>
                <p className="text-on-surface-variant text-lg leading-relaxed font-medium opacity-80 group-hover/card:opacity-100 transition-opacity">
                  {step.desc}
                </p>
                <div className="absolute -right-4 -bottom-4 text-primary/5 font-black text-[120px] transition-transform group-hover/card:scale-110 duration-700 pointer-events-none italic">
                  {step.number}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Final Step CTA */}
        <div className="pt-20">
          <div className="p-12 md:p-20 bg-primary-container rounded-[4rem] text-center relative overflow-hidden shadow-2xl border border-white/10 group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-700"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline text-4xl md:text-6xl font-black text-white tracking-tighter leading-tight">Ready to find your <span className="text-secondary-container">perfect match</span>?</h2>
              <p className="text-on-primary-container text-xl max-w-2xl mx-auto opacity-90 leading-relaxed font-medium">
                Browse thousands of pre-vetted caregivers who have successfully completed our 10-step trust architecture.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                <button className="bg-secondary-fixed text-on-secondary-fixed px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl hover:shadow-secondary/40">
                  Start Searching Now
                </button>
                <button className="bg-white/10 backdrop-blur-xl text-white border border-white/20 px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all shadow-xl">
                  Contact Expert
                </button>
              </div>
            </div>
            <MaterialIcon name="verified" className="absolute -right-20 -bottom-20 text-[340px] opacity-10 -rotate-12 transition-transform group-hover:scale-110 group-hover:rotate-0 duration-1000" fill />
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
