import { Metadata } from "next";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = {
  title: "Referral Program | Earn $500 Sharing the Love | KindredCare US",
  description: "Join the KindredCare Referral Program. Refer a friend to the most trusted childcare network and earn $500 when they complete their first booking. Help families find safe, professional care.",
  keywords: ["childcare referral", "earn $500 referring nannies", "KindredCare rewards", "nanny referral program", "best paying referral program"],
  openGraph: {
    title: "KindredCare Referral Program | Share the Love, Earn $500",
    description: "Refer a friend to KindredCare and you both win. Earn $500 rewards for helping build a safer childcare community.",
    type: "website",
    images: ["https://lh3.googleusercontent.com/aida-public/AB6AXuBYpG667RMTkJU8LnoHNmQegISxQuSHcNfgQ4F_dI8jVxVQI_0mePGZz19i9oLD3PZ6iTBH-mGh6lOK6clKMsMZ8QxtwH5QLc6c_El-EnwkPMCs1ia91-rEySh2bXjVMjpvqTYe-8foZ1B1DkZh9uENpxGny1DZuk9rITkhrgLhNihWnDZVmdTh5G6-62qAsde08FPJ8kol4-zkeux7QbScGIl8OXGOmf2N3GaiAKhE2-P5VWD6ZQEfB084rghk5a5d3EnOdyyWrpU"]
  }
};

export default function ReferralProgramPage() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased">
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "How to Earn $500 with KindredCare Referrals",
            "description": "Step-by-step guide to earning referral rewards on KindredCare.",
            "step": [
              {
                "@type": "HowToStep",
                "name": "Share your link",
                "text": "Invite friends through email, SMS, or social media using your unique dashboard link."
              },
              {
                "@type": "HowToStep",
                "name": "They join",
                "text": "Your friends complete our rigorous verification process and find their perfect caregiver."
              },
              {
                "@type": "HowToStep",
                "name": "You get paid",
                "text": "Receive your $500 reward directly to your account after their first successful booking is completed."
              }
            ]
          })
        }}
      />


      <main className="pt-24 overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative px-6 py-16 md:py-24 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 order-2 lg:order-1">
              <span className="inline-block py-1.5 px-4 rounded-full bg-secondary-fixed text-on-secondary-fixed text-[10px] font-black tracking-[0.2em] uppercase mb-6">
                Referral Program
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold font-headline text-primary tracking-tighter leading-[1.1] mb-6">
                Share the Love, <br /><span className="text-secondary italic">Earn Up to $500.</span>
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed max-w-xl mb-10 font-medium">
                Our "Kindred Catalyst" program rewards you for bringing quality to the community. Earn milestones as your friends find their perfect care match.
              </p>
