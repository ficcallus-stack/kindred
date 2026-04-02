"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { 
  uploadIdentityDocs, 
  submitBackgroundAuth, 
  saveProfessionalProfile, 
  submitReferences, 
  finalizeVerification 
} from "./actions";

interface VerificationWizardProps {
  initialData: any;
  user: any;
}

export default function VerificationWizard({ initialData, user }: VerificationWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialData?.verification?.currentStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifData, setVerifData] = useState(initialData?.verification || {});
  const [profileData, setProfileData] = useState(initialData?.profile || {});

  const trustScore = 250 + (currentStep > 1 ? 200 : 0) + (currentStep > 2 ? 300 : 0) + (currentStep > 3 ? 150 : 0);

  const nextStep = () => setCurrentStep((prev: number) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev: number) => Math.max(prev - 1, 1));

  return (
    <div className="grid grid-cols-12 gap-10 items-start">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex lg:col-span-3 h-[calc(100vh-160px)] sticky top-32 flex-col gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-primary/5 border border-outline-variant/10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-40">Trust Score</span>
            <span className="text-xs bg-primary/5 text-primary px-3 py-1 rounded-full font-black italic">{trustScore}/1000</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2 mb-6 overflow-hidden">
            <div 
                className="bg-primary h-full transition-all duration-1000 ease-out rounded-full" 
                style={{ width: `${(trustScore / 1000) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-on-surface-variant/60 leading-relaxed italic font-medium">
            Verification in Progress. Complete each step to maximize your professional vetting score.
          </p>
        </div>

        <nav className="flex flex-col gap-1.5 p-2 bg-surface-container-low/50 rounded-[2.5rem] border border-outline-variant/10">
          {[
            { id: 1, label: "Legal Identity", icon: "badge" },
            { id: 2, label: "Background Auth", icon: "verified_user" },
            { id: 3, label: "Professional Profile", icon: "account_circle" },
            { id: 4, label: "Digital References", icon: "group" },
            { id: 5, label: "Final Review", icon: "fact_check" },
          ].map((step) => (
            <div 
              key={step.id}
              className={cn(
                "p-4 flex items-center gap-4 rounded-[1.5rem] transition-all cursor-pointer",
                currentStep === step.id 
                    ? "bg-white text-primary shadow-xl shadow-primary/5 font-black scale-[1.02]" 
                    : "text-on-surface-variant/40 hover:text-primary hover:bg-white/50"
              )}
              onClick={() => currentStep > step.id && setCurrentStep(step.id)}
            >
              <MaterialIcon name={step.icon} fill={currentStep >= step.id} className="text-xl" />
              <span className="text-sm tracking-tight">{step.label}</span>
              {currentStep > step.id && <MaterialIcon name="check_circle" className="ml-auto text-green-500 text-sm" fill />}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="col-span-12 lg:col-span-9 space-y-12">
        {currentStep === 1 && (
            <IdentityStep 
                user={user} 
                onNext={async (fd: FormData) => {
                    setIsSubmitting(true);
                    await uploadIdentityDocs(fd);
                    setIsSubmitting(false);
                    nextStep();
                }}
                isSubmitting={isSubmitting}
            />
        )}
        {currentStep === 2 && (
            <BackgroundStep 
                user={user}
                onNext={async (ssn: string) => {
                    setIsSubmitting(true);
                    await submitBackgroundAuth(ssn);
                    setIsSubmitting(false);
                    nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
            />
        )}
        {currentStep === 3 && (
            <ProfileStep 
                initialProfile={profileData}
                onNext={async (data: any) => {
                    setIsSubmitting(true);
                    await saveProfessionalProfile(data);
                    setIsSubmitting(false);
                    nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
            />
        )}
        {currentStep === 4 && (
            <ReferencesStep 
                initialRefs={verifData.references || []}
                onNext={async (refs: any[]) => {
                    setIsSubmitting(true);
                    await submitReferences(JSON.stringify(refs));
                    setIsSubmitting(false);
                    nextStep();
                }}
                onBack={prevStep}
                isSubmitting={isSubmitting}
            />
        )}
        {currentStep === 5 && (
            <ReviewStep 
                data={{ ...verifData, ...profileData }}
                onBack={prevStep}
                onSubmit={async () => {
                   setIsSubmitting(true);
                   await finalizeVerification();
                   setIsSubmitting(false);
                   window.location.reload();
                }}
                isSubmitting={isSubmitting}
            />
        )}
      </main>
    </div>
  );
}

// ── Step Components ───────────────────────────────────────────

function IdentityStep({ user, onNext, isSubmitting }: any) {
    const [front, setFront] = useState<File | null>(null);
    const [back, setBack] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData(e.target as HTMLFormElement);
        if (front) fd.append("front", front);
        if (back) fd.append("back", back);
        if (selfie) fd.append("selfie", selfie);
        onNext(fd);
    };

    return (
        <form method="POST" onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-16 pb-20">
            <header className="relative">
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 1 of 5</span>
                <h1 className="text-5xl md:text-6xl font-headline font-black text-primary mb-6 leading-tight tracking-tighter italic">Identity Verification</h1>
                <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-medium italic opacity-80">
                    To ensure the safety of our community, please provide your legal identification details. Your data is encrypted and handled with boutique-level care.
                </p>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary-fixed/5 blur-[100px] rounded-full -z-10" />
            </header>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10">
                    <label className="block">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">Full Legal Name <span className="text-error">*</span></span>
                        <input name="fullName" required defaultValue={user?.fullName} className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary italic" />
                    </label>
                </div>
                <div className="p-10 bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10">
                    <label className="block">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">Date of Birth <span className="text-error">*</span></span>
                        <input name="dob" type="date" required className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary" />
                    </label>
                </div>
            </section>

            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-headline font-black text-primary italic tracking-tight">Government-Issued ID</h3>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 italic">Passport, License, or National ID</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <label className={cn(
                        "relative group h-72 bg-surface-container-low rounded-[2.5rem] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden",
                        front ? "border-primary bg-primary/5" : "hover:bg-white hover:shadow-2xl"
                    )}>
                        <input type="file" className="hidden" onChange={(e) => setFront(e.target.files?.[0] || null)} />
                        <MaterialIcon name={front ? "check_circle" : "file_upload"} className={cn("text-5xl mb-4", front ? "text-primary" : "text-primary/20")} />
                        <span className="font-bold text-primary uppercase tracking-widest text-[10px] italic">{front ? front.name : "Upload ID Front"}</span>
                    </label>
                    <label className={cn(
                        "relative group h-72 bg-surface-container-low rounded-[2.5rem] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden",
                        back ? "border-primary bg-primary/5" : "hover:bg-white hover:shadow-2xl"
                    )}>
                        <input type="file" className="hidden" onChange={(e) => setBack(e.target.files?.[0] || null)} />
                        <MaterialIcon name={back ? "check_circle" : "file_upload"} className={cn("text-5xl mb-4", back ? "text-primary" : "text-primary/20")} />
                        <span className="font-bold text-primary uppercase tracking-widest text-[10px] italic">{back ? back.name : "Upload ID Back"}</span>
                    </label>
                </div>
            </section>

            <section className="flex flex-col md:flex-row gap-16 items-center p-12 bg-primary/5 rounded-[3rem] border border-primary/10">
                <div className="flex-1 space-y-6">
                    <h3 className="text-3xl font-headline font-black text-primary italic tracking-tight flex items-center gap-4">
                        Live Selfie Verification
                        <span className="text-error text-sm">*</span>
                    </h3>
                    <p className="text-on-surface-variant font-medium leading-relaxed italic opacity-80">
                        Capture a quick live image to ensure you match your ID documents. Ensure you are in a well-lit area without hats or sunglasses.
                    </p>
                    <label className="inline-flex items-center gap-4 bg-primary text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all">
                        <input type="file" accept="image/*" capture="user" className="hidden" onChange={(e) => setSelfie(e.target.files?.[0] || null)} />
                        <MaterialIcon name="photo_camera" />
                        {selfie ? "Recapture Selfie" : "Start Camera Capture"}
                    </label>
                    {selfie && <p className="text-[10px] font-black uppercase tracking-widest text-green-600 italic">✓ Selfie Captured: {selfie.name}</p>}
                </div>
                <div className="w-64 h-64 bg-white rounded-[2.5rem] shadow-inner flex items-center justify-center border border-outline-variant/10 overflow-hidden relative">
                    {selfie ? (
                        <img src={URL.createObjectURL(selfie)} className="w-full h-full object-cover" alt="Selfie preview" />
                    ) : (
                        <MaterialIcon name="face" className="text-6xl text-primary/10" />
                    )}
                </div>
            </section>

            <div className="pt-12 border-t border-outline-variant/10 flex justify-between items-center">
                <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest max-w-xs italic leading-relaxed">
                    By continuing, you agree to our Identity Terms. Data is encrypted via Kindred's secure vault.
                </p>
                <button 
                    type="submit"
                    disabled={!front || !back || !selfie || isSubmitting}
                    className="bg-primary text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? "Encrypting Docs..." : "Save & Continue"}
                </button>
            </div>
        </form>
    );
}

function BackgroundStep({ user, onNext, onBack, isSubmitting }: any) {
    const [ssn, setSsn] = useState("");
    const [signed, setSigned] = useState(false);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-16 pb-20">
             <header className="relative">
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 2 of 5</span>
                <h1 className="text-4xl md:text-6xl font-headline font-black text-primary mb-6 leading-tight tracking-tighter italic">Background Authorization</h1>
                <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-medium italic opacity-80">
                    To maintain our community's safety standards, we require a comprehensive background screening.
                </p>
            </header>

            <div className="grid grid-cols-12 gap-10">
                <div className="col-span-12 md:col-span-8 space-y-10">
                    <div className="bg-primary text-white p-12 rounded-[3rem] shadow-2xl shadow-primary/20 relative overflow-hidden group">
                        <div className="relative z-10 flex items-center gap-8">
                            <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center backdrop-blur-md">
                                <MaterialIcon name="security" className="text-4xl" />
                            </div>
                            <div>
                                <h3 className="text-xl font-headline font-black italic tracking-tight">Bank-Grade Security</h3>
                                <p className="text-blue-100/60 text-xs font-medium italic leading-relaxed">AES-256 encryption ensures your sensitive information remains private.</p>
                            </div>
                        </div>
                        <MaterialIcon name="lock" className="absolute -bottom-10 -right-10 text-[10rem] opacity-5 group-hover:rotate-12 transition-transform duration-700" fill />
                    </div>

                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 space-y-12">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-primary italic">Social Security Number (Last 4)</label>
                            <input 
                                type="password" 
                                maxLength={4} 
                                value={ssn}
                                onChange={(e) => setSsn(e.target.value)}
                                className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-5 font-black text-2xl tracking-[1em] text-primary italic" 
                                placeholder="••••" 
                            />
                        </div>

                        <div className="bg-surface-container-low/50 p-8 rounded-3xl max-h-48 overflow-y-auto text-xs text-on-surface-variant italic leading-relaxed font-medium scrollbar-hide border border-outline-variant/10">
                           <p className="font-black text-primary uppercase text-[9px] tracking-widest mb-4">Consent to Background Check</p>
                           <p className="mb-4">I hereby authorize KindredCare and its designated agents to conduct a comprehensive background check as part of my application process. This may include criminal history, sex offender registry, and professional certification verification.</p>
                           <p>By providing my digital signature below, I certify that all information provided is true and accurate.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-primary italic">Digital Signature</label>
                            <div 
                                className={cn(
                                    "h-32 bg-surface-container-low/50 rounded-3xl border-2 border-dashed border-outline-variant/30 flex items-center justify-center cursor-pointer transition-all",
                                    signed ? "border-primary bg-primary/5" : "hover:bg-white hover:border-primary/20"
                                )}
                                onClick={() => setSigned(true)}
                            >
                                {signed ? (
                                    <span className="font-headline text-3xl font-bold text-primary italic opacity-60">Verified {user?.fullName}</span>
                                ) : (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 italic">Click here to sign digitally</span>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => onNext(ssn)}
                            disabled={!signed || ssn.length < 4 || isSubmitting}
                            className="w-full bg-primary text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Authorizing..." : "Authorize and Continue"}
                        </button>
                    </div>
                </div>

                <div className="col-span-12 md:col-span-4 space-y-8">
                    <div className="p-10 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 relative overflow-hidden">
                        <h4 className="font-headline font-black text-primary italic tracking-tight mb-8">Trust Score Impact</h4>
                        <div className="flex items-center gap-6 mb-10">
                            <div className="w-24 h-24 rounded-full border-8 border-secondary/10 border-t-secondary flex items-center justify-center shadow-xl">
                                <span className="text-2xl font-black text-primary italic">+300</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1 leading-none">Potential Gain</div>
                                <div className="text-2xl font-black text-primary italic tracking-tight">Tier 2 Access</div>
                            </div>
                        </div>
                        <ul className="space-y-4">
                           <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary italic opacity-60"><MaterialIcon name="check_circle" className="text-green-500 text-sm" /> Identity Verified</li>
                           <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-primary italic"><MaterialIcon name="pending" className="text-amber-500 text-sm" /> Screening Started</li>
                        </ul>
                    </div>

                    <div className="relative h-80 rounded-[3rem] overflow-hidden shadow-2xl">
                         <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" alt="Security" />
                         <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex flex-col justify-end p-10">
                            <span className="text-secondary font-black text-[9px] uppercase tracking-[0.3em] mb-3 block italic tracking-widest">Our Promise</span>
                            <p className="text-white text-xs font-medium italic leading-relaxed">"Safety is the foundation of everything we build."</p>
                         </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 flex justify-center">
                <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer italic underline">Save draft & Return</button>
            </div>
        </div>
    );
}

function ProfileStep({ initialProfile, onNext, onBack, isSubmitting }: any) {
    const [bio, setBio] = useState(initialProfile?.bio || "");
    const [years, setYears] = useState(initialProfile?.experienceYears || "");
    const [edu, setEdu] = useState(initialProfile?.education || "");
    const [specs, setSpecs] = useState<string[]>(initialProfile?.specializations || []);

    const toggleSpec = (s: string) => {
        setSpecs(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-16 pb-20">
             <header>
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 3 of 5</span>
                <h1 className="text-4xl md:text-5xl font-headline font-black text-primary mb-4 leading-tight tracking-tighter italic">Professional Profile</h1>
                <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-medium italic opacity-80">Help families get to know you by showcasing your professional pedigree.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                    <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 space-y-10">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-primary italic">Professional Bio</label>
                            <textarea 
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="w-full bg-surface-container-low/50 border-none rounded-3xl p-8 focus:ring-4 focus:ring-primary/5 transition-all text-primary font-medium italic min-h-[200px]" 
                                placeholder="Describe your philosophy..." 
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-primary italic">Years of Experience</label>
                                <input 
                                    type="number"
                                    value={years}
                                    onChange={(e) => setYears(e.target.value)}
                                    className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-5 font-black text-primary italic" 
                                    placeholder="5+" 
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-primary italic">Educational Background</label>
                                <input 
                                    value={edu}
                                    onChange={(e) => setEdu(e.target.value)}
                                    className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-5 font-black text-primary italic" 
                                    placeholder="e.g. Early Childhood Certificate" 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-2xl font-headline font-black text-primary italic tracking-tight">Specializations</h3>
                        <div className="bg-surface-container-low rounded-[3rem] p-10 flex flex-wrap gap-4 border border-outline-variant/10">
                            {["Infant Care", "Special Needs", "Tutoring", "Meal Prep", "Bilingual", "Sleep Training", "Potty Training"].map(s => (
                                <button 
                                    key={s}
                                    type="button"
                                    onClick={() => toggleSpec(s)}
                                    className={cn(
                                        "px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                        specs.includes(s) ? "bg-primary text-white shadow-xl" : "bg-white text-on-surface-variant/60 hover:text-primary"
                                    )}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-10">
                     <div className="bg-primary-container p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                         <div className="relative z-10 flex justify-between items-start mb-10">
                            <h3 className="font-headline text-xl font-black italic tracking-tight leading-none">Trust Score</h3>
                            <MaterialIcon name="auto_awesome" className="text-secondary text-2xl" />
                         </div>
                         <div className="text-5xl font-black italic tracking-tighter mb-8">500 <span className="text-on-primary-container text-xl opacity-40">/ 1000</span></div>
                         <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden mb-10">
                            <div className="bg-gradient-to-r from-secondary-container to-secondary h-full w-1/2 rounded-full transition-all duration-1000" />
                         </div>
                         <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest"><MaterialIcon name="check_circle" className="text-secondary" /> ID Verified</li>
                            <li className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest opacity-40"><MaterialIcon name="pending" /> Certifications</li>
                         </ul>
                     </div>

                    <button 
                        onClick={() => onNext({ bio, experienceYears: parseInt(years), education: edu, specializations: specs, certifications: [] })}
                        disabled={!bio || !years || !edu || isSubmitting}
                        className="w-full bg-primary text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Saving Profile..." : "Save and Continue"}
                    </button>
                    <button onClick={onBack} className="w-full bg-white text-primary py-5 rounded-[1.5rem] border border-outline-variant/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all italic">Back to Identity</button>
                </div>
            </div>
        </div>
    );
}

function ReferencesStep({ initialRefs, onNext, onBack, isSubmitting }: any) {
    const [refs, setRefs] = useState(initialRefs?.length >= 2 ? initialRefs : [
        { name: "", relation: "Former Employer", email: "", phone: "", tenure: "", children: "" },
        { name: "", relation: "Educational Mentor", email: "", phone: "", tenure: "", children: "" },
    ]);

    const updateRef = (i: number, f: string, v: string) => {
        setRefs((prev: any) => {
           const n = [...prev];
           n[i] = { ...n[i], [f]: v };
           return n;
        });
    };

    const addRef = () => setRefs((prev: any) => [...prev, { name: "", relation: "Former Employer", email: "", phone: "", tenure: "", children: "" }]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-16 pb-20">
             <header className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                <div className="max-w-2xl">
                    <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 4 of 5</span>
                    <h1 className="text-4xl md:text-5xl font-headline font-black text-primary mb-4 leading-tight tracking-tighter italic">Digital References</h1>
                    <p className="text-on-surface-variant text-lg font-medium italic opacity-80">Validation through professional direct peer-to-peer verification.</p>
                </div>
                <div className="bg-primary p-10 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-2 italic">Current Trust</div>
                        <div className="text-3xl font-black italic tracking-tighter">750 <span className="text-xs opacity-20">/ 1000</span></div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-10">
                    {refs.map((ref: any, i: number) => (
                        <div key={i} className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 relative overflow-hidden">
                           <div className="flex items-center gap-4 mb-10">
                               <div className="w-10 h-10 rounded-[1.25rem] bg-primary text-white flex items-center justify-center font-black italic">{i+1}</div>
                               <h3 className="text-xl font-headline font-black italic text-primary">{i === 0 ? "Primary" : i === 1 ? "Secondary" : "Additional"} Reference</h3>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-3">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-primary/40 italic">Full Name</label>
                                   <input value={ref.name} onChange={(e) => updateRef(i, "name", e.target.value)} className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-4 font-bold text-primary italic" />
                               </div>
                               <div className="space-y-3">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-primary/40 italic">Relationship</label>
                                   <select value={ref.relation} onChange={(e) => updateRef(i, "relation", e.target.value)} className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-4 font-bold text-primary italic">
                                       <option>Former Employer</option>
                                       <option>Mentor</option>
                                       <option>Colleague</option>
                                   </select>
                               </div>
                               <div className="space-y-3 md:col-span-2">
                                   <label className="text-[9px] font-black uppercase tracking-widest text-primary/40 italic">Contact Email</label>
                                   <input value={ref.email} onChange={(e) => updateRef(i, "email", e.target.value)} type="email" className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-4 font-bold text-primary italic" />
                               </div>
                           </div>
                        </div>
                    ))}
                    
                    <button onClick={addRef} type="button" className="group flex items-center gap-4 text-primary font-black uppercase tracking-widest text-[10px] bg-white border border-outline-variant/10 px-8 py-5 rounded-[2rem] hover:shadow-2xl transition-all italic">
                        <MaterialIcon name="add_circle" className="text-xl group-hover:rotate-90 transition-transform" />
                        Add another reference
                    </button>

                    <div className="pt-8 flex justify-between items-center">
                        <button onClick={onBack} className="text-on-surface-variant/40 font-black uppercase tracking-widest text-[10px] underline italic">Save draft</button>
                        <button 
                            onClick={() => onNext(refs)}
                            disabled={refs.length < 2 || !refs[0].email || !refs[1].email || isSubmitting}
                            className="bg-primary text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isSubmitting ? "Broadcasting Indvites..." : "Submit for Verification"}
                        </button>
                    </div>
                </div>

                <div className="lg:col-span-4 self-start">
                     <div className="bg-surface-container-low border border-outline-variant/10 p-10 rounded-[3rem] space-y-8">
                        <h4 className="font-headline font-black italic text-primary tracking-tight">Verification Logic</h4>
                        <div className="space-y-6">
                            {[
                                { t: "Email Sent", d: "Direct survey link dispatched", active: true },
                                { t: "Digital Interview", d: "Mobile-first vetting flow", active: false },
                                { t: "Authenticity", d: "Domain verification matched", active: false },
                            ].map((step, idx) => (
                                <div key={idx} className={cn("flex items-start gap-4", step.active ? "" : "opacity-30")}>
                                    <MaterialIcon name={step.active ? "check_circle" : "pending"} className={step.active ? "text-green-500" : ""} />
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary italic">{step.t}</div>
                                        <div className="text-[9px] font-medium text-on-surface-variant italic">{step.d}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
}

function ReviewStep({ data, onSubmit, onBack, isSubmitting }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-16 pb-20">
             <header className="text-center">
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 5 of 5</span>
                <h1 className="text-5xl md:text-7xl font-headline font-black text-primary mb-6 leading-tight tracking-tighter italic">Review & Submit</h1>
                <p className="text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed font-medium italic opacity-80">Please review your dossier. Once submitted, your application will enter our vetting queue.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-white rounded-[3rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 space-y-6">
                    <div className="flex items-center gap-4 text-primary opacity-40 mb-2">
                        <MaterialIcon name="badge" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Identity Assets</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {["Front ID", "Back ID", "Live Selfie"].map(s => (
                            <div key={s} className="bg-surface-container-low rounded-2xl h-16 flex items-center justify-center border border-outline-variant/10">
                                <MaterialIcon name="image" className="text-primary/10" />
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-green-600 italic">✓ Encrypted and Ready</p>
                </div>

                <div className="p-10 bg-white rounded-[3rem] shadow-2xl shadow-primary/5 border border-outline-variant/10 space-y-6">
                    <div className="flex items-center gap-4 text-primary opacity-40 mb-2">
                        <MaterialIcon name="groups" />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Professional Network</span>
                    </div>
                    <p className="font-headline text-xl font-black italic text-primary">2 References Logged</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 italic leading-relaxed">Invitations will be sent immediately upon submission.</p>
                </div>
            </div>

            <div className="p-12 p-10 bg-primary rounded-[3.5rem] shadow-2xl shadow-primary/20 text-white relative overflow-hidden group">
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="max-w-md">
                        <h3 className="text-3xl font-headline font-black italic tracking-tight mb-4 leading-none">Final Checkpoint</h3>
                        <p className="text-blue-100/60 text-xs font-medium italic leading-relaxed">By submitting, you confirm all data is accurate. Vetting takes 3-5 business days.</p>
                    </div>
                    <button 
                        onClick={onSubmit}
                        disabled={isSubmitting}
                        className="bg-white text-primary px-16 py-8 rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all text-center italic"
                    >
                        {isSubmitting ? "Finalizing Dossier..." : "Submit to Kindred Vetting"}
                    </button>
                </div>
                <MaterialIcon name="approval" className="absolute -bottom-10 -left-10 text-[12rem] opacity-5 group-hover:-rotate-6 transition-transform duration-700" fill />
            </div>

            <button onClick={onBack} className="w-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-colors cursor-pointer italic underline">Edit my application</button>
        </div>
    );
}
