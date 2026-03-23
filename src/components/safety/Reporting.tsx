"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export default function SafetyReporting() {
  const [formData, setFormData] = useState({
    category: "",
    date: "",
    description: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle submission logic
    console.log("Report submitted:", formData);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative mb-24 flex flex-col lg:flex-row items-center gap-16">
        <div className="lg:w-3/5 z-10 space-y-10">
          <span className="inline-block px-5 py-2 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black tracking-[0.3em] uppercase rounded-full shadow-sm">Support Hub</span>
          <h1 className="font-headline text-5xl md:text-8xl font-black text-primary mb-8 leading-[0.9] tracking-tighter italic">
            Your trust is our <span className="text-secondary not-italic">greatest responsibility.</span>
          </h1>
          <p className="text-on-surface-variant text-xl max-w-xl font-medium opacity-80 leading-relaxed">
            We're here to ensure every connection is built on safety, transparency, and care. Whether you need immediate assistance or want to report a concern, our team is standing by.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button className="bg-primary text-on-primary px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
              <MaterialIcon name="report" className="text-xl" fill />
              Report a Concern
            </button>
            <button className="bg-surface-container-lowest text-primary px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm border border-outline-variant/30 flex items-center gap-3 hover:bg-surface-container-low transition-all active:scale-95 shadow-sm">
              <MaterialIcon name="chat" className="text-xl" />
              Instant Chat
            </button>
          </div>
        </div>
        <div className="lg:w-2/5 relative">
          <div className="w-full aspect-[4/5] bg-surface-container-low relative overflow-hidden rounded-[4rem] shadow-2xl border-8 border-white group">
            <img 
              alt="Caregiver interaction" 
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcRwHsybYdyrqXzauO_-5N_-CdtpDFc9k11HKPXWcGSAtJ4GhG_N-EVNgZi65nh24Cg-My_Z2oTfRkVjQM-_m1OhhRy6iyO8dPW44BpHfEYIj5IgQcSolLoDFAI0ThPQRkQgljvrasJnpC_1BBpFkM4Ga6ayh7JONbf4ZaA2J0Yab99MBWB8KYxkgRDzp-_i8zCM-uArb8grQgMT6F8lslqng22-huGpcbI3DhHswpvJG1XDTfufAYFhGu8tfWUQ7mTBZk6DTIH1A" 
            />
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-tertiary-fixed rounded-full -z-10 opacity-60 blur-3xl animate-pulse"></div>
        </div>
      </section>

      {/* Bento Grid for Core Safety Features */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-24">
        {/* Report a Concern Form */}
        <div className="md:col-span-12 lg:col-span-8 bg-surface-container-lowest p-10 md:p-16 rounded-[3rem] shadow-sm border border-outline-variant/10 hover:shadow-2xl transition-all group">
          <div className="flex items-center gap-6 mb-12">
            <div className="p-4 bg-error-container/20 text-error rounded-2xl shadow-inner group-hover:scale-110 transition-transform">
              <MaterialIcon name="security" className="text-4xl" fill />
            </div>
            <div>
              <h2 className="font-headline text-3xl font-black text-primary tracking-tighter">Report an Incident</h2>
              <p className="text-on-surface-variant text-sm font-medium opacity-70 mt-1 uppercase tracking-widest">Strictly confidential • 24h Response</p>
            </div>
          </div>
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-2">Type of Concern</label>
                <select 
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 text-primary font-bold shadow-inner cursor-pointer appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option>Select a category...</option>
                  <option>Profile Verification Issue</option>
                  <option>Unprofessional Behavior</option>
                  <option>Safety Violation</option>
                  <option>Terms of Service Breach</option>
                </select>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-2">Date of Incident</label>
                <input 
                  className="w-full bg-surface-container-low border-none rounded-2xl px-6 py-5 focus:ring-4 focus:ring-primary/10 text-primary font-bold shadow-inner" 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-2">Detailed Description</label>
              <textarea 
                className="w-full bg-surface-container-low border-none rounded-3xl px-6 py-6 focus:ring-4 focus:ring-primary/10 text-primary font-medium shadow-inner min-h-[160px]" 
                placeholder="Please provide as much detail as possible..." 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              ></textarea>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-6">
              <div className="flex items-center gap-3 text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-60">
                <MaterialIcon name="lock" className="text-xl" fill />
                Secure, encrypted submission
              </div>
              <button className="w-full sm:w-auto bg-primary text-on-primary px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95">Submit Report</button>
            </div>
          </form>
        </div>

        {/* Community Guidelines Card */}
        <div className="md:col-span-12 lg:col-span-4 bg-tertiary-container p-12 rounded-[3rem] text-on-tertiary flex flex-col justify-between overflow-hidden relative shadow-2xl group border border-white/10">
          <div className="relative z-10 space-y-8">
            <h3 className="font-headline text-4xl font-black mb-8 leading-tight tracking-tighter">The Kindred Code of Conduct</h3>
            <ul className="space-y-6 text-on-tertiary-container font-medium opacity-90">
              {[
                "Radical transparency in all profile details.",
                "Deep respect for family privacy and boundaries.",
                "Zero tolerance for harassment or discrimination."
              ].map(guideline => (
                <li key={guideline} className="flex gap-4 group/item">
                  <div className="shrink-0 mt-1">
                    <MaterialIcon name="check_circle" className="text-tertiary-fixed text-xl group-hover/item:scale-125 transition-transform" fill />
                  </div>
                  <span className="text-base leading-relaxed">{guideline}</span>
                </li>
              ))}
            </ul>
          </div>
          <button className="mt-12 text-tertiary-fixed font-black uppercase tracking-widest text-xs flex items-center gap-3 group relative z-10 px-6 py-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all border border-white/10">
            Read Full Guidelines
            <MaterialIcon name="arrow_forward" className="group-hover:translate-x-2 transition-transform" />
          </button>
          <MaterialIcon name="gavel" className="absolute -right-16 -bottom-16 text-[320px] opacity-10 transition-transform group-hover:scale-110 duration-1000 rotate-12" fill />
        </div>
      </div>

      {/* FAQ Specifically for Safety */}
      <section className="mb-24">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-left">
          <div className="max-w-xl">
            <h2 className="font-headline text-4xl md:text-5xl font-black text-primary mb-4 tracking-tighter italic">Safety <span className="text-secondary not-italic uppercase tracking-[0.2em] text-sm align-middle ml-4">FAQ</span></h2>
            <p className="text-on-surface-variant text-lg font-medium opacity-80 leading-relaxed">Common questions about our background checks, insurance coverage, and emergency protocols.</p>
          </div>
          <button className="text-primary font-black uppercase tracking-widest text-xs border-b-4 border-primary pb-2 hover:text-secondary hover:border-secondary transition-all">View All Help Topics</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { q: "How do you verify caregivers on the platform?", a: "Every nanny undergoes a multi-step verification process including identity checks, national criminal background screening, and professional reference calls." },
            { q: "Is my personal data shared with other users?", a: "We protect your privacy. Only verified members can see your profile details, and exact addresses are never shared until a booking is confirmed." },
            { q: "What insurance coverage is provided?", a: "Every booking made through NannyConnect US is covered by our $1M liability policy, ensuring peace of mind for both families and caregivers." },
            { q: "What should I do in an emergency?", a: "Always dial local emergency services (911) first. Once safe, use the Emergency SOS button in your dashboard to alert our dedicated safety response team." }
          ].map((faq, i) => (
            <div key={i} className="bg-surface-container-low p-10 rounded-3xl hover:bg-white hover:shadow-2xl transition-all cursor-pointer group border border-transparent hover:border-primary/5 text-left">
              <div className="flex justify-between items-start gap-6">
                <h4 className="font-headline font-heavy text-primary text-2xl leading-tight tracking-tight">{faq.q}</h4>
                <div className="w-10 h-10 bg-primary/5 rounded-full flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
                  <MaterialIcon name="add" className="text-primary group-hover:text-white transition-transform group-hover:rotate-45" />
                </div>
              </div>
              <p className="mt-8 text-on-surface-variant text-lg leading-relaxed font-medium opacity-0 group-hover:opacity-105 h-0 group-hover:h-auto overflow-hidden transition-all duration-500">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Path to Support: Calm, Empathetic Tone */}
      <section className="bg-secondary-fixed text-on-secondary-fixed p-12 md:p-20 rounded-[4rem] flex flex-col lg:flex-row items-center justify-between gap-12 shadow-2xl relative overflow-hidden group">
        <div className="max-w-2xl text-center lg:text-left relative z-10">
          <h2 className="font-headline text-4xl md:text-5xl font-black mb-6 tracking-tighter">Need to talk to a human?</h2>
          <p className="text-on-secondary-fixed-variant text-xl leading-relaxed font-medium opacity-90">Our Trust & Safety team is available 24/7. Whether it's a minor question or a complex concern, we provide calm, empathetic support for every situation.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 shrink-0 relative z-10 w-full lg:w-auto">
          <button className="bg-on-secondary-fixed text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-2xl shadow-black/20 hover:scale-105 transition-all w-full sm:w-auto">
            <MaterialIcon name="call" className="text-xl" fill />
            Request Callback
          </button>
          <button className="bg-white/40 backdrop-blur-md border-2 border-on-secondary-fixed/10 text-on-secondary-fixed px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-white/60 transition-all active:scale-95 w-full sm:w-auto">
            <MaterialIcon name="mail" className="text-xl" />
            Email Safety Team
          </button>
        </div>
        <MaterialIcon name="favorite" className="absolute -right-16 -top-16 text-[320px] opacity-5 rotate-12 group-hover:scale-110 duration-1000" fill />
      </section>
      
      {/* Floating SOS FAB (Visual indicator) */}
      <button className="fixed bottom-10 right-10 bg-primary text-on-primary w-20 h-20 rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 hover:-rotate-12 transition-all group overflow-hidden border-4 border-white">
        <div className="absolute inset-0 bg-error opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <MaterialIcon name="sos" className="text-4xl relative z-10" fill />
      </button>
    </div>
  );
}