...
        {/* Rewards Roadmap Section */}
        <section className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
             <div className="space-y-8">
                <h2 className="text-4xl font-black font-headline text-primary tracking-tighter italic">Your Roadmap to $500</h2>
                <div className="space-y-6">
                   <div className="flex gap-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-50">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black">1</div>
                      <div>
                         <p className="font-headline font-black text-primary italic">$25 — The Handshake</p>
                         <p className="text-sm text-on-surface-variant font-medium opacity-60">Earned as soon as your friend passes our 5-point verification check.</p>
                      </div>
                   </div>
                   <div className="flex gap-6 p-6 bg-primary text-white rounded-3xl shadow-xl">
                      <div className="w-12 h-12 rounded-2xl bg-secondary text-on-secondary-fixed flex items-center justify-center font-black">2</div>
                      <div>
                         <p className="font-headline font-black italic text-secondary-fixed">$75 — The First Connection</p>
                         <p className="text-sm opacity-60 font-medium">Earned after their first successful booking ($250+ value).</p>
                      </div>
                   </div>
                   <div className="flex gap-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-50">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black">3</div>
                      <div>
                         <p className="font-headline font-black text-primary italic">$150 — The Continuity Bonus</p>
                         <p className="text-sm text-on-surface-variant font-medium opacity-60">Earned when your friend completes their 5th job on the platform.</p>
                      </div>
                   </div>
                   <div className="flex gap-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-50">
                      <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black">4</div>
                      <div>
                         <p className="font-headline font-black text-primary italic">$250 — The Elite Headhunter</p>
                         <p className="text-sm text-on-surface-variant font-medium opacity-60">Bonus for referring caregivers who achieve Elite Certification status.</p>
                      </div>
                   </div>
                </div>
             </div>
             <div className="bg-slate-900 rounded-[3rem] p-12 text-white space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20"></div>
                <h3 className="text-3xl font-black font-headline italic">The "Friend Catch"</h3>
                <p className="text-lg opacity-60 font-medium leading-relaxed">
                   We make it easy for your friends to say "Yes". Every person you invite gets:
                </p>
                <div className="space-y-4">
                   <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><MaterialIcon name="check" className="text-xs text-on-secondary-fixed" fill /></div>
                      <p className="font-bold text-xl">$50 OFF their first booking</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><MaterialIcon name="check" className="text-xs text-on-secondary-fixed" fill /></div>
                      <p className="font-bold text-xl">Priority verification fast-track</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center"><MaterialIcon name="check" className="text-xs text-on-secondary-fixed" fill /></div>
                      <p className="font-bold text-xl">Elite Nanny network access</p>
                   </div>
                </div>
                <div className="pt-8 italic text-xs opacity-40">
                   * $50 discount applies to bookings over $200. Verification subject to safety check.
                </div>
             </div>
          </div>
        </section>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="bg-gradient-to-br from-primary to-primary-container text-white px-8 py-5 rounded-2xl font-headline font-black text-lg shadow-2xl shadow-primary/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  Get Started Now
                  <MaterialIcon name="arrow_forward" />
                </Link>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <img className="w-12 h-12 rounded-full border-4 border-surface" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi3E1QI4ecpCL3aNXasSH2ijIEVDEqF0pjPZUUia55DVrwp0NP1Rc0IqhDaV_hQhOVzk8Sc5e_4O6WEgm_9du_TEPvrb-EzOGgBr616AV9BfzJ3sae4BYcrMmSsH5vD2Ao1DLZXPgNzgpP_0jMRsv8_hCcUGkjgLsyMzJFdWExSKhtXKFCgTHcX4ZBBT5kA12VYacwPPzc2vbKqOZjqQiTHnslZgotIuivvtgmrIXA75CbQIl1RrdX5WqG_Y9ksu2npsk-SWl7N5c" />
                  <img className="w-12 h-12 rounded-full border-4 border-surface" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDMdxA825FxWz2DS_kkkq6BYjA3KuyetF9skseGvf2OEzxYxA0Z24ErNSI_frfWuFED4RINM0BaY3PKt1FJcl87g0q9C3x1Lfqbb8-qMtQmcuTuuN08pMBxnhR8rhbGAgIlAbOa1AITMhVGFvvsSwFbvRpvUEb5HUX40OIhdMr46NkzHcZE5eIW37JU5XPVmEwaAkKuxEgXuc8ncvapj9jZL26J19b4zKBa-dnpLEFapJjZhsR0KpYObDyEwoTEeDL8tzS4QhEQvc" />
                  <img className="w-12 h-12 rounded-full border-4 border-surface" alt="Portrait" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDA8fjZi51iDj4WmjuQT_0baJudvzHxsngfY_luzVRA9KK3HEo2puM7DwKMywROd3M_ndeNvev3wbDSEeAGJm5SAnqvWrVfLNy_eawFz4aFKQ1voqGY4rXriTTGUdSwqvcsQZ0IoTpn7YR7ahFpRL93V7sweEaDWbGMVfniPpP5zfJUA-G-UJqJVWMqDgy23ePs7BJtZqro78XqXuyavWOOW0012Gk3DQJC5Y0mUAcyxopNn48A_84IXLaIkxEMwhZSfqJUOcdi9_M" />
                </div>
                <p className="text-sm text-on-surface-variant font-medium">Joined by <span className="text-primary font-bold">2,400+</span> happy families this month</p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="relative aspect-square md:aspect-auto md:h-[600px] w-full">
                <img className="absolute inset-0 w-full h-full object-cover rounded-[3rem] shadow-2xl" alt="Professional Caregiver" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUa-64n74yIF-_q_gCLMp0Pdn-ziUbJX_MmIL1fPMaCyxBJqG9xnYh2_w4SSpImnZp94OE0rYrEcx5u_OnTSHB_pBTs8d6NjBUGQz3OGFIKPaUTXaFIYvehHfhMnOxzHFq8j35NGOpcISJSYJ2QlRAeugrLzo8EEzduwJv68bDSkRoIneTJgFZovs0R3GsXbTl7Ug12GpmMf0q6LwqinSDlPgwKROajo64zY5gKmwIAfbfrmpeRQK-hXgC0catHTxeWLxe2e1C_M8" />
                <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2rem] shadow-2xl max-w-[240px] hidden md:block border border-slate-100">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed shadow-inner">
                      <MaterialIcon name="payments" />
                    </div>
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest opacity-40 leading-none">Bonus Earned</p>
                      <p className="text-xl font-extrabold text-primary">$500.00</p>
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed italic">"Sharing my link with friends was the best decision I made for my community!"</p>
                </div>
                <div className="absolute top-12 -right-8 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 flex items-center gap-3 hidden md:flex active:scale-105 transition-transform duration-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.6)] animate-pulse"></div>
                  <span className="text-xs font-black text-primary uppercase tracking-widest">New Referral Joined!</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Rewards Section */}
        <section className="bg-primary py-24 mt-16 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-16 text-white">
              <div className="text-center md:text-left flex-1 space-y-4">
                <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest">Market Leading Rewards</span>
                <h2 className="font-headline text-4xl md:text-6xl font-black tracking-tight leading-none italic">The Best Way to Say Thanks.</h2>
                <p className="text-primary-fixed-dim text-lg font-medium opacity-80 decoration-accent-red underline decoration-4 underline-offset-8">We value the trust you place in us when you recommend KindredCare.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 items-center">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] text-center w-full sm:w-72 relative">
                  <p className="text-secondary-fixed text-[10px] font-black tracking-[0.2em] mb-4 uppercase">You Recieve</p>
                  <h3 className="text-white text-7xl font-black font-headline tracking-tighter leading-none">$500</h3>
                  <p className="text-primary-fixed-dim text-[10px] font-black uppercase tracking-widest mt-4 opacity-40 italic">Per successfull booking</p>
                </div>
                <div className="text-white text-4xl font-light opacity-50 hidden sm:block">
                  <MaterialIcon name="add" className="text-5xl" />
                </div>
                <div className="bg-white p-10 rounded-[2.5rem] text-center w-full sm:w-72 shadow-2xl shadow-black/40 border-4 border-secondary/20">
                  <p className="text-secondary text-[10px] font-black tracking-[0.2em] mb-4 uppercase">Friend Gets</p>
                  <h3 className="text-primary text-7xl font-black font-headline tracking-tighter leading-none">$50</h3>
                  <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest mt-4 opacity-40 italic">Off their first booking</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-5xl font-black font-headline text-primary tracking-tighter">Three Steps to Success</h2>
            <div className="w-16 h-2 bg-secondary mx-auto rounded-full shadow-lg"></div>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
            {/* Step 1 */}
            <div className="relative group">
              <div className="mb-10 aspect-square rounded-[3rem] overflow-hidden bg-surface-container-low transition-transform group-hover:-translate-y-2 duration-700 shadow-xl relative">
                <img className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Sharing link" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjCm5QkRyZZUY4YWNyqT7nEaJdJFknmJKdiBcDGIoEGJB1YlNeie1tm6oDt361W2HOS5ZxRuY8Earl5qWP6uDWd2yeM1MW4gNEL1ToKYTCpvuwwc52PdT7kiD5uXZFwcyTfnKm9Ss0r3JsVj8TVs71LiIS7D8FWwiRDmyuR6ESe75ToCU2j18FnqdyvEjU2t6aP-1UBHF3gYDQPI6eu5oeG_xgj5-thr99vGUETTOJmUznVn_ZcMJ14zo1Ii9_b8WdG2aYozSx0bI" />
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="w-24 h-24 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-700 delay-100">
                    <MaterialIcon name="send" className="text-5xl text-primary" />
                  </div>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-5xl font-black text-primary/10 font-headline italic">01</span>
                <div className="space-y-3 pt-2">
                  <h3 className="text-2xl font-black text-primary font-headline italic tracking-tight">Share your link</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed opacity-75">Invite friends through email, SMS, or social media using your unique dashboard link.</p>
                </div>
              </div>
            </div>
            {/* Step 2 */}
            <div className="relative group">
              <div className="mb-10 aspect-square rounded-[3rem] overflow-hidden bg-surface-container-low transition-transform group-hover:-translate-y-2 duration-700 shadow-xl relative">
                <img className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="People joining" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWWfFjUn3md1w0mbyxTmvKfe2gJWgSTD8IFkBnJimEinNF2MSse_HuMZuVloGNcaGd0G3PuP2Byi2_IpK5NlCw8-4MVcetylDIOq-_YDoQD6BtBP1VKs6MoI3vHrdOmt88K5w7_Icpu-YIDlTtrcH4lTyrgriGRdTmNr3QTeMX0HVChexRcoRlna2U8Cl1KfH7q5CViGqLyaAeCM---NtscTcOFucv4NgEji_u9_GVaejh76tnsGqRzv8VOaOyxagwZXufF02FP6M" />
                <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="w-24 h-24 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-700 delay-100">
                    <MaterialIcon name="verified_user" className="text-5xl text-secondary" />
                  </div>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-5xl font-black text-primary/10 font-headline italic">02</span>
                <div className="space-y-3 pt-2">
                  <h3 className="text-2xl font-black text-primary font-headline italic tracking-tight">They join</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed opacity-75">Your friends complete our rigorous verification process and find their perfect caregiver.</p>
                </div>
              </div>
            </div>
            {/* Step 3 */}
            <div className="relative group">
              <div className="mb-10 aspect-square rounded-[3rem] overflow-hidden bg-surface-container-low transition-transform group-hover:-translate-y-2 duration-700 shadow-xl relative">
                <img className="w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" alt="Payment" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8c0ewA0gNGIT743f_IdyjynLkxaORzMBpR-qNp3FnGTAUz4L_H08ciIxXCbLh-fjMvZAvi4Qf8QNcnb3FLoVKQmaa61QhqbJqZnaNz9PSauXgmQ55rHpAxPswhusi-nfgZrm8nSfP4Mn7nL27vGV4JMfYZ1ojvb5klebk1UeH6PM3zchJUloACa4KYCRZ7y2bRUyS3VKWD6Sv7UXiAVSJB85iWGUmcZCnJKDrvpprBavHU-DuMo_55mx2p6DGozO1KfwxLONMCp4" />
                <div className="absolute inset-0 bg-tertiary-fixed/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="w-24 h-24 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-700 delay-100">
                    <MaterialIcon name="savings" className="text-5xl text-tertiary" />
                  </div>
                </div>
              </div>
              <div className="flex gap-6">
                <span className="text-5xl font-black text-primary/10 font-headline italic">03</span>
                <div className="space-y-3 pt-2">
                  <h3 className="text-2xl font-black text-primary font-headline italic tracking-tight">You get paid</h3>
                  <p className="text-on-surface-variant font-medium leading-relaxed opacity-75">Receive your $500 reward directly after their first successful booking is admin-approved.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Assets Section */}
        <section className="bg-surface-container-low py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-16 items-center">
              <div className="lg:col-span-2 space-y-8">
                <h2 className="text-5xl font-black font-headline text-primary tracking-tighter italic">Effortless Sharing</h2>
                <p className="text-on-surface-variant text-lg leading-relaxed font-medium opacity-80">
                  We've designed professional invite cards and templates just for you. Simply download or share directly from your dashboard—no design skills required.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <MaterialIcon name="check_circle" className="text-secondary" fill />
                    <span className="font-bold text-primary font-headline">Instagram Stories Ready</span>
                  </div>
                  <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <MaterialIcon name="check_circle" className="text-secondary" fill />
                    <span className="font-bold text-primary font-headline">One-Tap WhatsApp Sharing</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-3">
                <div className="relative group">
                  <div className="bg-white p-3 rounded-[3.5rem] shadow-2xl -rotate-2 active:rotate-0 transition-transform duration-500 cursor-pointer">
                    <div className="bg-primary rounded-[3rem] overflow-hidden aspect-[16/9] relative">
                      <img className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-105 transition-transform duration-[2s]" alt="Family" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYpG667RMTkJU8LnoHNmQegISxQuSHcNfgQ4F_dI8jVxVQI_0mePGZz19i9oLD3PZ6iTBH-mGh6lOK6clKMsMZ8QxtwH5QLc6c_El-EnwkPMCs1ia91-rEySh2bXjVMjpvqTYe-8foZ1B1DkZh9uENpxGny1DZuk9rITkhrgLhNihWnDZVmdTh5G6-62qAsde08FPJ8kol4-zkeux7QbScGIl8OXGOmf2N3GaiAKhE2-P5VWD6ZQEfB084rghk5a5d3EnOdyyWrpU" />
                      <div className="absolute inset-0 p-12 flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="text-white font-headline text-2xl font-black italic tracking-tighter">KindredCare</div>
                          <div className="bg-secondary-fixed text-on-secondary-fixed px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">Exclusive Invitation</div>
                        </div>
                        <div className="max-w-md space-y-2">
                          <h3 className="text-white text-5xl font-black font-headline leading-none italic">Get $50 Off<br/>Your First Care</h3>
                          <p className="text-primary-fixed-dim text-lg font-medium">Join the network trusted by thousands of premium families.</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="bg-white text-primary px-8 py-3 rounded-xl font-black tracking-widest text-lg shadow-xl shadow-black/20">JOIN-KINDRED</div>
                          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest opacity-80 italic">Use code at checkout</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/10 rounded-full -z-10 blur-[80px]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-32 px-6 max-w-4xl mx-auto space-y-16">
          <div className="text-center">
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-on-surface-variant opacity-40 mb-4 italic">Transparency</h2>
            <h2 className="text-5xl font-black font-headline text-primary tracking-tighter leading-none italic">Common Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-50 transition-all hover:shadow-xl hover:border-slate-100 group">
              <h3 className="text-xl font-black text-primary font-headline mb-4 flex justify-between items-center italic">
                When will I receive my $500 payout?
                <MaterialIcon name="verified" className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-on-surface-variant leading-relaxed font-medium opacity-70">
                Referral rewards are released immediately following Admin approval of the referee's first completed job. This manual step ensures marketplace safety and prevents fraudulent self-referrals.
              </p>
            </div>
            <div className="p-10 bg-white rounded-[2.5rem] shadow-sm border border-slate-50">
              <h3 className="text-xl font-black text-primary font-headline mb-4 italic">Is there a limit to referrals?</h3>
              <p className="text-on-surface-variant leading-relaxed font-medium opacity-70">
                Absolutely not. We encourage community growth. There is zero cap on your potential earnings as long as your invitees are unique, verified users joining KindredCare for the first time.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 mb-32">
          <div className="max-w-7xl mx-auto bg-primary rounded-[4rem] p-12 md:p-32 text-center relative overflow-hidden shadow-[0_40px_100px_rgba(3,31,65,0.4)]">
             <div className="absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent"></div>
             <div className="relative z-10 max-w-2xl mx-auto space-y-12">
               <h2 className="text-white text-5xl md:text-8xl font-black font-headline mb-8 tracking-tighter leading-none italic">Ready to<br/>Invite?</h2>
               <p className="text-primary-fixed-dim text-2xl font-medium opacity-80 leading-relaxed">Join the thousands of families building the next generation of childcare.</p>
               <Link href="/signup" className="inline-block bg-secondary text-on-secondary-fixed px-12 py-7 rounded-[2rem] font-headline font-black text-2xl shadow-2xl shadow-black/40 hover:scale-105 active:scale-95 transition-all">
                Access Referral Dashboard
               </Link>
               <div className="flex flex-col items-center gap-2 pt-8">
                  <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce"></div>
                  <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">Direct Bank Payouts • No Hidden Fees</p>
               </div>
             </div>
          </div>
        </section>
      </main>

    </div>
  );
}
