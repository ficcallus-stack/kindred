"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

// Step Components
import ProfileStep from "@/components/registration/ProfileStep";
import AvailabilityStep from "@/components/registration/AvailabilityStep";

const STEPS = [
  { id: 1, title: "Basic Profile", progress: 50 },
  { id: 2, title: "Availability & Terms", progress: 100 },
];

export default function NannyRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    profile: {},
    availability: {
      rate: "",
      locations: "",
      times: {},
      terms: "",
    },
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (stepKey: string, data: any) => {
    setFormData((prev) => ({ ...prev, [stepKey]: data }));
  };

  const currentStepData = STEPS.find((s) => s.id === currentStep)!;

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      {/* Transactional Nav */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center h-20 px-8 max-w-7xl mx-auto">
          <Link href="/" className="text-2xl font-extrabold tracking-tight text-primary font-headline text-slate-900">
            KindredCare US
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-on-surface-variant font-label text-sm uppercase font-bold tracking-widest opacity-60">Nanny Onboarding</span>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-primary font-bold font-label uppercase tracking-widest text-[10px] bg-primary/5 px-3 py-1 rounded-full">
                  Step 0{currentStep} of 0{STEPS.length}
                </span>
                <h1 className="text-3xl font-headline font-bold text-navy mt-4">
                  {currentStepData.title}
                </h1>
              </div>
              <div className="hidden md:block text-right">
                <span className="text-on-surface-variant font-label text-xs uppercase font-bold tracking-widest">Progress</span>
                <div className="text-navy font-extrabold text-xl">{currentStepData.progress}%</div>
              </div>
            </div>
            
            <div className="h-2 w-full bg-surface-container-low rounded-full overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full bg-primary transition-all duration-700 ease-out shadow-[0_0_10px_rgba(var(--color-primary),0.5)]",
                  currentStep === 1 ? "bg-terracotta" : "bg-navy"
                )}
                style={{ width: `${currentStepData.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              {currentStep === 1 && (
                <ProfileStep data={formData.profile} onNext={(data) => { updateFormData("profile", data); nextStep(); }} />
              )}
              {currentStep === 2 && (
                <AvailabilityStep 
                  data={formData.availability} 
                  onBack={prevStep} 
                  onSubmit={(data) => { 
                    updateFormData("availability", data); 
                    // Redirect straight to verification to complete elite onboarding
                    router.push("/dashboard/nanny/verification");
                  }} 
                />
              )}
            </div>

            {/* Sidebar Tips */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-navy rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="relative z-10">
                  <MaterialIcon name="bolt" className="text-terracotta mb-4 text-3xl" />
                  <h3 className="font-headline font-bold text-xl mb-4 leading-tight">Elite Status Awaits</h3>
                  <p className="text-sm leading-relaxed text-blue-100/70 font-medium italic">
                    "Families prioritize verified nannies. Complete this quick setup, and we'll start your elite background check in the next step."
                  </p>
                </div>
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
              </div>

              <div className="bg-white border border-outline-variant p-8 rounded-2xl space-y-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="verified_user" className="text-navy" />
                  <h4 className="font-headline font-bold text-navy uppercase text-xs tracking-widest">Security First</h4>
                </div>
                <ul className="space-y-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  <li className="flex gap-3">
                    <MaterialIcon name="check_circle" className="text-terracotta text-sm" />
                    <span>Private contact info</span>
                  </li>
                  <li className="flex gap-3">
                    <MaterialIcon name="check_circle" className="text-terracotta text-sm" />
                    <span>Encrypted data vault</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
