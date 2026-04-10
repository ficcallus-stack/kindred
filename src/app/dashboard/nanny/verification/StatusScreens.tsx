"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatusScreenProps {
  user: any;
  verification?: any;
}

// SUCCESS STATE
export function SuccessState({ user }: StatusScreenProps) {
  const firstName = user?.fullName?.split(" ")[0] || "Caregiver";

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-20">
      {/* Hero Section */}
      <section className="relative mb-24 mt-4 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 text-center md:text-left z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 bg-tertiary-fixed text-on-tertiary-fixed rounded-full mb-8 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-tertiary/10 border border-tertiary/20">
            <MaterialIcon name="verified" className="text-sm" fill />
            Verified Professional
          </div>
          <h1 className="font-headline text-5xl md:text-8xl font-black text-primary mb-8 tracking-tighter leading-[0.9] italic">
            Congratulations, <br/><span className="text-secondary italic">{firstName}!</span>
          </h1>
          <p className="text-on-surface-variant text-lg md:text-xl max-w-xl leading-relaxed mb-12 font-medium italic opacity-70">
            Your profile is now 100% verified. You've joined the top tier of caregivers, unlocking priority placement in family searches and <span className="text-primary font-black underline decoration-secondary decoration-4">5x more job invites.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
            <Link 
              href="/dashboard/nanny/open-roles"
              className="bg-primary text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95 flex items-center gap-3"
            >
              Apply for Jobs <MaterialIcon name="arrow_forward" />
            </Link>
            <Link 
              href={`/nannies/${user?.id}`}
              className="bg-white text-primary border border-slate-100 px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] transition-all hover:bg-slate-50 active:scale-95 shadow-lg"
            >
              View Public Profile
            </Link>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <div className="rounded-[4rem] overflow-hidden shadow-2xl shadow-primary/20 rotate-3 border-8 border-white group">
            <img 
              alt="Professional success" 
              className="w-full h-[500px] object-cover transition-transform duration-1000 group-hover:scale-110" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD-hpjb8W4im2eMtDZbz4fb75jfGqqJZhNks6d0ZJLLtPC_V7zvSw93BcHo79tjyYv8AhFnRukEGWq8y-N9BPKkYvXYjDbgX7hIrWio0w44XXcj-G6PQnhTAi08-Z07TvU_IJ4Dv-IOIQmz13jhM2XPtIJtnM5p85ElBPcgX-65BJKapVibIegq94oIBl-kJtHgS_yZ_KyQHznJ-Z5RbT9CMnhj2KhYbj7jCdoJhOhOM4s-95sHDJbuk2C8rq5JZIHKAXstpD-7JA" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
          </div>
          <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-50 hidden lg:flex items-center gap-5 z-20">
            <div className="bg-secondary-fixed p-4 rounded-2xl shadow-lg">
              <MaterialIcon name="celebration" className="text-secondary text-2xl" fill />
            </div>
            <div>
              <p className="font-black text-primary italic tracking-tight">Top 1% Badge</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active on your profile now</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid: Elite Benefits */}
      <section className="mb-32">
        <div className="mb-16">
          <h2 className="font-headline text-4xl font-black text-primary italic tracking-tight mb-2">Your Elite Benefits</h2>
          <p className="text-slate-500 font-medium italic opacity-60">The premium tools designed for your professional growth.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Priority Search Ranking */}
          <div className="md:col-span-2 bg-slate-50 rounded-[3.5rem] p-12 relative overflow-hidden flex flex-col justify-between border border-slate-100 group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-primary-container text-white flex items-center justify-center rounded-2xl mb-10 shadow-xl shadow-primary/10 transition-transform group-hover:scale-110">
                <MaterialIcon name="trending_up" className="text-3xl" fill />
              </div>
              <h3 className="font-headline text-3xl font-black text-primary mb-6 italic tracking-tight leading-none">Priority Search Ranking</h3>
              <p className="text-on-surface-variant text-lg max-w-md mb-10 font-medium italic opacity-70 leading-relaxed">
                Families will see your profile first in their search results. Verified caregivers receive <span className="text-primary font-black underline decoration-secondary">85% more profile views</span> on average.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-3 rounded-2xl w-fit shadow-sm border border-white">
              <MaterialIcon name="visibility" className="text-primary text-sm" />
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Recently viewed by 12 families</span>
            </div>
            <MaterialIcon name="search" className="absolute -right-16 -bottom-16 text-[18rem] text-primary/5 -rotate-12 transition-transform duration-1000 group-hover:scale-125" />
          </div>

          {/* 5x Invite Boost */}
          <div className="bg-secondary-container rounded-[3.5rem] p-12 text-on-secondary-container flex flex-col justify-between shadow-2xl shadow-secondary/5 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 flex items-center justify-center rounded-2xl mb-10 backdrop-blur-md transition-transform group-hover:rotate-12">
                <MaterialIcon name="bolt" className="text-3xl" fill />
              </div>
              <h3 className="font-headline text-3xl font-black mb-6 italic tracking-tight leading-none">5x Invite Boost</h3>
              <p className="text-on-secondary-container/80 text-sm font-medium italic leading-relaxed">
                Our elite matching engine now prioritizes your availability for high-end recurring roles in your area.
              </p>
            </div>
            <div className="mt-12 text-5xl font-headline font-black italic tracking-tighter opacity-10 uppercase transition-opacity group-hover:opacity-20">INVITES x5</div>
          </div>

          {/* Higher Rates */}
          <div className="bg-tertiary-fixed rounded-[3.5rem] p-12 flex flex-col justify-between border border-tertiary/10 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-16 h-16 bg-tertiary-container text-tertiary-fixed flex items-center justify-center rounded-2xl mb-10 shadow-xl shadow-tertiary/10 transition-transform group-hover:rotate-45">
                <MaterialIcon name="payments" className="text-3xl" fill />
              </div>
              <h3 className="font-headline text-3xl font-black text-tertiary mb-6 italic tracking-tight leading-none">Higher Rates</h3>
              <p className="text-on-tertiary-fixed-variant text-sm font-medium italic leading-relaxed opacity-80 mb-10">
                Elite verified caregivers earn an average of <strong>$25/hr</strong>—significantly above market standards.
              </p>
            </div>
            <div className="inline-flex items-center px-5 py-2.5 bg-white/40 rounded-full w-fit shadow-sm border border-white">
              <span className="text-[9px] font-black text-on-tertiary-fixed uppercase tracking-widest italic">+42% Income Potential</span>
            </div>
          </div>

          {/* Elite Safety Badge */}
          <div className="md:col-span-2 bg-primary-container text-on-primary rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center gap-12 overflow-hidden relative group shadow-2xl shadow-primary/20">
            <div className="flex-1 relative z-10">
              <div className="w-16 h-16 bg-primary text-on-primary flex items-center justify-center rounded-2xl mb-10 shadow-xl shadow-black/10">
                <MaterialIcon name="shield" className="text-3xl" fill />
              </div>
              <h3 className="font-headline text-3xl font-black mb-6 text-white italic tracking-tight leading-none">Elite Safety Badge</h3>
              <p className="text-on-primary-container font-medium italic leading-relaxed opacity-70">
                Your dossier now displays the "Elite Security Verified" seal, providing ultimate peace of mind to parents and distinguishing you as a trusted professional.
              </p>
            </div>
            <div className="flex-1 flex justify-center z-10 relative">
              <div className="w-56 h-56 rounded-full border-4 border-dashed border-primary/20 flex items-center justify-center p-8 animate-[spin_20s_linear_infinite]">
                 <MaterialIcon name="verified_user" className="text-white text-[120px] opacity-[0.05] grayscale absolute" fill />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl transform rotate-12 transition-transform duration-700 group-hover:rotate-0">
                  <MaterialIcon name="verified" className="text-primary text-6xl" fill />
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#30476a_0%,transparent_70%)]"></div>
          </div>
        </div>
      </section>

      {/* Referral Section */}
      <section className="bg-white rounded-[4rem] p-16 flex flex-col md:flex-row items-center gap-16 shadow-2xl shadow-black/[0.02] border border-slate-50 relative overflow-hidden group">
        <div className="flex-1 relative z-10">
          <h2 className="font-headline text-4xl font-black text-primary mb-6 italic tracking-tight leading-none">Invite Your Friends</h2>
          <p className="text-on-surface-variant text-lg mb-10 leading-relaxed font-medium italic opacity-70">
            Know another amazing caregiver? Refer them to Kindred and you both <span className="text-primary font-black underline decoration-secondary decoration-4">earn $50</span> when they complete their first booking.
          </p>
          <Link 
            href="/dashboard/nanny/referrals"
            className="inline-flex items-center gap-4 bg-secondary-fixed text-on-secondary-fixed px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:brightness-95 transition-all active:scale-95 shadow-xl shadow-secondary/10"
          >
            Refer a Friend <MaterialIcon name="person_add" />
          </Link>
        </div>
        <div className="flex-1 w-full relative z-10">
          <div className="grid grid-cols-2 gap-6">
            <img 
              alt="Community" 
              className="w-full h-48 object-cover rounded-[2rem] shadow-xl border-4 border-white grayscale group-hover:grayscale-0 transition-all duration-1000" 
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=800" 
            />
            <img 
              alt="Success" 
              className="w-full h-48 object-cover rounded-[2rem] shadow-xl border-4 border-white transform translate-y-8 grayscale group-hover:grayscale-0 transition-all duration-1000 delay-300" 
              src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800" 
            />
          </div>
        </div>
        <MaterialIcon name="loyalty" className="absolute -top-10 -right-10 text-[15rem] text-primary/[0.02] -rotate-12" fill />
      </section>
    </div>
  );
}

