"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function SafetyOverview() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary-container text-white p-8 md:p-16 mb-20 min-h-[400px] flex items-center shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <span className="inline-block px-4 py-1 rounded-full bg-white/10 text-tertiary-fixed text-[10px] font-bold uppercase tracking-[0.2em] mb-6">Security First</span>
          <h1 className="font-headline text-4xl md:text-6xl font-extrabold leading-tight mb-6">Our Commitment to Safety</h1>
          <p className="text-on-primary-container text-lg md:text-xl leading-relaxed mb-8 opacity-90">We believe that every family deserves peace of mind. Our multi-layered safety protocols are designed to protect what matters most.</p>
          <div className="flex space-x-4">
            <button className="bg-secondary-fixed-dim text-on-secondary-fixed px-10 py-4 rounded-2xl font-black uppercase tracking-wider text-sm transition-all hover:scale-105 shadow-lg shadow-black/20">Learn Our Process</button>
          </div>
        </div>
        {/* Asymmetric Image Decor */}
        <div className="absolute right-[-5%] top-[-10%] w-2/3 h-[120%] hidden md:block">
          <img 
            alt="Safety feature" 
            className="w-full h-full object-cover rounded-bl-[10rem] opacity-40 mix-blend-overlay"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLSqZ9RBAeY0vgTica_C-BbJoupjRZLD2vzesZtm19rPJw6FwOsWHSSCQrYgL2TWry70vePRuUD7nF5Cs5PBu23Vu0sQbBVMWkxaUk2XHq8R0httf8m0Ix1Nx83dVEyNqCDlWz3msQj2WoPhLeh2BPiY9ledd1Ojk9aP-QR7Zuro65BgGSU7sWmWeQ4ggymrmLthjz0yo4S8v2q95m0iGbZXwlYU-n31oKGECxMixfbIgtYy42IfmBlEyGu2gaDj3xWfGXobvGuyU" 
          />
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="mb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <h2 className="font-headline text-4xl font-black text-primary mb-4 tracking-tighter">The 4 Pillars of Trust</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">Every caregiver on Kindred Care undergoes a rigorous onboarding process before they can ever connect with a family.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { icon: "verified_user", title: "Rigorous Vetting", desc: "Background checks, professional reference verification, and social media screening for every single caregiver.", color: "bg-primary/5 text-primary" },
            { icon: "fingerprint", title: "Identity Verification", desc: "AI-powered government ID matching to ensure that every person is exactly who they say they are.", color: "bg-secondary-fixed/30 text-secondary" },
            { icon: "lock", title: "Secure Payments", desc: "Cashless transactions with end-to-end encryption. Your financial data is never shared with caregivers.", color: "bg-tertiary-fixed/30 text-on-tertiary-container" },
            { icon: "support_agent", title: "24/7 Support", desc: "A dedicated Trust & Safety team ready to assist you at any moment, day or night.", color: "bg-error-container/30 text-error" }
          ].map((pillar) => (
            <div key={pillar.title} className="group bg-surface-container-lowest p-10 rounded-[2rem] shadow-sm transition-all hover:shadow-xl hover:bg-surface-bright flex flex-col md:flex-row gap-8 items-start border border-outline-variant/10">
              <div className={cn("p-5 rounded-2xl shrink-0 transition-transform group-hover:scale-110", pillar.color)}>
                <MaterialIcon name={pillar.icon} className="text-4xl" fill />
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-primary mb-3">{pillar.title}</h3>
                <p className="text-on-surface-variant leading-relaxed mb-6 opacity-80">{pillar.desc}</p>
                <button className="text-primary font-black text-xs uppercase tracking-widest inline-flex items-center group-hover:gap-2 transition-all">
                  Read our criteria 
                  <MaterialIcon name="chevron_right" className="text-lg ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Feature Section */}
      <section className="bg-surface-container-low rounded-[4rem] p-12 md:p-24 flex flex-col lg:flex-row items-center gap-20 overflow-visible border border-white/20 shadow-inner">
        <div className="w-full lg:w-1/2 relative">
          <div className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl relative z-20 border-8 border-white/50">
            <img 
              alt="Caregiver" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvpsKRXBcLMpC82u3lDQhuK4rFhf-Oh0gEEOttyRtMzAxZnMguFQoSVLNzJqNcmeGfTAoNTfShT1NfwlQzhWs-p40_k2stf6y9uxKWCVds1UwuCG96OyiSrD7MdGnOfWgIdw-OkFXKvVQveX5KHst2st4L7YYy0oU5BJ3HbPz8BzzL77Qr4ZX9SAHAi5MUj567Os4-qn-z0kQVXyHFuo0ScAtgIKrWiPiAZO6WEeMyMW9vrLdl7QLsDxvSsPIYGoP_mjf_RPqxoKY" 
            />
          </div>
          <div className="absolute -bottom-12 -right-12 w-1/2 aspect-square rounded-3xl overflow-hidden shadow-2xl z-30 hidden md:block border-8 border-surface-container-low translate-x-6 -translate-y-6">
            <img 
              alt="Detail" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1Ulewybh4ewW1wnGQlTZUgJUpi1n0KRe1JLhtbd9Pcvwtw27q7SdXWvtGBZdVc9qDm8heWPnQyuFPSC0667ixYz5Pm0HXmnGHbx1oDNpJ3q25A5fvuRXuqHV_4aRAfm_1o0dEGz6qkHA50270D0P6qRbnQnIjhwPNNP9vveuLJFHfvlYWaCTVjeCwqd9cJjg-A0BDgFYKimvk_SNxwwJAWastvD2CGqeqH4JAQEXiicvsZhUOA4aGZrMcNrtZy17JdVegqw3O6qc" 
            />
          </div>
        </div>
        <div className="w-full lg:w-1/2 space-y-8">
          <h2 className="font-headline text-4xl md:text-5xl font-black text-primary mb-6 leading-[1.1] tracking-tighter">Human-Centric Review, Tech-Enabled Safety.</h2>
          <p className="text-on-surface-variant text-xl leading-relaxed mb-8 opacity-90">While our algorithms catch the obvious red flags, our team of former educators and childcare experts personally reviews high-impact profiles to ensure a standard of care that tech alone can't provide.</p>
          <ul className="space-y-6 mb-10">
            {[
              { text: "Personal interview for Premium Tier", icon: "how_to_reg" },
              { text: "Mandatory First Aid & CPR certifications", icon: "medical_services" },
              { text: "Continuous background monitoring", icon: "monitor_heart" }
            ].map((item) => (
              <li key={item.text} className="flex items-center space-x-4 group">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary transition-colors">
                  <MaterialIcon name={item.icon} className="text-primary group-hover:text-white transition-colors" fill />
                </div>
                <span className="text-on-surface font-bold font-headline">{item.text}</span>
              </li>
            ))}
          </ul>
          <button className="bg-primary text-on-primary px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:shadow-2xl transition-all hover:-translate-y-1">Explore Verification Levels</button>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-24 text-center max-w-4xl mx-auto px-6 py-24 bg-gradient-to-br from-secondary-fixed to-secondary-container rounded-[4rem] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="font-headline text-4xl font-black text-on-secondary-fixed mb-6 tracking-tighter">Something doesn't feel right?</h2>
          <p className="text-on-secondary-fixed-variant text-xl mb-12 max-w-2xl mx-auto opacity-90">We take all reports seriously. Whether it's a profile concern or a booking incident, our Trust & Safety team is here to investigate immediately.</p>
          <button className="bg-on-secondary-fixed text-white px-12 py-6 rounded-full font-black text-xl hover:scale-105 transition-all shadow-2xl hover:shadow-black/40 uppercase tracking-widest">
            Report an Incident Now
          </button>
          <p className="mt-10 text-on-secondary-fixed-variant text-xs font-black uppercase tracking-[0.3em] opacity-60">Confidential • 24/7 Response • Real Human Review</p>
        </div>
        <MaterialIcon name="warning" className="absolute -left-12 -bottom-12 text-[260px] opacity-10 italic" />
      </section>
    </div>
  );
}

import { cn } from "@/lib/utils";
