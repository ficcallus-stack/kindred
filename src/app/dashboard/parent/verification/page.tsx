"use client";

import { useEffect, useState, useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { getParentVerificationData, requestHomeSafetyAssessment } from "./actions";
import { useToast } from "@/components/Toast";

export default function VerificationPage() {
  const { showToast } = useToast();
  const [data, setData] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getParentVerificationData().then(setData);
  }, []);

  const handleRequestAssessment = () => {
    startTransition(async () => {
      const res = await requestHomeSafetyAssessment();
      if (res.success) {
        showToast("Assessment request submitted!", "success");
        getParentVerificationData().then(setData);
      }
    });
  };

  const steps = [
    {
      id: "identity",
      title: "Government Identity",
      status: data?.identityVerified ? "Verified" : "Pending",
      description: "Official ID and live photo comparison performed via Stripe Identity technology.",
      icon: "badge",
      bg: "bg-tertiary-fixed",
      text: "text-on-tertiary-fixed",
      cols: "md:col-span-3"
    },
    {
       id: "safety",
       title: "Home Safety Assessment",
       status: data?.homeSafetyStatus === "pending" ? "Requested" : data?.homeSafetyStatus === "verified" ? "Cleared" : "Not Started",
       description: "A comprehensive on-site or virtual review of your home environment security.",
       icon: "home_health",
       bg: "bg-primary-fixed",
       text: "text-on-primary-fixed",
       cols: "md:col-span-3",
       action: data?.homeSafetyStatus === "none" ? "Schedule Visit" : undefined,
       onAction: handleRequestAssessment
     },
     {
       id: "crypto",
       title: "Data Protection",
       status: "Active",
       description: "Your verification data is protected by industry-standard AES-256 encryption protocols.",
       icon: "lock",
       bg: "bg-primary-container",
       text: "text-on-primary-container",
       cols: "md:col-span-2",
       isDark: true
     },
     {
       id: "priority",
       title: "Priority Placement",
       status: data?.identityVerified && data?.homeSafetyStatus === "verified" ? "Active" : "Locked",
       description: "Verification unlocks placement in the top search tier for elite caregivers.",
       icon: "stars",
       bg: "bg-secondary-fixed",
       text: "text-on-secondary-fixed",
       cols: "md:col-span-4"
     }
  ];

  if (!data) return (
    <div className="p-12 space-y-8 animate-pulse">
      <div className="h-96 bg-slate-100 rounded-[3rem]"></div>
      <div className="grid md:grid-cols-6 gap-8">
        <div className="md:col-span-3 h-64 bg-slate-100 rounded-[3rem]"></div>
        <div className="md:col-span-3 h-64 bg-slate-100 rounded-[3rem]"></div>
      </div>
    </div>
  );

  const trustRating = data?.identityVerified && data?.homeSafetyStatus === "verified" ? 98 : data?.identityVerified ? 65 : 15;

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700 max-w-6xl mx-auto space-y-12 pb-24">
      
      {/* Hero Section */}
      <header className="relative overflow-hidden rounded-[3rem] bg-surface-container-low border border-outline-variant/10 p-12 md:p-16 text-primary shadow-2xl shadow-primary/5 group">
        <div className="relative z-10 max-w-2xl space-y-8">
          <span className="inline-block px-4 py-1.5 bg-tertiary-fixed text-on-tertiary-fixed rounded-full text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
            Trust Score: {trustRating > 80 ? 'Excellent' : trustRating > 50 ? 'Developing' : 'Identity Required'}
          </span>
          <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter leading-[1.1] italic">
            Verified <br /> Family Hub
          </h1>
          <p className="text-xl text-on-surface-variant leading-relaxed opacity-70 italic font-medium">
            Your verification status is the cornerstone of trust in our community. Complete all steps to unlock priority placement and higher quality nanny matches.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            {!data.identityVerified && (
              <button className="bg-primary text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all">
                Update Identity
              </button>
            )}
            {data.homeSafetyStatus === "pending" && (
              <div className="flex items-center gap-4 px-2">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                <span className="text-on-surface-variant font-black uppercase tracking-widest text-[10px] opacity-40">Safety Review pending...</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Floating Achievement Card */}
        <div className="absolute top-12 right-12 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl flex items-center gap-6 z-20 max-w-xs border border-white/50 animate-bounce-slow">
          <div className="w-16 h-16 rounded-2xl bg-secondary-fixed flex items-center justify-center shadow-inner">
            <MaterialIcon name="verified" className="text-on-secondary-fixed text-3xl" fill />
          </div>
          <div className="min-w-0">
            <p className="font-black text-primary leading-tight text-lg tracking-tight truncate">{trustRating}% Trust Rating</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Platform Safety Calibration</p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-tertiary-fixed/20 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
      </header>

      {/* Verification Bento Grid */}
      <section className="space-y-10">
        <div className="grid md:grid-cols-6 gap-8">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={cn(
                step.cols,
                "bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group overflow-hidden relative flex flex-col justify-between min-h-[320px]",
                step.isDark && "bg-gradient-to-br from-primary to-primary-container text-white"
              )}
            >
              <div>
                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform", step.bg)}>
                  <MaterialIcon name={step.icon} className={cn("text-3xl", step.text, step.isDark && "text-white")} fill />
                </div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <h3 className={cn("text-2xl font-black tracking-tight", step.isDark ? "text-white" : "text-primary")}>{step.title}</h3>
                  <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full", step.status === "Verified" || step.status === "Cleared" ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary", step.isDark && "bg-white/20 text-white")}>
                    {step.status}
                  </span>
                </div>
                <p className={cn("leading-relaxed opacity-70 font-medium italic", step.isDark ? "text-on-primary-container" : "text-on-surface-variant")}>
                  {step.description}
                </p>
              </div>
              
              {step.action && (
                <button 
                  disabled={isPending}
                  onClick={(step as any).onAction}
                  className="mt-8 w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50"
                >
                  {isPending ? "Requesting..." : step.action}
                </button>
              )}
            </div>
          ))}

          {/* Social Scan & References Row */}
          <div className="md:col-span-6 bg-surface-container-lowest p-12 rounded-[3.5rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-16 overflow-hidden relative group hover:shadow-2xl transition-all border border-outline-variant/5">
            <div className="absolute top-0 right-0 w-80 h-80 bg-tertiary-fixed/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="max-w-2xl relative z-10 space-y-8">
              <h3 className="text-3xl font-black text-primary tracking-tight italic">Trust Architecture Insights</h3>
              <p className="text-xl text-on-surface-variant leading-relaxed opacity-70 italic font-medium">Your verification data is encrypted and only shared with prospective nannies once an interview is scheduled. We prioritize your privacy as much as your safety.</p>
              <div className="flex flex-wrap gap-4">
                {["AES-256 Encryption", "Identity Resolution", "On-site Audits"].map(tag => (
                  <div key={tag} className="flex items-center gap-3 bg-surface px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest text-primary shadow-sm border border-outline-variant/10">
                    <MaterialIcon name="lock" className="text-primary text-lg" fill />
                    {tag}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full md:w-auto shrink-0 relative z-10 group-hover:scale-110 transition-transform duration-700">
              <MaterialIcon 
                name="shield_with_heart" 
                className="text-primary/5 group-hover:text-emerald-500 transition-colors" 
                style={{ fontSize: "160px" }} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Support Module */}
      <section className="bg-primary rounded-[3rem] p-12 md:p-16 text-white text-center shadow-2xl shadow-primary/30 relative overflow-hidden group">
        <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter italic">Need Help with Verification?</h2>
          <p className="text-xl opacity-80 leading-relaxed italic font-medium">Our care specialists are available 24/7 to assist you with the onboarding and trust calibration process.</p>
          <button className="bg-white text-primary px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:-translate-y-1 transition-all active:scale-95">
            Contact Support
          </button>
        </div>
        {/* Background Glints */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-[80px]"></div>
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-[100px]"></div>
      </section>
    </div>
  );
}
