"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { 
  getVerificationData, 
  uploadIdentityDocs, 
  submitBackgroundAuth, 
  submitReferences, 
  finalizeVerification 
} from "./actions";
import { useRouter } from "next/navigation";

const steps = [
  { id: 1, name: "Identity", icon: "badge" },
  { id: 2, name: "Background", icon: "gavel" },
  { id: 3, name: "References", icon: "groups" },
  { id: 4, name: "Review", icon: "fact_check" },
];

export default function VerificationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [dbData, setDbData] = useState<any>(null);

  useEffect(() => {
    async function init() {
      try {
        const data = await getVerificationData();
        if (data) {
          setDbData(data);
          setCurrentStep(data.currentStep);
        }
      } catch (error) {
        console.error("Failed to fetch verification data", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (dbData?.status === "pending" || dbData?.status === "verified") {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <MaterialIcon name="verified" className="text-4xl text-green-600" />
        </div>
        <h1 className="text-3xl font-headline font-bold text-navy">Application {dbData.status === "verified" ? "Approved" : "Under Review"}</h1>
        <p className="text-on-surface-variant leading-relaxed">
          {dbData.status === "verified" 
            ? "Congratulations! You are now a verified KindredCare Professional." 
            : "Our team is currently reviewing your credentials. This process typically takes 3-5 business days."}
        </p>
        <button onClick={() => router.push("/dashboard/nanny")} className="text-navy font-bold hover:underline">Return to Dashboard</button>
      </div>
    );
  }

  return (
    <main className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-12">
        <h1 className="text-3xl font-headline font-bold text-navy mb-2">Caregiver Verification</h1>
        <p className="text-on-surface-variant font-medium">Join the top 2% of elite caregivers on KindredCare.</p>
      </div>

      {/* Stepper */}
      <div className="mb-16 relative">
        <div className="absolute top-5 left-0 w-full h-0.5 bg-outline-variant -z-10" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-navy transition-all duration-500 -z-10" 
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        <div className="flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all border-2",
                  currentStep >= step.id 
                    ? "bg-navy text-white border-navy" 
                    : "bg-surface text-on-surface-variant border-outline-variant"
                )}
              >
                {currentStep > step.id ? (
                  <MaterialIcon name="check" className="text-xl" />
                ) : (
                  step.id
                )}
              </div>
              <span className={cn(
                "text-[10px] uppercase font-bold tracking-widest",
                currentStep >= step.id ? "text-navy" : "text-on-surface-variant"
              )}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
           {currentStep === 1 && (
             <IdentityStep 
               onNext={async (formData) => {
                 setVerifying(true);
                 await uploadIdentityDocs(formData);
                 setVerifying(false);
                 setCurrentStep(2);
               }} 
               isUploading={verifying}
             />
           )}
           {currentStep === 2 && (
             <BackgroundStep 
               onNext={async () => {
                 setVerifying(true);
                 await submitBackgroundAuth();
                 setVerifying(false);
                 setCurrentStep(3);
               }} 
               onBack={() => setCurrentStep(1)} 
               isSubmitting={verifying}
             />
           )}
           {currentStep === 3 && (
             <ReferencesStep 
               onNext={async (refs) => {
                 setVerifying(true);
                 await submitReferences(JSON.stringify(refs));
                 setVerifying(false);
                 setCurrentStep(4);
               }} 
               onBack={() => setCurrentStep(2)} 
               isSubmitting={verifying}
             />
           )}
           {currentStep === 4 && (
             <ReviewStep 
               onBack={() => setCurrentStep(3)} 
               onFinalSubmit={async () => {
                 setVerifying(true);
                 await finalizeVerification();
                 setVerifying(false);
                 // Reload to show completion screen
                 window.location.reload();
               }}
               isSubmitting={verifying}
             />
           )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-navy rounded-2xl p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-6">
                <MaterialIcon name="lock" className="text-terracotta text-sm" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Privacy First</span>
              </div>
              <h4 className="font-headline text-2xl font-bold mb-6">Your data is safe with us</h4>
              <ul className="space-y-6 text-sm text-blue-100/80 font-medium">
                <li className="flex gap-3">
                  <MaterialIcon name="security" className="text-terracotta" />
                  Bank-level AES-256 encryption.
                </li>
                <li className="flex gap-3">
                  <MaterialIcon name="visibility_off" className="text-terracotta" />
                  Only the trust team can view documents.
                </li>
                <li className="flex gap-3">
                  <MaterialIcon name="delete_forever" className="text-terracotta" />
                  Data purged upon account deletion.
                </li>
              </ul>
            </div>
            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

function IdentityStep({ onNext, isUploading }: { onNext: (fd: FormData) => void; isUploading: boolean }) {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);

  const handleNext = () => {
    if (!front || !back) return;
    const fd = new FormData();
    fd.append("front", front);
    fd.append("back", back);
    onNext(fd);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-headline text-navy font-bold mb-4 tracking-tight">Step 1: Identity Authorization</h2>
        <p className="text-on-surface-variant text-lg">Upload a clear photo or scan of your government-issued ID.</p>
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <label className={cn(
            "group border-2 border-dashed border-outline-variant rounded-2xl p-12 transition-all text-center cursor-pointer overflow-hidden",
            front ? "border-green-600 bg-green-50/10" : "hover:border-navy hover:bg-navy/5"
          )}>
            <input type="file" className="hidden" onChange={(e) => setFront(e.target.files?.[0] || null)} />
            <MaterialIcon name={front ? "check_circle" : "add_a_photo"} className={cn("text-4xl mb-4", front ? "text-green-600" : "text-on-surface-variant group-hover:text-navy")} />
            <p className="font-bold text-navy">{front ? front.name : "Upload Front"}</p>
          </label>
          <label className={cn(
            "group border-2 border-dashed border-outline-variant rounded-2xl p-12 transition-all text-center cursor-pointer overflow-hidden",
            back ? "border-green-600 bg-green-50/10" : "hover:border-navy hover:bg-navy/5"
          )}>
            <input type="file" className="hidden" onChange={(e) => setBack(e.target.files?.[0] || null)} />
            <MaterialIcon name={back ? "check_circle" : "flip"} className={cn("text-4xl mb-4", back ? "text-green-600" : "text-on-surface-variant group-hover:text-navy")} />
            <p className="font-bold text-navy">{back ? back.name : "Upload Back"}</p>
          </label>
        </div>

        <div className="mt-12 flex justify-end">
          <button 
            disabled={!front || !back || isUploading}
            onClick={handleNext}
            className="bg-navy disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-navy/20 hover:scale-[1.02] transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
          >
            {isUploading ? "Uploading docs..." : "Save & Continue"}
            <MaterialIcon name="chevron_right" />
          </button>
        </div>
      </div>
    </div>
  );
}

function BackgroundStep({ onNext, onBack, isSubmitting }: { onNext: () => void; onBack: () => void; isSubmitting: boolean }) {
  const [agreed, setAgreed] = useState(false);
  const [certified, setCertified] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-headline font-bold text-navy mb-4 tracking-tight">Step 2: Legal Authorization</h2>
        <p className="text-on-surface-variant text-lg">Electronic signature for security protocols.</p>
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl p-10 shadow-sm">
         <div className="bg-surface-variant/50 p-6 rounded-xl mb-8 border border-outline-variant/30">
            <p className="text-sm text-navy leading-relaxed font-medium">
              I hereby authorize KindredCare and its authorized representatives to conduct a multi-state criminal background screening, social security number trace, and sex offender registry search.
            </p>
          </div>

          <div className="space-y-4">
            <label className="flex items-start gap-4 p-5 rounded-xl border border-outline-variant hover:border-navy hover:bg-navy/5 transition-all cursor-pointer group">
              <input type="checkbox" checked={agreed} onChange={() => setAgreed(!agreed)} className="mt-1 w-5 h-5 rounded border-outline-variant text-navy focus:ring-navy/20" />
              <span className="text-sm text-navy font-semibold leading-relaxed">I consent to the background screening process.</span>
            </label>
            <label className="flex items-start gap-4 p-5 rounded-xl border border-outline-variant hover:border-navy hover:bg-navy/5 transition-all cursor-pointer group">
              <input type="checkbox" checked={certified} onChange={() => setCertified(!certified)} className="mt-1 w-5 h-5 rounded border-outline-variant text-navy focus:ring-navy/20" />
              <span className="text-sm text-navy font-semibold leading-relaxed">I certify all information is accurate.</span>
            </label>
          </div>

          <div className="mt-12 flex items-center justify-between pt-10 border-t border-outline-variant">
            <button onClick={onBack} className="text-on-surface-variant font-bold hover:text-navy transition-colors text-sm uppercase tracking-widest">Back</button>
            <button 
              disabled={!agreed || !certified || isSubmitting}
              onClick={onNext}
              className="bg-navy disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-navy/20 hover:scale-[1.02] transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
            >
              {isSubmitting ? "Signing..." : "Digitally Sign & Continue"}
              <MaterialIcon name="chevron_right" />
            </button>
          </div>
      </div>
    </div>
  );
}

function ReferencesStep({ onNext, onBack, isSubmitting }: { onNext: (refs: any[]) => void; onBack: () => void; isSubmitting: boolean }) {
  const [refs, setRefs] = useState([
    { name: "", relation: "", email: "", phone: "" },
    { name: "", relation: "", email: "", phone: "" },
    { name: "", relation: "", email: "", phone: "" },
  ]);

  const updateRef = (index: number, field: string, value: string) => {
    const newRefs = [...refs];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setRefs(newRefs);
  };

  const isComplete = refs.every(r => r.name && r.email && r.relation);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-headline font-bold text-navy mb-4 tracking-tight">Step 3: Professional References</h2>
        <p className="text-on-surface-variant text-lg">Three references from previous families or employers.</p>
      </div>

      <div className="space-y-6">
        {refs.map((ref, i) => (
          <div key={i} className="bg-white border border-outline-variant rounded-2xl p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-navy/5 flex items-center justify-center font-bold text-navy text-xs">{i + 1}</div>
              <h3 className="font-headline font-bold text-navy text-sm uppercase tracking-widest">Reference {i + 1}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={ref.name} onChange={(e) => updateRef(i, "name", e.target.value)} type="text" placeholder="Full Name" className="bg-surface border-outline-variant/30 rounded-lg p-3 text-sm focus:ring-1 focus:ring-navy" />
              <input value={ref.relation} onChange={(e) => updateRef(i, "relation", e.target.value)} type="text" placeholder="Relationship" className="bg-surface border-outline-variant/30 rounded-lg p-3 text-sm focus:ring-1 focus:ring-navy" />
              <input value={ref.email} onChange={(e) => updateRef(i, "email", e.target.value)} type="email" placeholder="Email" className="bg-surface border-outline-variant/30 rounded-lg p-3 text-sm focus:ring-1 focus:ring-navy" />
              <input value={ref.phone} onChange={(e) => updateRef(i, "phone", e.target.value)} type="tel" placeholder="Phone" className="bg-surface border-outline-variant/30 rounded-lg p-3 text-sm focus:ring-1 focus:ring-navy" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center justify-between pt-10 border-t border-outline-variant">
        <button onClick={onBack} className="text-on-surface-variant font-bold hover:text-navy transition-colors text-sm uppercase tracking-widest">Back</button>
        <button 
          disabled={!isComplete || isSubmitting}
          onClick={() => onNext(refs)}
          className="bg-navy disabled:opacity-50 text-white px-10 py-4 rounded-xl font-bold shadow-lg shadow-navy/20 hover:scale-[1.02] transition-all flex items-center gap-3 uppercase tracking-widest text-sm"
        >
          {isSubmitting ? "Saving..." : "Submit References"}
          <MaterialIcon name="chevron_right" />
        </button>
      </div>
    </div>
  );
}

function ReviewStep({ onBack, onFinalSubmit, isSubmitting }: { onBack: () => void; onFinalSubmit: () => void; isSubmitting: boolean }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-4xl font-headline font-bold text-navy mb-4 tracking-tight">Step 4: Application Review</h2>
        <p className="text-on-surface-variant text-lg">Confirm your details before final submission.</p>
      </div>

      <div className="bg-white border border-outline-variant rounded-2xl p-10 shadow-sm space-y-8">
        <div className="flex justify-between items-center pb-6 border-b border-outline-variant/40">
           <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
              <MaterialIcon name="badge" className="text-navy text-xl" />
            </div>
            <div>
              <p className="font-bold text-navy">Identity Proof</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Verified Scans ready</p>
            </div>
          </div>
          <MaterialIcon name="check_circle" className="text-green-600" />
        </div>

        <div className="flex justify-between items-center pb-6 border-b border-outline-variant/40">
           <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
              <MaterialIcon name="gavel" className="text-navy text-xl" />
            </div>
            <div>
              <p className="font-bold text-navy">Legal Consent</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Background check authorized</p>
            </div>
          </div>
          <MaterialIcon name="check_circle" className="text-green-600" />
        </div>

        <div className="flex justify-between items-center">
           <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center">
              <MaterialIcon name="groups" className="text-navy text-xl" />
            </div>
            <div>
              <p className="font-bold text-navy">Professional Verification</p>
              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">3 references recorded</p>
            </div>
          </div>
          <MaterialIcon name="check_circle" className="text-green-600" />
        </div>

        <div className="pt-10">
          <button 
            disabled={isSubmitting}
            onClick={onFinalSubmit}
            className="w-full py-5 bg-navy disabled:opacity-50 text-white rounded-2xl font-black text-lg shadow-xl shadow-navy/20 hover:scale-[1.01] active:scale-[0.99] transition-all uppercase tracking-widest"
          >
            {isSubmitting ? "Finalizing..." : "Submit Application for Review"}
          </button>
        </div>

        <div className="text-center pt-2">
          <button onClick={onBack} className="text-on-surface-variant font-bold hover:text-navy text-xs uppercase tracking-widest transition-colors">Return to edit</button>
        </div>
      </div>
    </div>
  );
}