// PENDING STATE
export function PendingState({ user }: StatusScreenProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-16 items-center mb-32">
        <div className="lg:col-span-7 space-y-10">
          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-tertiary-fixed rounded-full text-on-tertiary-fixed font-headline text-[10px] font-black tracking-widest uppercase shadow-xl shadow-tertiary/10">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-on-tertiary-fixed opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-on-tertiary-fixed"></span>
            </span>
            Review Process Active
          </div>
          <h1 className="text-5xl lg:text-7xl font-headline font-black text-primary leading-tight tracking-tighter italic">
            We're reviewing <br/><span className="text-secondary italic">your dossier.</span>
          </h1>
          <p className="text-lg text-on-surface-variant font-medium leading-relaxed max-w-xl italic opacity-80">
            Thank you for submitting your documentation! Our safety team is currently verifying your background screening and identification assets to ensure the highest standards of care.
            <span className="block mt-6 font-black text-primary uppercase text-[10px] tracking-widest italic leading-none opacity-40">Timeline Expectation</span>
            <span className="block mt-2 font-black text-primary text-2xl italic tracking-tight">Vetting usually takes less than 24 hours.</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
            <div className="bg-surface-container-low p-8 rounded-[2.5rem] border-l-[6px] border-tertiary shadow-xl shadow-black/[0.02]">
              <MaterialIcon name="verified" className="text-tertiary text-3xl mb-4" />
              <h3 className="font-headline font-black text-primary mb-2 italic tracking-tight">Safety Protocol</h3>
              <p className="text-xs text-on-surface-variant font-medium italic opacity-60">Multi-point verification to maintain unconditional trust.</p>
            </div>
            <div className="bg-surface-container-low p-8 rounded-[2.5rem] border-l-[6px] border-secondary shadow-xl shadow-black/[0.02]">
              <MaterialIcon name="bolt" className="text-secondary text-3xl mb-4" />
              <h3 className="font-headline font-black text-primary mb-2 italic tracking-tight">Expedited Queue</h3>
              <p className="text-xs text-on-surface-variant font-medium italic opacity-60">You'll be notified immediately upon approval via SMS and App.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative z-10 shadow-2xl rounded-[4rem] overflow-hidden bg-white p-3 rotate-3">
            <div className="relative aspect-square overflow-hidden rounded-[3.5rem]">
              <img 
                alt="Caregiver Team" 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 transition-all duration-1000" 
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&q=80&w=800" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8 bg-white/95 backdrop-blur-xl p-6 rounded-[2rem] flex items-center gap-5 shadow-2xl">
                <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/20">
                  <MaterialIcon name="workspace_premium" className="text-white text-2xl" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-1 italic opacity-40 leading-none">Status Track</p>
                  <p className="text-sm font-black text-primary italic tracking-tight">Vetting Stage: Active</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-16 -right-16 w-80 h-80 bg-secondary-fixed opacity-10 rounded-full blur-[100px] -z-10 animate-pulse" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-tertiary-fixed opacity-30 rounded-full blur-[100px] -z-10" />
        </div>
      </div>

      {/* Bento Grid: Why Verification Matters */}
      <section className="space-y-12 pb-24 border-t border-outline-variant/10 pt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-4xl font-headline font-black text-primary italic tracking-tighter">Why Verification Matters</h2>
            <p className="text-on-surface-variant font-medium italic opacity-60 mt-2">Joining our elite ecosystem of trusted caregivers.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-primary/5 flex flex-col md:flex-row gap-12 items-center border border-outline-variant/10 group">
            <div className="flex-1 space-y-6">
              <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center">
                <MaterialIcon name="trending_up" className="text-primary text-3xl" fill />
              </div>
              <h3 className="text-3xl font-headline font-black text-primary italic tracking-tight leading-none">Premium Earnings</h3>
              <p className="text-on-surface-variant font-medium italic leading-relaxed opacity-70">
                Verified professionals earn up to 40% more. Families prioritize safe vetting and pay a luxury premium for peace of mind.
              </p>
            </div>
            <div className="w-full md:w-1/3 aspect-square bg-surface-container-low rounded-[2.5rem] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-1000">
              <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" alt="Success" className="w-full h-full object-cover" />
            </div>
          </div>
          <div className="bg-primary p-12 rounded-[3.5rem] text-white flex flex-col justify-between shadow-2xl shadow-primary/20 relative overflow-hidden group">
            <MaterialIcon name="star" className="text-5xl text-secondary group-hover:rotate-45 transition-transform duration-700" fill />
            <div className="mt-12 relative z-10">
              <h3 className="text-2xl font-headline font-black italic tracking-tight mb-4">Priority Ranking</h3>
              <p className="text-blue-100/40 text-sm font-medium italic leading-relaxed">
                Your profile will automatically surface at the top of family searches after approval.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// REJECTED STATE
export function RejectedState({ user, verification }: StatusScreenProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 py-12">
      <header className="mb-20">
        <span className="inline-flex items-center gap-3 px-5 py-2.5 bg-error-container text-on-error-container text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-8 shadow-xl shadow-error/10 italic leading-none">
          <MaterialIcon name="error" className="text-sm" fill />
          Dossier Action Required
        </span>
        <h1 className="text-5xl md:text-7xl font-headline font-black text-primary leading-tight tracking-tighter mb-8 italic">
          We couldn't verify <br/><span className="text-error italic">your profile yet.</span>
        </h1>
        <p className="text-xl text-on-surface-variant max-w-3xl leading-relaxed font-medium italic opacity-80">
          Our team carefully reviews every application to maintain elite standards. This is often just a matter of a blurry asset or an expired credential.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-24">
        <div className="lg:col-span-7 bg-white p-12 md:p-16 rounded-[4rem] shadow-2xl shadow-error/5 border border-error/5 group">
          <h2 className="text-2xl font-headline font-black text-primary mb-12 flex items-center gap-5 italic tracking-tight">
            <div className="w-12 h-12 rounded-[1.5rem] bg-error/5 text-error flex items-center justify-center">
              <MaterialIcon name="assignment_late" className="text-2xl" />
            </div>
            Review Feedback
          </h2>
          <div className="space-y-10">
            <div className="flex gap-6 items-start">
              <MaterialIcon name="cancel" fill className="text-error mt-1" />
              <div>
                <h3 className="font-black text-primary uppercase text-[10px] tracking-widest italic mb-2">Identity Documentation</h3>
                <p className="text-on-surface-variant text-sm font-medium italic leading-relaxed opacity-70">
                  {verification?.adminNotes || "We encountered an issue with your identity assets. Typically this is due to motion blur on the ID scan or the 5-second live video selfie not clearly showing your face."}
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start opacity-70">
              <MaterialIcon name="info" className="text-amber-500 mt-1" />
              <div>
                <h3 className="font-black text-primary uppercase text-[10px] tracking-widest italic mb-2">Next Steps Protocol</h3>
                <p className="text-on-surface-variant text-sm font-medium italic leading-relaxed opacity-70">
                  Please capture clear, well-lit photos of your official documentation and ensure your video selfie is well-lit without hats or sunglasses, then resubmit for priority vetting.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-16 flex flex-wrap gap-5">
            <Link href="/dashboard/nanny/verification" className="px-10 py-5 bg-gradient-to-br from-primary to-primary-container text-white font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 italic">
              Fix and Resubmit
              <MaterialIcon name="refresh" />
            </Link>
            <Link href="/dashboard/messages?tab=support" className="px-10 py-5 bg-surface-container-low text-primary font-black uppercase tracking-widest text-[10px] rounded-[1.5rem] hover:bg-surface-dim transition-all italic active:scale-95 shadow-sm">
              Speak with Concierge
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-10">
          <div className="bg-primary text-white p-12 rounded-[3.5rem] relative overflow-hidden shadow-2xl shadow-primary/20 group">
            <div className="relative z-10">
              <h3 className="text-2xl font-headline font-black italic tracking-tight mb-8">Vetting Accuracy Tips</h3>
              <ul className="space-y-6 text-blue-100/60 text-xs font-medium italic">
                <li className="flex items-center gap-4 group-hover:translate-x-2 transition-transform">
                  <MaterialIcon name="light_mode" className="text-secondary text-lg" />
                  Use natural daylight for all photos
                </li>
                <li className="flex items-center gap-4 group-hover:translate-x-2 transition-transform duration-300">
                  <MaterialIcon name="crop_free" className="text-secondary text-lg" />
                  Align document edges within the frame
                </li>
                <li className="flex items-center gap-4 group-hover:translate-x-2 transition-transform duration-500">
                  <MaterialIcon name="check_circle" className="text-secondary text-lg" />
                  Ensure strict focus on document text
                </li>
              </ul>
            </div>
            <MaterialIcon name="lightbulb" className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 group-hover:rotate-12 transition-transform duration-1000" fill />
          </div>

          <div className="relative h-72 rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white p-2">
            <img 
                src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover rounded-[3rem] opacity-80" 
                alt="Support" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
          </div>
        </div>
      </div>

      <section className="bg-surface-container-low p-12 rounded-[3.5rem] border border-outline-variant/10 group shadow-xl shadow-black/[0.02]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl">
            <h2 className="text-3xl font-headline font-black text-primary mb-4 italic tracking-tight">Need assistance?</h2>
            <p className="text-on-surface-variant text-sm font-medium italic opacity-60 leading-relaxed">
              If you're having technical trouble or believe our vetting was in error, our elite Concierge team is here to guide you personally.
            </p>
          </div>
          <div className="flex gap-6 items-center">
            <div className="flex -space-x-4">
                {[4,5].map(i => (
                    <div key={i} className="w-14 h-14 rounded-full border-4 border-white shadow-2xl overflow-hidden group-hover:scale-110 transition-transform">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=agent${i}`} alt="Agent" className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
            <Link href="/dashboard/messages?tab=support" className="text-primary font-black uppercase tracking-widest text-[10px] italic underline decoration-secondary decoration-4 underline-offset-8 hover:text-secondary transition-colors">
              Dispatch Concierge Chat
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
