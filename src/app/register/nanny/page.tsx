"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

// Step Components
import ProfileStep from "@/components/registration/ProfileStep";
import ReferencesStep from "@/components/registration/ReferencesStep";
import CertificationsStep from "@/components/registration/CertificationsStep";
import AvailabilityStep from "@/components/registration/AvailabilityStep";

const STEPS = [
  { id: 1, title: "Profile", progress: 25 },
  { id: 2, title: "References", progress: 50 },
  { id: 3, title: "Certifications", progress: 75 },
  { id: 4, title: "Rate & Availability", progress: 100 },
];

export default function NannyRegistration() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    profile: {},
    references: [],
    certifications: [],
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
            <span className="text-on-surface-variant font-label text-sm">Need help?</span>
            <button className="text-primary font-semibold text-sm hover:opacity-80 transition-opacity">
              Contact Support
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-12">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-primary font-bold font-label uppercase tracking-widest text-xs">
                  Step 0{currentStep} of 0{STEPS.length}
                </span>
                <h1 className="text-3xl font-headline font-bold text-primary mt-1">
                  {currentStepData.title}
                </h1>
              </div>
              <div className="hidden md:block text-right">
                <span className="text-on-surface-variant font-label text-sm font-semibold">Registration Progress</span>
                <div className="text-primary font-extrabold">{currentStepData.progress}% Complete</div>
              </div>
            </div>
            
            <div className="h-1.5 w-full bg-surface-container-low rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out" 
                style={{ width: `${currentStepData.progress}%` }}
              ></div>
            </div>

            <div className="hidden md:grid grid-cols-4 mt-4 text-[10px] font-label font-bold uppercase tracking-wider gap-4">
              {STEPS.map((step) => (
                <div 
                  key={step.id} 
                  className={cn(
                    "transition-colors",
                    currentStep >= step.id ? "text-primary" : "text-on-surface-variant opacity-40"
                  )}
                >
                  {step.id}. {step.title}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
              {currentStep === 1 && (
                <ProfileStep data={formData.profile} onNext={(data) => { updateFormData("profile", data); nextStep(); }} />
              )}
              {currentStep === 2 && (
                <ReferencesStep 
                  data={formData.references} 
                  onNext={(data) => { updateFormData("references", data); nextStep(); }} 
                  onBack={prevStep} 
                />
              )}
              {currentStep === 3 && (
                <CertificationsStep 
                  data={formData.certifications} 
                  onNext={(data) => { updateFormData("certifications", data); nextStep(); }} 
                  onBack={prevStep} 
                />
              )}
              {currentStep === 4 && (
                <AvailabilityStep 
                  data={formData.availability} 
                  onBack={prevStep} 
                  onSubmit={(data) => { 
                    updateFormData("availability", data); 
                    router.push("/dashboard/nanny");
                  }} 
                />
              )}
            </div>

            {/* Sidebar Tips */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="bg-primary/5 p-8 rounded-2xl text-primary relative overflow-hidden border border-primary/10">
                <MaterialIcon name="lightbulb" className="absolute -right-4 -bottom-4 text-8xl opacity-10" fill />
                <h3 className="font-headline font-bold text-xl mb-4">Pro Tip</h3>
                <p className="text-sm leading-relaxed font-medium">
                  {currentStep === 1 && "Nannies who include a clear, smiling photo and a detailed bio are 4x more likely to get interviewed."}
                  {currentStep === 2 && "Parent references are the #1 thing families look for before reaching out. High-quality references speed up your approval."}
                  {currentStep === 3 && "Adding verifiable certifications like CPR or First Aid can increase your average hourly rate by up to 20%."}
                  {currentStep === 4 && "Consistency is key. Setting clear terms and a firm availability grid builds trust early with families."}
                </p>
              </div>

              <div className="bg-surface-container-low p-8 rounded-2xl space-y-6">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="verified_user" className="text-primary" fill />
                  <h4 className="font-headline font-bold text-primary">Your Privacy</h4>
                </div>
                <ul className="space-y-4 text-xs font-medium text-on-surface-variant">
                  <li className="flex gap-3">
                    <MaterialIcon name="check_circle" className="text-primary text-sm" fill />
                    <span>Your phone number and email are never shared publicly.</span>
                  </li>
                  <li className="flex gap-3">
                    <MaterialIcon name="check_circle" className="text-primary text-sm" fill />
                    <span>All data is encrypted and stored securely.</span>
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
