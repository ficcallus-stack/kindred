"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

import { useAuth } from "@/lib/auth-context";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";

// Step Components
import ProfileStep from "@/components/registration/ProfileStep";
import AvailabilityStep from "@/components/registration/AvailabilityStep";
import { registerNanny } from "./actions";
import { useToast } from "@/components/Toast";

const STEPS = [
  { id: 1, title: "Basic Profile", progress: 50 },
  { id: 2, title: "Availability & Terms", progress: 100 },
];

export default function NannyRegistration() {
  const router = useRouter();
  const { user, loading, role: authRole, signOut } = useAuth();
  const isLoaded = !loading;
  
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
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (stepKey: string, data: any) => {
    setFormData((prev) => ({ ...prev, [stepKey]: data }));
  };

  const currentStepData = STEPS.find((s) => s.id === currentStep)!;

  // Wait for Clerk to load
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary animate-pulse">Checking access...</p>
      </div>
    );
  }

  // Prevent unauthenticated access
  if (!user) {
    router.push("/login");
    return null;
  }

  // Check role conflict: parents cannot register as caregivers
  const userRole = authRole;
  if (userRole === "parent") {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center border border-outline-variant/10">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto text-terracotta mb-6">
            <MaterialIcon name="manage_accounts" className="text-4xl" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-navy mb-4">Account Role Conflict</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
            You are currently registered as a <strong>Parent</strong>. 
            To register as a Caregiver or Nanny, you must either create a new account with a different email address or <Link href="/dashboard/support" className="text-primary underline font-black">contact support</Link> to convert your existing account.
          </p>
          <div className="space-y-3 flex flex-col items-center">
             <button
               onClick={() => router.push("/dashboard/parent")}
               className="w-full bg-navy text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-opacity"
             >
               Return to Parent Dashboard
             </button>
             <button
               onClick={async () => { await signOut(); router.push("/signup"); }}
               className="w-full bg-white border border-outline-variant/20 text-navy font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors"
             >
               Sign Out & Create Caregiver Account
             </button>
          </div>
        </div>
      </div>
    );
  }

  // Auto-fill using Clerk data if profile is empty
  const nameParts = (user.displayName || "").split(" ");
  const prefilledProfile = {
    ...formData.profile,
    firstName: (formData.profile as any).firstName || nameParts[0] || "",
    lastName: (formData.profile as any).lastName || nameParts.slice(1).join(" ") || "",
    email: (formData.profile as any).email || user.email || "",
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">

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
                <ProfileStep data={prefilledProfile} onNext={(data) => { updateFormData("profile", data); nextStep(); }} />
              )}
              {currentStep === 2 && (
                <AvailabilityStep 
                  data={formData.availability} 
                  onBack={prevStep} 
                  isSubmitting={submitting}
                  onSubmit={async (availabilityData) => { 
                    setSubmitting(true);
                    try {
                      const finalData = {
                        profile: formData.profile as any,
                        availability: availabilityData
                      };
                      
                      const result = await registerNanny(finalData);
                      if (result.success) {
                        showToast("Registration successful! Starting verification...", "success");
                        // Delay slightly so the role change propagates if needed, though redirect should handle it
                        setTimeout(() => {
                           // Force a hard navigation to ensure the new role is picked up by layouts/middleware
                           window.location.href = "/dashboard/nanny/verification";
                        }, 500);
                      }
                    } catch (error) {
                      console.error("Registration failed", error);
                      showToast("Registration failed. Please try again.", "error");
                    } finally {
                      setSubmitting(false);
                    }
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
