"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export default function SafetySecurity() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 mb-16">
        <div className="max-w-4xl relative z-10">
          <span className="inline-block bg-tertiary-fixed text-on-tertiary-fixed-variant px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">Security Infrastructure</span>
          <h1 className="text-5xl md:text-8xl font-black font-headline leading-[0.9] text-primary mb-10 tracking-tighter">
            Our defense, <br/><span className="text-secondary italic font-normal">your peace of mind.</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl leading-relaxed font-medium opacity-80">
            NannyConnect US employs bank-grade security protocols to ensure that every message, every payment, and every bit of data remains exclusively yours.
          </p>
        </div>
        {/* Asymmetric Image Decor */}
        <div className="hidden xl:block absolute -right-20 top-0 w-1/3 aspect-[4/5] bg-primary-container rounded-tl-[120px] rounded-br-[120px] shadow-2xl overflow-hidden opacity-90 border-8 border-white/10 rotate-3 translate-x-12 transition-transform hover:rotate-0 duration-1000">
          <img 
            className="w-full h-full object-cover mix-blend-overlay" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiU1hJnsXR3DvV8cvSTDtFp6LbM8umFSQCOlIUaMVJrFzyvQZhjWEs9v_jml22p5YTsInVbv2xP1sZTlw8o16eKeRG7u98XNBU9xFpjvlisa8Aemm1XkzGnq-I-v5PAKzSvu02Gf955vhDjorwWC-Hwj2HqO0G67PMrEE0dpseS1c8JmCAqNV1xGFAGmsgi1KAQFYGaLoA7mLpPRWZFY_FmiyPLrctzvuneHgPPwGETf3XzoqtlGIVC_-NAONYfGuukRGXlvwA6eY" 
          />
        </div>
      </section>

      {/* Bento Grid of Features */}
      <section className="pb-24">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {/* 1. End-to-end Encrypted Messaging */}
          <div className="md:col-span-3 bg-surface-container-lowest p-12 rounded-[2.5rem] shadow-sm group transition-all hover:bg-white hover:shadow-2xl border border-outline-variant/10">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-on-primary mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl shadow-primary/20">
              <MaterialIcon name="encrypted" className="text-4xl" fill />
            </div>
            <h3 className="text-3xl font-black font-headline mb-6 text-primary tracking-tight">End-to-End Encrypted Messaging</h3>
            <p className="text-on-surface-variant leading-relaxed text-lg font-medium opacity-80 group-hover:opacity-100 transition-opacity">
              Your conversations are your business. We use Signal Protocol-based encryption to ensure that only you and the caregiver can read what is sent. No one—not even NannyConnect US—can intercept or view your chat history.
            </p>
          </div>

          {/* 2. Secure Payment Processing */}
          <div className="md:col-span-3 bg-primary-container text-on-primary p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center text-on-secondary-container mb-10 shadow-xl">
                <MaterialIcon name="payments" className="text-4xl" fill />
              </div>
              <h3 className="text-3xl font-black font-headline mb-6 tracking-tight">Stripe-Integrated Payments</h3>
              <p className="text-on-primary-container leading-relaxed mb-8 text-lg font-medium opacity-90">
                We never store your credit card information on our servers. All transactions are handled by Stripe, the world leader in secure digital payments, utilizing 256-bit AES encryption.
              </p>
              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest bg-white/10 w-fit px-6 py-3 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                <MaterialIcon name="verified" className="text-lg text-secondary-container" fill />
                PCI DSS Level 1 Certified
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-10 transition-transform group-hover:scale-110 duration-1000">
              <MaterialIcon name="shield_lock" className="text-[280px]" />
            </div>
          </div>

          {/* 3. Data Privacy & SSL */}
          <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-[2rem] shadow-sm flex flex-col justify-between border border-outline-variant/10 hover:shadow-xl transition-all">
            <div>
              <div className="inline-flex p-3 bg-secondary/10 rounded-xl mb-8">
                <MaterialIcon name="vpn_lock" className="text-4xl text-secondary" />
              </div>
              <h3 className="text-2xl font-black font-headline mb-4 text-primary tracking-tight">SSL Security</h3>
              <p className="text-on-surface-variant font-medium opacity-70 leading-relaxed">
                Every interaction on our platform is protected by high-grade SSL certificates, creating an impenetrable tunnel for your data.
              </p>
            </div>
            <div className="mt-12 pt-8 border-t border-outline-variant/20 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-outline">Protocol:</span>
              <span className="text-xs font-mono bg-surface-variant px-3 py-1.5 rounded-lg w-fit shadow-inner font-bold text-primary tracking-wider">HTTPS/TLS 1.3</span>
            </div>
          </div>

          {/* 4. Identity Shield */}
          <div className="md:col-span-4 bg-tertiary-container text-on-tertiary p-10 md:p-16 rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-12 items-center relative overflow-hidden group">
            <div className="md:w-2/3 relative z-10">
              <h3 className="text-4xl font-black font-headline mb-6 tracking-tight">Identity Shielding</h3>
              <p className="text-on-tertiary-container leading-relaxed mb-10 text-lg font-medium opacity-90">
                To prevent unwanted contact, we mask your phone number and email address during the initial discovery phase. Caregivers only see what you choose to share until a booking is finalized and confirmed.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Anonymized Routing", "Privacy Obfuscation", "Metadata Stripping"].map(tag => (
                   <span key={tag} className="bg-tertiary-fixed text-on-tertiary-fixed-variant px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-white/20 transition-all cursor-default">{tag}</span>
                ))}
              </div>
            </div>
            <div className="md:w-1/3 flex justify-center relative z-10 shrink-0">
              <div className="relative group/mask">
                <div className="w-48 h-48 rounded-full border-4 border-dashed border-on-tertiary-container/30 flex items-center justify-center transition-transform duration-700 group-hover/mask:rotate-45">
                  <MaterialIcon name="masks" className="text-7xl opacity-80" />
                </div>
                <div className="absolute -top-2 -right-2 bg-secondary rounded-full p-4 shadow-xl shadow-black/20 animate-bounce">
                  <MaterialIcon name="check" className="text-white text-2xl font-bold" />
                </div>
              </div>
            </div>
            <MaterialIcon name="privacy_tip" className="absolute -right-12 -top-12 text-[240px] opacity-10 -rotate-12" />
          </div>
        </div>
      </section>

      {/* Trust Stats / Badges */}
      <section className="bg-surface-container-high px-8 md:px-16 lg:px-24 py-20 flex flex-col md:flex-row justify-between items-center gap-16 border-t border-white rounded-[4rem] shadow-inner mb-24">
        {[
          { stat: "99.9%", label: "Platform Uptime" },
          { stat: "Zero", label: "Major Security Breaches" },
          { stat: "1.2M", label: "Secure Payments Handled" }
        ].map(item => (
          <div key={item.label} className="text-center md:text-left group">
            <h4 className="text-5xl font-black font-headline text-primary mb-3 tracking-tighter group-hover:scale-110 transition-transform">{item.stat}</h4>
            <p className="text-on-surface-variant font-black uppercase tracking-[0.2em] text-[10px] opacity-70">{item.label}</p>
          </div>
        ))}
        <div className="flex gap-6 shrink-0">
          <div className="px-6 py-4 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-[10px] text-primary/40 uppercase tracking-widest border border-white shadow-sm hover:opacity-100 transition-opacity cursor-default">SOC2 COMPLIANT</div>
          <div className="px-6 py-4 bg-white/50 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-[10px] text-primary/40 uppercase tracking-widest border border-white shadow-sm hover:opacity-100 transition-opacity cursor-default">GDPR READY</div>
        </div>
      </section>
    </div>
  );
}
