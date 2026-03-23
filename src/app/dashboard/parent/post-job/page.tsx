"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Step1 from "@/components/post-job/Step1";
import Step2 from "@/components/post-job/Step2";
import Step3 from "@/components/post-job/Step3";
import Step4 from "@/components/post-job/Step4";

export default function PostJobPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    childCount: 2,
    location: "Austin, TX",
    child1Years: 2,
    child1Months: 4,
    duration: "Full-time",
    schedule: {
      "Mon-morning": true, "Mon-afternoon": true,
      "Tue-morning": true, "Tue-afternoon": true,
      "Wed-morning": true, "Wed-afternoon": true,
      "Thu-morning": true, "Thu-afternoon": true,
      "Fri-morning": true, "Fri-afternoon": true
    },
    certs: { cpr: true, first_aid: true },
    duties: { "Light housekeeping": true, "Meal prep": true },
    minRate: 22,
    maxRate: 28,
  });
  const router = useRouter();

  const updateData = (newData: any) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const goToStep = (s: number) => setStep(s);

  const STEPS = [
    { title: "Family Details", subtitle: "Family Details", icon: "edit_note" },
    { title: "Define your care schedule", subtitle: "Schedule", icon: "calendar_today" },
    { title: "Requirements", subtitle: "Requirements", icon: "verified_user" },
    { title: "Review & Finalize", subtitle: "Review", icon: "visibility" },
  ];

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <div className="flex max-w-7xl mx-auto min-h-screen">
        {/* Progress Sidebar */}
        <aside className="hidden md:flex flex-col pt-12 pb-8 h-[calc(100vh-64px)] w-64 fixed left-0 top-16 bg-slate-50/50 border-r border-outline-variant/10 overflow-y-auto">
          <div className="px-6 mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 font-label">New Job Posting</h2>
            <p className="text-sm font-bold text-secondary font-headline">Step {step} of 4</p>
          </div>
          <nav className="flex-1 pr-4">
            {STEPS.map((s, i) => (
              <div
                key={i}
                onClick={() => i + 1 < step && goToStep(i + 1)}
                className={cn(
                  "flex items-center gap-3 py-3 px-6 transition-all rounded-r-full cursor-pointer",
                  step === i + 1
                    ? "text-primary font-bold bg-white shadow-sm"
                    : i + 1 < step
                    ? "text-primary/60 hover:text-primary"
                    : "text-slate-400 pointer-events-none"
                )}
              >
                <MaterialIcon name={s.icon} fill={step === i + 1} />
                <span className="font-label font-bold text-sm">{s.subtitle}</span>
              </div>
            ))}
          </nav>
          <div className="px-6 mt-auto">
            <button className="w-full py-3 text-slate-500 font-bold hover:bg-slate-200/50 rounded-xl transition-all text-sm font-headline">Save Draft</button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn("flex-1 pt-12 pb-20 px-6 md:px-12", step < 5 ? "md:ml-64" : "")}>
          <div className="max-w-4xl mx-auto">
            {/* Header Section (only for steps 1-3) */}
            {step < 4 && (
              <header className="mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                  <div className="space-y-1">
                    <span className="text-secondary font-bold tracking-[0.2em] uppercase text-[10px] font-label">Job Wizard</span>
                    <h1 className="text-4xl font-extrabold font-headline tracking-tight text-primary">
                      {STEPS[step - 1].title}
                    </h1>
                  </div>
                  <div className="w-full md:w-80">
                    <div className="flex justify-end text-[11px] font-bold text-primary mb-2 uppercase tracking-tight">
                      <span className="font-headline">Step {step} of 4: {STEPS[step - 1].subtitle}</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden shadow-inner flex justify-end">
                      <div
                        className="h-full bg-primary transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${step * 25}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </header>
            )}

            {/* Step Content */}
            <div className="pb-32">
              {step === 1 && <Step1 data={formData} updateData={updateData} onNext={nextStep} onCancel={() => router.push("/dashboard/parent")} />}
              {step === 2 && <Step2 data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 3 && <Step3 data={formData} updateData={updateData} onNext={nextStep} onBack={prevStep} />}
              {step === 4 && <Step4 data={formData} onEdit={goToStep} onBack={prevStep} onSubmit={() => router.push("/dashboard/parent")} />}
            </div>
          </div>
        </main>
      </div>

      {/* Persistent Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-outline-variant/10 z-50 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={cn(
                "flex items-center gap-2 font-headline font-bold text-sm transition-all active:scale-95",
                step === 1 ? "text-slate-300 pointer-events-none" : "text-primary hover:translate-x-[-4px]"
              )}
            >
              <MaterialIcon name="arrow_back" className="text-lg" />
              Back
            </button>
          </div>
          
          <div className="flex items-center gap-6">
            <button className="text-primary font-headline font-bold text-sm hover:opacity-70 transition-opacity">
              Save as Draft
            </button>
            <button
              onClick={step === 4 ? () => router.push("/dashboard/parent") : nextStep}
              className="bg-primary text-on-primary px-10 py-3.5 rounded-xl font-headline font-extrabold text-sm shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
            >
              {step === 4 ? "Post Job Now" : "Next Step"}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
