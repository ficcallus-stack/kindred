"use client";

import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";

export default function PremiumPage() {
  return (
    <div className="bg-surface font-body text-on-surface">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm shadow-blue-900/5">
        <div className="flex justify-between items-center px-8 h-20 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-bold tracking-tighter text-blue-900 font-headline">
            KindredCare US
          </Link>
          <div className="hidden md:flex gap-8 items-center font-headline font-medium text-sm tracking-tight">
            <Link className="text-slate-500 hover:text-blue-800 transition-colors duration-200 uppercase tracking-widest text-[10px] font-black" href="/dashboard/parent">Dashboard</Link>
            <Link className="text-slate-500 hover:text-blue-800 transition-colors duration-200 uppercase tracking-widest text-[10px] font-black" href="/browse">Browse Nannies</Link>
            <Link className="text-slate-500 hover:text-blue-800 transition-colors duration-200 uppercase tracking-widest text-[10px] font-black" href="#">Favorites</Link>
            <Link className="text-slate-500 hover:text-blue-800 transition-colors duration-200 uppercase tracking-widest text-[10px] font-black" href="#">Messages</Link>
          </div>
          <div className="flex gap-4 items-center">
            <button className="text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-blue-900 transition-colors">Sign In</button>
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-primary/10">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-8 mb-20 animate-in fade-in duration-700">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="inline-block px-4 py-1.5 bg-secondary-fixed text-on-secondary-fixed rounded-full text-[10px] font-black tracking-[0.2em] uppercase">Premium Membership</span>
              <h1 className="text-5xl md:text-7xl font-black font-headline text-primary tracking-tighter leading-[1.05] italic">
                Elevate Your <br/> Care Experience
              </h1>
              <p className="text-xl text-on-surface-variant max-w-lg leading-relaxed italic font-medium opacity-80">
                Unlock the full potential of KindredCare US with our Premium Family Plan. Professional support for your most precious priority.
              </p>
              <div className="flex flex-col sm:row gap-6 pt-4">
                <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2x shadow-primary/20 active:scale-95 transition-all hover:-translate-y-1">
                  Start Your 7-Day Free Trial
                </button>
                <div className="flex items-center gap-3 px-4">
                  <span className="text-4xl font-black text-primary font-headline italic tracking-tighter">$50</span>
                  <span className="text-on-surface-variant font-black uppercase tracking-widest text-[10px] opacity-40">/ month</span>
                </div>
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -top-10 -right-10 w-72 h-72 bg-secondary-container/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
              <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-primary-fixed/20 rounded-full blur-[100px]"></div>
              <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-2xl bg-white p-5 transition-transform duration-700 hover:scale-[1.02]">
                <img 
                  alt="Modern care illustration" 
                  className="w-full h-auto rounded-[2.2rem]" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcExO12olYWZ9ZIFxj-w8e2gX2Z4mDt7dp4SRJpYEuFFxTosDeI6YtT5r_SnxPVo4ySCUf-WOnBVb8bWMsZrjm0igwiVTl2rmiHMaOWpbtrjKFZ33iu0oAL5sakyAEb52fNdlHmynBEDk3IZF5E_X8w-0yE4BpqH_eTCmw6ucK_mEEgStfS5rwoqqmLzEEzywx-1PHvPEsgzS8a1lHS-Y031FxY1pBv2Z05dLDLq0zTdKutq-dRzoCDIXWUDrxlHsbblG-LlaWbUk" 
                />
              </div>
              
              {/* Floating Achievement Card */}
              <div className="absolute -bottom-8 -left-4 bg-white/95 p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 z-20 max-w-xs border border-white/50 backdrop-blur-xl animate-bounce-slow">
                <div className="w-12 h-12 rounded-2xl bg-secondary-fixed flex items-center justify-center shadow-inner">
                  <MaterialIcon name="verified_user" className="text-on-secondary-fixed text-2xl" fill />
                </div>
                <div>
                  <p className="font-black text-primary text-md leading-tight tracking-tight">Fully Vetted Network</p>
                  <p className="text-[9px] text-on-surface-variant uppercase tracking-[0.2em] font-black opacity-40">Background checks included</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Bento Grid */}
        <section className="bg-surface-container-low py-32">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-24 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tighter italic">Designed for Modern Families</h2>
              <p className="text-on-surface-variant max-w-2xl mx-auto text-xl italic font-medium opacity-60">Experience the peace of mind that comes with premium features tailored to your unique childcare needs.</p>
            </div>
            
            <div className="grid md:grid-cols-6 gap-8">
              {/* Messaging */}
              <div className="md:col-span-3 bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all group border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-105 transition-transform overflow-hidden shadow-inner border border-slate-100/50">
                    <img alt="Secure Messaging" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWlzbel8IaSEPC0xUv6ujWdjh0rJwTphdF1p7Yii0oAGONrXVD5lDZ9DROnBe1UoguHl5OFV3ePF9FQfc8u96Q_xpmCJBhJEGybUjo5wAPzPPFX7hz9RjJ8H3xQGFJt0QeLROW_BOrAjVDwzoIVdpmU-F5xBLdPbzhGy2-iAqlNGE4yP1n1sgAnZ_KYTJdL8xErddbqz__4nR19IYYgnryNe2reEJdLh6t_iSdJimkvp6CjXUQ2Y459rWarQDijA45mCcBeERxXGo" />
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-4 tracking-tight">Unlimited Secure Messaging</h3>
                  <p className="text-on-surface-variant leading-relaxed italic font-medium opacity-70">Connect instantly and securely with as many nannies as you need. No limits on conversations or connections.</p>
                </div>
              </div>

              {/* Priority */}
              <div className="md:col-span-3 bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all group border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-10 group-hover:scale-105 transition-transform overflow-hidden shadow-inner border border-slate-100/50">
                    <img alt="Priority Placement" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvWbBXF3NTRMYTJQOPOKSsZbhgyKzQa-H-UaEQwoFP8kofN1DkvaetaLBHFg82F1FleKkCphs1E0ioh7-C4tDC_XzaUZX5KB_X6OSdQCDPb2cAUa2Meslo4mUF-x7av3PcDOBWRNdizyth0U3ewcaWbEyfP-KzdpgmVDQQGgGQyCVJidUjakTNteBnGAHGIOim33r5tCWKUK_pAw9zQarJHL6UdVbbrWovgfdCU5twO0M5luijfSyXfM___nq6MHItuGBTyFFjdFM" />
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-4 tracking-tight">Priority Job Placement</h3>
                  <p className="text-on-surface-variant leading-relaxed italic font-medium opacity-70">Your job postings stay at the top of the nanny board for faster visibility and 3x more applications on average.</p>
                </div>
              </div>

              {/* Early Access */}
              <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-10 rounded-[3rem] shadow-2xl text-on-primary group flex flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10">
                    <MaterialIcon name="schedule_send" className="text-white text-3xl" fill />
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">Early Access</h3>
                  <p className="text-primary-fixed/80 leading-relaxed italic font-medium text-sm">View and message new nannies 48 hours before anyone else. Get ahead of the curve.</p>
                </div>
                <div className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-secondary relative z-10">Premium Exclusive</div>
                {/* Accent */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              </div>

              {/* Concierge */}
              <div className="md:col-span-4 bg-white p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all flex flex-col md:flex-row gap-10 items-center border border-slate-100">
                <div className="flex-1">
                  <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-10 overflow-hidden shadow-inner border border-slate-100/50">
                    <img alt="Concierge Support" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsq5VXVOXl4_GlN7PQSuf-uLV6pdSo1BaHqCiSO7inLkLWOBkwZdw2I0KBORYJAFhE3bN2LTyu0ebxuMCgQ2OLLBvMufZ7OmXdNmqt3c3Z_t3mnvaV5uEu2DQcKKW7HjkCbU7c8AMenTMuL2ukmXAM_jr8o2RGmEXAqL3cughqNlkZq72D8dHos4Mol2TbtYTUDMINhvTtVqpBoCIzfNRVv03Z2X3baGlZMQeGlWRu2HrTam95QjHNVtAaNhFFgDqQGVc15P_SwY8" />
                  </div>
                  <h3 className="text-2xl font-black text-primary mb-4 tracking-tight">Dedicated Concierge Support</h3>
                  <p className="text-on-surface-variant leading-relaxed italic font-medium opacity-70">Get 1-on-1 assistance with vetting and scheduling from our care specialists who know your family's needs.</p>
                </div>
                <div className="w-full md:w-64 h-64 bg-surface rounded-[2.5rem] overflow-hidden shrink-0 shadow-2xl border-8 border-white group-hover:rotate-2 transition-transform duration-500">
                  <img alt="Professional consultant" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDH5Tdv7cBkgxwqjIwSnqOprXIwDsxzQ0gDTr2oWd3REFSMq2JvIJpUZPvlYzIGtfbouV9J6t3UjEncqMaP0_mhG1HXsfFRfvSX9K8VblOPAFsBO0dNKY7kHy7-HOu17uhHkJBPOS8U5QW_8zUF4zLlpsEnnQKPD_7JPukmT_qJolOgsVn_xz9w_qKEDKd1aKpODUcUcsr9fMI3e0Ol7vw7geOY1uji59PCTNyqK4mj0x0y8bYGPo69ft3KjZEaCcwRbBWZmAa4dvA" />
                </div>
              </div>

              {/* Insights */}
              <div className="md:col-span-6 bg-white p-12 rounded-[3.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-16 overflow-hidden relative border border-slate-100 hover:shadow-2xl transition-all">
                <div className="absolute top-0 right-0 w-80 h-80 bg-primary-fixed/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="max-w-xl relative z-10">
                  <h3 className="text-3xl font-black text-primary mb-6 tracking-tight italic">Advanced Profile Insights</h3>
                  <p className="text-xl text-on-surface-variant leading-relaxed mb-8 italic font-medium opacity-60">Make informed decisions with confidence. See detailed nanny background check summaries and verified professional references in one comprehensive view.</p>
                  <div className="flex flex-wrap gap-4">
                    {["Criminal Record Scan", "Reference Verification", "Identity Authentication"].map(tag => (
                      <div key={tag} className="flex items-center gap-3 bg-surface-container-low px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-primary shadow-sm">
                        <MaterialIcon name="check_circle" className="text-emerald-500 text-lg" fill />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="w-full md:w-auto shrink-0 relative z-10 opacity-5 group-hover:opacity-10 transition-opacity">
                  <MaterialIcon name="analytics" className="text-primary" style={{ fontSize: "160px" }} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Call to Action */}
        <section className="max-w-5xl mx-auto px-8 py-32 text-center">
          <div className="bg-white rounded-[4rem] p-16 md:p-24 shadow-2xl relative overflow-hidden border border-slate-50">
            <div className="absolute top-0 left-0 w-full h-3 bg-gradient-to-r from-secondary-container via-primary to-tertiary-container"></div>
            <h2 className="text-5xl font-black font-headline text-primary mb-8 tracking-tighter italic">Simple, Transparent Pricing</h2>
            <div className="flex justify-center items-baseline gap-3 mb-12">
              <span className="text-8xl font-black text-primary font-headline tracking-tighter">$50</span>
              <span className="text-2xl text-on-surface-variant font-black uppercase tracking-widest opacity-40">/ month</span>
            </div>
            <div className="max-w-md mx-auto space-y-10">
              <p className="text-on-surface-variant text-xl italic font-medium opacity-60 leading-relaxed">Cancel anytime. No hidden fees. Start with a 7-day trial and see why thousands of families trust KindredCare US.</p>
              <button className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/30 hover:-translate-y-1 hover:shadow-primary/50 transition-all active:scale-95">
                Start Your 7-Day Free Trial
              </button>
              <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 pt-8">
                {[
                  { icon: "lock", text: "Secure Payment" },
                  { icon: "event", text: "Cancel Anytime" },
                  { icon: "redeem", text: "7-Day Trial" }
                ].map(item => (
                  <div key={item.text} className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">
                    <MaterialIcon name={item.icon} className="text-primary text-xl" fill />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
