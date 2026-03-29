"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { createSubscriptionSession } from "@/lib/actions/subscription";
import { useToast } from "@/components/Toast";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<"month" | "year" | null>(null);
  const { showToast } = useToast();

  async function handleSubscribe(interval: "month" | "year") {
    setLoading(interval);
    try {
      const { url } = await createSubscriptionSession(interval);
      if (url) window.location.href = url;
    } catch (error: any) {
      showToast(error.message || "Failed to start checkout session", "error");
      setLoading(null);
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Editorial Shadow Style */}
      <style jsx global>{`
        .editorial-shadow {
          box-shadow: 0 32px 64px -12px rgba(3, 31, 65, 0.06);
        }
      `}</style>

      <main className="pt-24 pb-20">
        {/* Hero Section: Editorial Layout */}
        <section className="relative px-8 py-12 lg:py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 z-10 space-y-8">
              <span className="inline-block px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black tracking-widest uppercase rounded-full">
                Premium Access
              </span>
              <h1 className="font-headline text-5xl lg:text-7xl font-extrabold text-primary leading-[1.1] tracking-tighter italic">
                The gold standard in <span className="text-secondary">bespoke</span> childcare.
              </h1>
              <p className="font-body text-xl text-on-surface-variant max-w-xl leading-relaxed opacity-70">
                Elevate your family's care journey with Kindred Premium. Unrivaled security, early access to elite talent, and a dedicated concierge at your fingertips.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 pt-4">
                {/* Monthly Button */}
                <button 
                  onClick={() => handleSubscribe("month")}
                  disabled={!!loading}
                  className="bg-primary text-white px-10 py-6 rounded-2xl font-black text-center flex flex-col justify-center items-center shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="text-[10px] uppercase tracking-widest text-primary-fixed/60 mb-1">Standard</span>
                  <span className="text-2xl">$23 / Month</span>
                  {loading === "month" && <div className="mt-2 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                </button>

                {/* Annual Button */}
                <button 
                  onClick={() => handleSubscribe("year")}
                  disabled={!!loading}
                  className="bg-white border-2 border-secondary text-primary px-10 py-6 rounded-2xl font-black hover:bg-surface-container-low transition-all relative overflow-hidden group shadow-xl"
                >
                  <div className="absolute top-0 right-0 bg-secondary text-white px-4 py-1.5 text-[10px] uppercase tracking-widest rounded-bl-xl font-black">Best Value</div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant/60 mb-1">Annual • Commit to Care</span>
                    <span className="text-2xl">$150 / Year</span>
                    <span className="text-[10px] text-secondary mt-1 font-black">Save $126/year (Nearly 50% Off)</span>
                  </div>
                  {loading === "year" && <div className="mt-2 w-4 h-4 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />}
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-[4/5] rounded-[3rem] overflow-hidden editorial-shadow border border-outline-variant/10">
                <img 
                  alt="Professional Nanny" 
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1544126592-807daa2b569b?auto=format&fit=crop&q=80&w=800"
                />
              </div>
              {/* Editorial Offset Element */}
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl editorial-shadow max-w-[280px] hidden md:block border border-outline-variant/10">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="verified" className="text-secondary text-2xl" fill />
                  <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Elite Certified</span>
                </div>
                <p className="text-sm font-medium italic text-on-surface leading-relaxed">"The peace of mind knowing my nanny was vetted by experts is priceless."</p>
                <p className="text-[10px] mt-4 text-slate-400 font-black tracking-widest uppercase">— Sarah J., Manhattan Member</p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Propositions: Bento Grid */}
        <section className="bg-surface-container-low py-32 mt-20">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-20 space-y-4">
              <h2 className="font-headline text-4xl md:text-5xl font-black text-primary tracking-tighter italic">Uncompromising Value</h2>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto opacity-70 italic">Investment in your child's safety and your family's peace of mind starts here.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
              {/* Prop 1 */}
              <div className="md:col-span-3 bg-white p-12 rounded-[3rem] editorial-shadow flex flex-col justify-between border border-outline-variant/5">
                <div>
                  <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-10">
                    <MaterialIcon name="chat_bubble" className="text-primary text-3xl" fill />
                  </div>
                  <h3 className="font-headline text-3xl font-black text-primary mb-6 italic">Secure Messaging</h3>
                  <p className="text-on-surface-variant leading-relaxed font-medium opacity-70">Connect instantly with top caregivers through our encrypted portal. No limits, just seamless communication for your family.</p>
                </div>
                <div className="mt-10 pt-10 border-t border-outline-variant/10">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Direct Communication</span>
                </div>
              </div>

              {/* Prop 2 */}
              <div className="md:col-span-3 bg-primary rounded-[3rem] p-12 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center mb-10">
                    <MaterialIcon name="bolt" className="text-secondary text-3xl" fill />
                  </div>
                  <h3 className="font-headline text-3xl font-black mb-6 italic">Priority Early Access</h3>
                  <p className="text-white/60 leading-relaxed font-medium">Beat the crowd. Premium members see and interview new nannies 48 hours before they go public to the rest of the community.</p>
                </div>
                <div className="mt-10 pt-10 border-t border-white/10 relative z-10">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">48-Hour Headstart</span>
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary opacity-20 blur-[100px]"></div>
              </div>

              {/* Prop 3 */}
              <div className="md:col-span-2 bg-white p-10 rounded-[3rem] editorial-shadow border border-outline-variant/5">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-8">
                  <MaterialIcon name="support_agent" className="text-secondary text-2xl" fill />
                </div>
                <h3 className="font-headline text-2xl font-black text-primary mb-4 italic">Concierge</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed font-medium opacity-70">1-on-1 assistance with your search. We help filter, schedule, and advise on the best matches.</p>
              </div>

              {/* Prop 4 */}
              <div className="md:col-span-4 bg-white p-10 rounded-[3rem] editorial-shadow flex flex-col md:flex-row gap-10 items-center border border-outline-variant/5">
                <div className="flex-1 space-y-4">
                  <div className="w-14 h-14 bg-tertiary-fixed/30 rounded-2xl flex items-center justify-center">
                    <MaterialIcon name="assignment_turned_in" className="text-primary text-2xl" fill />
                  </div>
                  <h3 className="font-headline text-2xl font-black text-primary italic">Advanced Vetting</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-medium opacity-70">Deep-dive into background check details. Go beyond the surface with comprehensive behavioral fit reports.</p>
                </div>
                <div className="w-full md:w-1/3 aspect-square rounded-[2rem] overflow-hidden grayscale opacity-80">
                  <img 
                    alt="Vetting" 
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=400"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Foundation */}
        <section className="py-32 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative grid grid-cols-2 gap-6">
              <img 
                alt="Family" 
                className="w-full aspect-[3/4] object-cover rounded-[4rem] shadow-2xl"
                src="https://images.unsplash.com/photo-1581952975145-a52415360739?auto=format&fit=crop&q=80&w=600"
              />
              <img 
                alt="Verification" 
                className="w-full aspect-[3/4] object-cover rounded-[4rem] mt-16 shadow-2xl shadow-primary/10 border-8 border-surface"
                src="https://images.unsplash.com/photo-1544717297-fa95b3ee51f3?auto=format&fit=crop&q=80&w=600"
              />
              <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] rounded-full"></div>
            </div>
            
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="font-headline text-5xl font-black text-primary tracking-tighter leading-tight italic">Safety is not a feature. <br/> It is our foundation.</h2>
                <p className="text-xl text-on-surface-variant opacity-70 leading-relaxed font-medium">We maintain the highest standards of trust through a rigorous, multi-layered vetting process.</p>
              </div>

              <ul className="space-y-8">
                {[
                  { title: "Identity Verification", desc: "Multi-factor identity screening for every caregiver." },
                  { title: "Continuous Monitoring", desc: "Real-time alerts for any changes in background status." },
                  { title: "Behavioral Assessments", desc: "Proprietary vetting for the perfect family fit." }
                ].map((item) => (
                  <li key={item.title} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center transition-transform group-hover:rotate-6">
                      <MaterialIcon name="check" className="text-2xl" />
                    </div>
                    <div>
                      <h4 className="font-headline text-xl font-bold text-primary tracking-tight italic mb-1">{item.title}</h4>
                      <p className="text-sm text-on-surface-variant font-medium opacity-60 leading-relaxed">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Final Conversion CTA */}
        <section className="py-24 px-8">
          <div className="max-w-5xl mx-auto bg-primary rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/40">
            <div className="relative z-10 space-y-12">
              <div className="space-y-6">
                <h2 className="font-headline text-4xl md:text-6xl font-black text-white tracking-tighter italic">Invest in the best.</h2>
                <p className="text-xl text-white/60 max-w-xl mx-auto font-medium">Elite care plans designed for long-term peace of mind.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
                {/* Monthly CTA */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center justify-between space-y-8">
                  <div className="space-y-2">
                    <h3 className="text-white font-black uppercase tracking-widest text-[10px] opacity-40">Monthly Flex</h3>
                    <div className="text-white">
                      <span className="text-6xl font-black font-headline tracking-tighter">$23</span>
                      <span className="text-sm font-black opacity-30 ml-2 uppercase">/ mo</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSubscribe("month")}
                    disabled={!!loading}
                    className="w-full bg-white/10 hover:bg-white text-white hover:text-primary px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30"
                  >
                    {loading === "month" ? "Wait..." : "Choose Monthly"}
                  </button>
                </div>

                {/* Annual CTA */}
                <div className="bg-secondary text-white rounded-[2.5rem] p-10 flex flex-col items-center justify-between relative shadow-2xl scale-105 space-y-8 ring-8 ring-primary">
                  <div className="absolute -top-4 bg-white text-secondary px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Best Value</div>
                  <div className="space-y-2">
                    <h3 className="font-black uppercase tracking-widest text-[10px] opacity-60">Annual Commitment</h3>
                    <div className="space-y-1">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-6xl font-black font-headline tracking-tighter">$150</span>
                        <span className="text-sm font-black opacity-40 uppercase">/ year</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1 rounded-full inline-block">Saves $126 / year</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSubscribe("year")}
                    disabled={!!loading}
                    className="w-full bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-30"
                  >
                    {loading === "year" ? "Wait..." : "Join Now & Save"}
                  </button>
                </div>
              </div>
              
              <div className="pt-8">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em]">Cancel anytime • Secure checkout</p>
              </div>
            </div>

            {/* Background Polish */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full"></div>
          </div>
        </section>
      </main>
    </div>
  );
}
