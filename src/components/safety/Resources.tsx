"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function SafetyResources() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Search Section */}
      <section className="mb-16">
        <div className="relative bg-primary-container rounded-[2.5rem] p-10 md:p-20 overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <h1 className="font-headline text-4xl md:text-6xl font-black text-white leading-tight mb-8 tracking-tighter">
              How can we help you stay <span className="text-secondary-container italic">safe</span> today?
            </h1>
            <div className="relative group">
              <MaterialIcon name="search" className="absolute left-5 top-1/2 -translate-y-1/2 text-on-primary-container text-2xl group-focus-within:text-white transition-colors" />
              <input 
                className="w-full bg-white/10 border-none ring-2 ring-white/10 focus:ring-4 focus:ring-secondary-container/50 rounded-2xl py-6 pl-16 pr-8 text-white placeholder:text-on-primary-container/60 text-xl transition-all backdrop-blur-xl shadow-inner font-body" 
                placeholder="Search safety tips, guides, or protocols..." 
                type="text"
              />
            </div>
          </div>
          {/* Decorative Elements */}
          <div className="absolute top-[-10%] right-[-5%] w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/40 rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* Categorized Resources (Bento Style) */}
      <section className="mb-24">
        <div className="flex justify-between items-end mb-12">
          <div>
            <span className="text-secondary font-headline font-black uppercase tracking-[0.3em] text-[10px] bg-secondary/10 px-4 py-1.5 rounded-full mb-4 inline-block">Resource Hub</span>
            <h2 className="font-headline text-4xl font-black mt-2 tracking-tighter text-primary">Guides for Families</h2>
          </div>
          <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center hover:gap-4 transition-all group">
            View All 
            <MaterialIcon name="arrow_forward" className="ml-2 group-hover:text-secondary" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Featured Guide */}
          <div className="md:col-span-12 lg:col-span-7 bg-surface-container-lowest p-12 rounded-[2.5rem] shadow-sm group hover:shadow-2xl transition-all relative overflow-hidden border border-outline-variant/10">
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="bg-tertiary-fixed text-on-tertiary-fixed px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase inline-block mb-6 shadow-sm">ESSENTIAL</div>
                <h3 className="font-headline text-3xl md:text-4xl font-black mb-4 text-primary tracking-tight">The Ultimate First Meeting Checklist</h3>
                <p className="text-on-surface-variant text-lg max-w-md opacity-80 leading-relaxed font-medium">Master the art of the interview with our comprehensive safety-first guide to meeting potential caregivers.</p>
              </div>
              <div className="mt-12">
                <button className="bg-primary text-on-primary px-10 py-4 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-primary/40 transition-all flex items-center gap-3">
                  Read Guide 
                  <MaterialIcon name="open_in_new" className="text-lg" />
                </button>
              </div>
            </div>
            <div className="absolute right-[-40px] bottom-[-40px] opacity-5 transition-transform group-hover:scale-110 duration-700">
              <MaterialIcon name="meeting_room" className="text-[280px]" fill />
            </div>
          </div>

          {/* Small Guides Stack */}
          <div className="md:col-span-12 lg:col-span-5 grid grid-rows-2 gap-8">
            {[
              { title: "Trial Day Checklist", desc: "How to structure your first paid trial.", icon: "assignment_turned_in", color: "text-secondary" },
              { title: "Home Safety Audit", desc: "Prepare your home for a new nanny.", icon: "home_health", color: "text-primary" }
            ].map((guide) => (
              <div key={guide.title} className="bg-surface-container-low p-8 rounded-[2rem] flex items-center gap-8 hover:translate-y-[-8px] hover:shadow-xl transition-all cursor-pointer group border border-transparent hover:border-primary/10">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-md grow-0 shrink-0 group-hover:bg-primary transition-colors">
                  <MaterialIcon name={guide.icon} className={cn("text-4xl transition-colors", guide.color, "group-hover:text-white")} />
                </div>
                <div>
                  <h4 className="font-headline font-black text-xl text-primary mb-1">{guide.title}</h4>
                  <p className="text-sm text-on-surface-variant font-medium opacity-70">{guide.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Caregiver Section (Asymmetric Layout) */}
      <section className="mb-24">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          <div className="w-full lg:w-1/2 order-2 lg:order-1 relative">
            <div className="relative group">
              <img 
                alt="Caregiver" 
                className="w-full h-[550px] object-cover rounded-[3rem] shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzrPFBjII1_C7QnWYb4cx_0j-NV5B82npaOx955_gEVtrGA1qnW7-S7701mTFg1rZJOo0dEnDmKBYXH8F0UTzNKM0EM_unPrYOAGlbGIgmDs5QEJT7sEQOpKfeGwRXowZSNdwDDRoQ7avgJIg8VEUNDZ3GbCH1PDImXtuxBDRA1rGiJ2OlY_Rb_lE2KfJgZvvtD7RBWLg1jm8TRMj-Ls8qQBSER4uY7z6JoIkMzsjZp_uSViM0P_QMwwI1NQySJUeWUhi1zkqggDM" 
              />
              <div className="absolute -bottom-8 -right-8 bg-secondary-fixed p-10 rounded-[2.5rem] shadow-2xl max-w-[240px] hidden md:block border-8 border-surface border-offset-4">
                <MaterialIcon name="lock_person" className="text-5xl text-on-secondary-fixed mb-4" />
                <p className="font-headline font-black text-on-secondary-fixed leading-tight text-lg">Your data is always encrypted.</p>
              </div>
              <div className="absolute top-10 left-[-20px] bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 active:scale-95 transition-all cursor-pointer border border-primary/10">
                <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                   <MaterialIcon name="verified" className="text-success text-xl" fill />
                </div>
                <span className="font-bold text-sm text-primary">Biometric ID Verified</span>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 order-1 lg:order-2 space-y-10">
            <div>
              <span className="text-secondary font-headline font-black uppercase tracking-[0.3em] text-[10px] bg-secondary/10 px-4 py-1.5 rounded-full mb-4 inline-block">Caregiver Hub</span>
              <h2 className="font-headline text-5xl font-black mt-2 tracking-tighter text-primary leading-tight">Safety at Work</h2>
            </div>
            
            <div className="space-y-4">
              {[
                { title: "Managing Communications", desc: "Boundaries and safe platform usage.", icon: "forum" },
                { title: "Travel Safety Protocols", desc: "Staying safe while commuting with children.", icon: "commute" },
                { title: "Emergency Response 101", desc: "What to do in a medical emergency.", icon: "emergency" }
              ].map((item) => (
                <div key={item.title} className="group cursor-pointer">
                  <div className="flex justify-between items-center py-8 border-b border-outline-variant/20 group-hover:border-primary transition-all px-4 hover:bg-surface-container-low rounded-xl">
                    <div className="flex items-center gap-6">
                      <MaterialIcon name={item.icon} className="text-2xl text-on-surface-variant group-hover:text-primary transition-colors" />
                      <div>
                        <h4 className="font-headline font-black text-2xl text-primary leading-tight">{item.title}</h4>
                        <p className="text-on-surface-variant font-medium mt-1 opacity-70">{item.desc}</p>
                      </div>
                    </div>
                    <MaterialIcon name="arrow_forward_ios" className="text-lg text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-2" />
                  </div>
                </div>
              ))}
            </div>
            
            <button className="bg-primary text-on-primary px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
              View All Caregiver Resources
            </button>
          </div>
        </div>
      </section>

      {/* Support CTA Section */}
      <section className="py-24 bg-surface-container-high rounded-[4rem] text-center px-6 border border-white relative overflow-hidden shadow-inner">
        <div className="max-w-xl mx-auto relative z-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
            <MaterialIcon name="support_agent" className="text-primary text-4xl" fill />
          </div>
          <h2 className="font-headline text-4xl font-black mb-6 text-primary tracking-tighter">Still have questions?</h2>
          <p className="text-on-surface-variant text-xl mb-12 opacity-80 leading-relaxed font-medium">Our Trust & Safety team is available 24/7 to help you navigate any situation or answer your questions about our vetting process.</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="bg-secondary-fixed text-on-secondary-fixed px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-secondary/40 transition-all active:scale-95">
              Contact Support
            </button>
            <button className="bg-white text-primary px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg hover:shadow-primary/10 transition-all border border-primary/10 active:scale-95">
              Visit Help Center
            </button>
          </div>
        </div>
        <MaterialIcon name="quiz" className="absolute -right-16 -top-16 text-[300px] opacity-5 -rotate-12" />
      </section>
    </div>
  );
}

import { cn } from "@/lib/utils";
