"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { submitApplication } from "@/app/jobs/[id]/apply/actions";

const STEPS = [
  { id: 1, label: "Personal Intro", icon: "person_edit" },
  { id: 2, label: "Skills & Care", icon: "star" },
  { id: 3, label: "Schedule", icon: "calendar_month" },
  { id: 4, label: "Review", icon: "task_alt" },
];

const SKILLS = [
  { id: 1, label: "Montessori Certified", checked: false },
  { id: 2, label: "CPR & First Aid", checked: true },
  { id: 3, label: "Infant Care Experience", checked: true },
  { id: 4, label: "Early Childhood Education", checked: false },
];

const SCHEDULE = [
  { day: "Mon", hours: "8-2" },
  { day: "Tue", hours: "8-2" },
  { day: "Wed", hours: "8-2" },
  { day: "Thu", hours: "8-2" },
  { day: "Fri", hours: "8-2" },
];

export default function JobApplicationForm({ job }: { job: any }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await submitApplication({ jobId: job.id, message });
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  return (
    <main className="pt-24 max-w-7xl mx-auto flex flex-col md:flex-row gap-8 px-6 pb-12">
      {/* Side Progress Navigation */}
      <aside className="h-fit sticky top-24 hidden md:flex flex-col gap-2 p-6 bg-surface-container-low/50 backdrop-blur-md rounded-[2rem] border border-outline-variant/5 w-72">
        <div className="mb-8 px-2">
          <h2 className="text-xl font-black text-primary font-headline tracking-tighter">Nanny Application</h2>
          <p className="text-on-surface-variant text-[10px] uppercase font-black tracking-widest mt-2 opacity-50">Step {currentStep} of 4</p>
        </div>
        <nav className="flex flex-col gap-2">
          {STEPS.map(step => (
            <div 
              key={step.id} 
              className={cn(
                "flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group hover:translate-x-1",
                currentStep === step.id 
                  ? "bg-white text-primary shadow-sm font-black" 
                  : "text-slate-400 font-bold hover:text-primary"
              )}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", currentStep === step.id ? "bg-primary text-white scale-110 shadow-lg" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary")}>
                <MaterialIcon name={step.icon} fill={currentStep === step.id} />
              </div>
              <span className="text-sm tracking-tight">{step.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <section className="flex-grow space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
        
        {/* Job Summary Card */}
        <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-sm overflow-hidden flex flex-col sm:flex-row relative group hover:shadow-2xl transition-shadow border border-outline-variant/5">
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-2 block">Opportunity</span>
                <h1 className="text-4xl font-black font-headline text-primary tracking-tighter leading-none">{job.title}</h1>
                <p className="text-on-surface-variant flex items-center gap-2 text-sm font-black uppercase tracking-widest opacity-40 mt-3 italic">
                  <MaterialIcon name="family_restroom" className="text-secondary" />
                  {job.familyName}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-primary italic tracking-tighter">{job.budget}</div>
                <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">per hour</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Layers */}
        <div className="space-y-8">
          
          {/* Step 1: Personal Intro */}
          <div className="bg-surface-container-low rounded-[3rem] p-10 md:p-12 shadow-inner border border-white/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full group-hover:w-48 transition-all"></div>
            <h2 className="text-3xl font-black font-headline text-primary mb-8 tracking-tighter italic">Personal Introduction</h2>
            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50 px-4">Why are you a great fit for our family?</label>
              <textarea 
                className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-[2rem] p-8 text-lg font-medium shadow-sm transition-all focus:shadow-xl outline-none placeholder:text-slate-300 min-h-[250px] leading-relaxed italic"
                placeholder="Share your story, your philosophy on childcare, and what drew you to our family specifically..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          {/* Step 2: Experience Highlights */}
          <div className="bg-surface-container-low rounded-[3rem] p-10 md:p-12 shadow-inner border border-white/50 relative overflow-hidden group">
            <h2 className="text-3xl font-black font-headline text-primary mb-2 tracking-tighter italic">Experience Highlights</h2>
            <p className="text-on-surface-variant text-sm font-medium opacity-60 mb-10 italic">Select the skills that match the family's requirements.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SKILLS.map(skill => (
                <div key={skill.id} className="flex items-center gap-4 bg-white p-6 rounded-[2rem] border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group/skill shadow-sm hover:shadow-xl">
                  <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all", skill.checked ? "bg-primary border-primary" : "border-slate-200 group-hover/skill:border-primary")}>
                    {skill.checked && <MaterialIcon name="check" className="text-white text-sm" />}
                  </div>
                  <span className="font-black text-slate-900 tracking-tight">{skill.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Schedule Confirmation */}
          <div className="bg-surface-container-low rounded-[3rem] p-10 md:p-12 shadow-inner border border-white/50 relative overflow-hidden group">
            <div className="flex justify-between items-baseline mb-10 px-2">
              <h2 className="text-3xl font-black font-headline text-primary tracking-tighter italic">Schedule Confirmation</h2>
              <div className="px-5 py-2 bg-secondary/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-full">Confirmed / Verified</div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {SCHEDULE.map(item => (
                <div key={item.day} className="flex flex-col items-center bg-primary-container p-6 rounded-[2rem] text-on-primary-container shadow-2xl shadow-primary/20 hover:scale-105 transition-transform group/day">
                  <span className="text-[10px] uppercase font-black tracking-[0.2em] opacity-40 mb-2">{item.day}</span>
                  <span className="text-2xl font-black italic tracking-tighter group-hover/day:scale-110 transition-transform">{item.hours}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-outline-variant/5">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={cn(
                "flex-grow py-6 bg-gradient-to-br from-primary to-primary-container text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-[0_20px_40px_-10px_rgba(3,31,65,0.4)] hover:-translate-y-1 hover:shadow-[0_30px_60px_-15px_rgba(3,31,65,0.5)] transition-all flex items-center justify-center gap-4 group",
                isSubmitting && "opacity-50 cursor-not-allowed"
              )}
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
              {!isSubmitting && <MaterialIcon name="rocket_launch" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
            </button>
          </div>
        </div>
      </section>

      {/* Sidebar Tips */}
      <aside className="md:w-80 space-y-10">
        <div className="bg-surface-container-low p-10 rounded-[3rem] shadow-sm border border-outline-variant/10 group hover:shadow-2xl transition-all">
          <div className="w-16 h-16 bg-secondary-fixed rounded-2xl flex items-center justify-center mb-8 shadow-inner group-hover:rotate-12 transition-transform">
            <MaterialIcon name="lightbulb" className="text-on-secondary-fixed text-2xl" />
          </div>
          <h3 className="text-2xl font-black font-headline text-primary mb-8 tracking-tighter">Application Tips</h3>
          <ul className="space-y-8">
            {[
              { title: "Be Personal", desc: "Families love to hear about your personality and specific reasons why you chose them." },
              { title: "Highlight Relevance", desc: "Focus on experience that matches their children's ages." },
              { title: "Safety First", desc: "Mentioning CPR or first-aid training early builds immediate trust." }
            ].map((tip, i) => (
              <li key={tip.title} className="flex gap-4 group/tip">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-tertiary-fixed flex items-center justify-center text-[10px] font-black text-on-tertiary-fixed shadow-sm group-hover/tip:scale-125 transition-transform">{i+1}</div>
                <div className="space-y-1">
                  <p className="font-black text-sm text-primary tracking-tight">{tip.title}</p>
                  <p className="text-xs text-on-surface-variant font-medium opacity-70 leading-relaxed italic">{tip.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </main>
  );
}
