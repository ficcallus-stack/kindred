"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
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

const DRAFT_KEY = "kindred_verif_draft";

export default function VerificationWizard({ initialData, user }: VerificationWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialData?.verification?.currentStep || 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // States that we might persist locally
  const [verifData, setVerifData] = useState(initialData?.verification || {});
  const [profileData, setProfileData] = useState(initialData?.profile || {});
  const [hasLoadedDraft, setHasLoadedDraft] = useState(false);

  useEffect(() => {
     if (typeof window !== "undefined") {
         const draft = localStorage.getItem(DRAFT_KEY);
         if (draft && !hasLoadedDraft) {
             try {
                const parsed = JSON.parse(draft);
                // We don't restore files, but we can restore text inputs
                if (parsed.profile) setProfileData((prev: any) => ({ ...prev, ...parsed.profile }));
                if (parsed.ssn) setVerifData((prev: any) => ({ ...prev, ssnDraft: parsed.ssn }));
                if (parsed.refs) setVerifData((prev: any) => ({ ...prev, references: parsed.refs }));
             } catch(e) {}
             setHasLoadedDraft(true);
         }
     }
  }, [hasLoadedDraft]);

  const saveDraft = (key: string, value: any) => {
      if (typeof window !== "undefined") {
          const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}");
          draft[key] = value;
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      }
  };

  const clearDraft = () => {
      if (typeof window !== "undefined") {
          localStorage.removeItem(DRAFT_KEY);
      }
  }

  const trustScore = 250 + (currentStep > 1 ? 200 : 0) + (currentStep > 2 ? 300 : 0) + (currentStep > 3 ? 150 : 0);

  const nextStep = () => setCurrentStep((prev: number) => Math.min(prev + 1, 4));
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

        <nav className="flex flex-col gap-1.5 p-2 bg-surface-container-low/50 rounded-[2.5rem] border border-outline-variant/10 relative overflow-hidden">
          {[
            { id: 1, label: "Legal Identity", icon: "badge" },
            { id: 2, label: "Background Auth", icon: "verified_user" },
            { id: 3, label: "Digital References", icon: "group" },
            { id: 4, label: "Final Review", icon: "fact_check" },
          ].map((step) => (
            <div 
              key={step.id}
              className={cn(
                "p-4 flex items-center gap-4 rounded-[1.5rem] transition-all cursor-pointer relative z-10",
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

        <Link href="/dashboard/messages?tab=support" className="mt-4 flex items-center gap-3 p-4 rounded-[1.5rem] border border-outline-variant/10 text-primary hover:bg-surface-container-low transition-colors text-[10px] font-black uppercase tracking-widest italic group">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MaterialIcon name="help" className="text-sm" />
            </div>
            Need Concierge Help?
        </Link>
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
                verifData={verifData}
                saveDraft={saveDraft}
            />
        )}
        {currentStep === 3 && (
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
                saveDraft={saveDraft}
            />
        )}
        {currentStep === 4 && (
            <ReviewStep 
                data={verifData}
                onBack={prevStep}
                onSubmit={async () => {
                   setIsSubmitting(true);
                   await finalizeVerification();
                   clearDraft();
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

// ── Shared Video Recorder ──────────────────────────────────────

function VideoSelfieRecorder({ onCapture }: { onCapture: (file: File) => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recording, setRecording] = useState(false);
    const [timeLeft, setTimeLeft] = useState(5);
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [camError, setCamError] = useState<string | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isFallbackRef = useRef(false);

    const handleFallbackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        isFallbackRef.current = true;
        setCamError(null);
        setVideoSrc(URL.createObjectURL(file));
        onCapture(file);
    };

    const startCamera = async () => {
        setIsRequesting(true);
        setCamError(null);
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
            setStream(s);
            if (videoRef.current) {
                videoRef.current.srcObject = s;
            }
        } catch (e: any) {
            console.error("Camera access denied or failed", e);
            if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
                 setCamError("permission_denied");
            } else if (e.name === 'NotReadableError' || e.name === 'TrackStartError') {
                 setCamError("in_use");
            } else {
                 setCamError("not_found");
            }
        } finally {
            setIsRequesting(false);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const startRecording = () => {
        if (!stream) return;
        chunksRef.current = [];
        const mimeType = MediaRecorder.isTypeSupported('video/webm') ? 'video/webm' : 'video/mp4';
        const mr = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mr;

        mr.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        mr.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            const url = URL.createObjectURL(blob);
            setVideoSrc(url);
            const file = new File([blob], `selfie.${mimeType === 'video/webm' ? 'webm' : 'mp4'}`, { type: mimeType });
            onCapture(file);
            stopCamera();
        };

        mr.start();
        setRecording(true);
        setTimeLeft(5);

        let t = 4;
        const intv = setInterval(() => {
            setTimeLeft(t);
            if (t <= 0) {
                clearInterval(intv);
                mr.stop();
                setRecording(false);
            }
            t--;
        }, 1000);
    };

    const reset = () => {
        setVideoSrc(null);
        setRecording(false);
        setTimeLeft(5);
        startCamera();
    };

    useEffect(() => {
        return () => stopCamera();
    }, []);

    if (videoSrc) {
        return (
            <div className="relative w-full aspect-[3/4] md:aspect-video bg-black rounded-[2.5rem] overflow-hidden group">
                <video 
                    src={videoSrc} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover" 
                    onLoadedMetadata={(e) => {
                        if (isFallbackRef.current) {
                            const duration = e.currentTarget.duration;
                            if (duration && (duration < 4 || duration > 15)) {
                                setVideoSrc(null);
                                setCamError("invalid_duration");
                                isFallbackRef.current = false;
                            }
                        }
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8 text-center">
                    <button type="button" onClick={reset} className="bg-white text-primary px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all w-fit mx-auto shadow-xl">
                        Retake Video
                    </button>
                </div>
            </div>
        );
    }

    if (camError) {
        return (
             <div className="w-full aspect-[3/4] md:aspect-video bg-error-container/20 rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-error/30 p-8 text-center">
                  <MaterialIcon name="videocam_off" className="text-error text-5xl mb-4" />
                  <h4 className="font-headline font-black text-error mb-2 italic">Camera Access Required</h4>
                  <p className="text-xs text-on-surface-variant max-w-xs leading-relaxed font-medium mb-6">
                      {camError === "permission_denied" 
                          ? "Please click the lock icon in your browser's address bar to allow camera permissions for KindredCare (you may need to ensure your camera isn't actively being used by another window or settings popup)." 
                          : camError === "in_use"
                          ? "Your camera is currently in use by another app or browser tab. Please close other camera views and try again."
                          : camError === "invalid_duration"
                          ? "The uploaded video must be between 5 and 10 seconds long. Please try a different file."
                          : "We couldn't detect a working camera on your device. Please ensure it's connected and not used by another app."}
                  </p>
                  <div className="flex flex-col gap-3">
                      <button type="button" onClick={startCamera} className="bg-white border border-outline-variant/20 text-primary px-8 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-surface-container-low active:scale-95 transition-all shadow-sm">
                          Try Again
                      </button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-primary font-black uppercase tracking-widest text-[10px] hover:underline italic">
                          Upload Video Instead
                      </button>
                      <input type="file" accept="video/*" ref={fileInputRef} className="hidden" onChange={handleFallbackUpload} />
                  </div>
             </div>
        );
    }

    if (!stream) {
        return (
             <div className="w-full aspect-[3/4] md:aspect-video bg-surface-container-low rounded-[2.5rem] flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 group hover:border-primary transition-all">
                  {isRequesting ? (
                      <div className="flex flex-col items-center">
                          <span className="relative flex h-12 w-12 mb-4">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-40"></span>
                              <span className="relative inline-flex rounded-full h-12 w-12 bg-primary/20 flex items-center justify-center">
                                  <MaterialIcon name="settings_voice" className="text-primary text-xl animate-pulse" />
                              </span>
                          </span>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Requesting Access...</p>
                      </div>
                  ) : (
                      <>
                          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl shadow-black/5 mb-6 group-hover:scale-110 transition-transform">
                              <MaterialIcon name="videocam" className="text-secondary text-2xl" />
                          </div>
                          <button type="button" onClick={startCamera} className="bg-primary text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">
                              Enable Camera
                          </button>
                      </>
                  )}
             </div>
        );
    }

    return (
        <div className="relative w-full aspect-[3/4] md:aspect-video bg-black rounded-[2.5rem] overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
            
            {/* Guide Reticle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-64 border-2 border-dashed border-white/40 rounded-[40%] animate-pulse" />
            </div>

            <div className="absolute top-6 left-0 right-0 text-center pointer-events-none">
                <p className="inline-block bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {recording ? (
                         <span className="text-error flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                             Recording ({timeLeft}s)
                         </span>
                    ) : (
                        "Position face in oval"
                    )}
                </p>
            </div>

            {!recording && (
                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                    <button type="button" onClick={startRecording} className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-[6px] border-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform group">
                        <div className="w-12 h-12 bg-error rounded-full group-hover:scale-90 transition-transform" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ── Step Components ───────────────────────────────────────────

function IdentityStep({ user, onNext, isSubmitting }: any) {
    const [front, setFront] = useState<File | null>(null);
    const [back, setBack] = useState<File | null>(null);
    const [selfie, setSelfie] = useState<File | null>(null);
    
    // Create object URLs securely
    const frontUrl = useMemo(() => front ? URL.createObjectURL(front) : null, [front]);
    const backUrl = useMemo(() => back ? URL.createObjectURL(back) : null, [back]);

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
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 1 of 4</span>
                <h1 className="text-5xl md:text-6xl font-headline font-black text-primary mb-6 leading-tight tracking-tighter italic">Identity Verification</h1>
                <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-medium italic opacity-80">
                    To ensure the safety of our community, please provide your legal identification details. Your data is encrypted and handled with boutique-level care.
                </p>
                <div className="absolute -top-12 -right-12 w-48 h-48 bg-secondary-fixed/5 blur-[100px] rounded-full -z-10" />
            </header>

            <section className="bg-primary/5 rounded-[3rem] p-8 md:p-12 border border-primary/10 flex flex-col md:flex-row gap-10 items-center overflow-hidden relative group">
               <div className="flex-1 space-y-4 relative z-10">
                   <div className="inline-flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm italic">
                       <MaterialIcon name="verified_user" className="text-sm" />
                       AES-256 Encryption
                   </div>
                   <h3 className="text-3xl font-headline font-black text-primary italic tracking-tight">Kindred Secure Vault</h3>
                   <p className="text-on-surface-variant font-medium leading-relaxed italic opacity-80 max-w-sm">
                       Your documents are encrypted end-to-end. We only use this information to verify your identity with government databases and do not share it with families.
                   </p>
               </div>
               <div className="w-48 h-48 md:w-64 md:h-64 relative z-10 shrink-0">
                    {/* Placeholder for secure_document_illustration, ensuring it maps correctly to the generated aesthetic */}
                    <img src="https://images.unsplash.com/photo-1614064641936-3b9e4ec4b341?auto=format&fit=crop&q=80&w=800" alt="Secure Encryption" className="w-full h-full object-cover rounded-[2rem] shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-700 mixture-blend-multiply" />
               </div>
               <MaterialIcon name="lock" className="absolute -bottom-10 -left-10 text-[15rem] opacity-[0.03] group-hover:-rotate-12 transition-transform duration-1000" fill />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 border border-outline-variant/10 relative group">
                    <label className="block">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">
                            Full Legal Name <span className="text-error">*</span>
                            <MaterialIcon name="info" className="text-sm opacity-40 ml-auto group-hover:opacity-100 transition-opacity cursor-help" />
                        </span>
                        <input name="fullName" required defaultValue={user?.fullName} className="w-full bg-surface-container-low/50 border-none rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-primary italic" />
                    </label>
                </div>
                <div className="p-10 bg-white rounded-[2.5rem] shadow-xl shadow-primary/5 border border-outline-variant/10 relative group">
                    <label className="block">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-4 italic">
                            Date of Birth <span className="text-error">*</span>
                            <MaterialIcon name="info" className="text-sm opacity-40 ml-auto group-hover:opacity-100 transition-opacity cursor-help" />
                        </span>
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
                        front ? "border-primary bg-primary/5" : "hover:bg-white hover:shadow-2xl hover:border-primary/50"
                    )}>
                        <input type="file" accept="image/*" disabled={isSubmitting} className="hidden" onChange={(e) => setFront(e.target.files?.[0] || null)} />
                        {frontUrl && <img src={frontUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply transition-all group-hover:scale-105 group-hover:opacity-40" alt="Front ID Preview" />}
                        {isSubmitting ? (
                             <div className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg mb-4 z-10 relative">
                                 <MaterialIcon name="refresh" className="text-4xl text-primary animate-spin" />
                             </div>
                        ) : (
                             <MaterialIcon name={front ? "check_circle" : "file_upload"} className={cn("text-5xl mb-4 transition-transform group-hover:-translate-y-2 z-10 relative", front ? "text-primary" : "text-primary/20")} />
                        )}
                        <span className="font-bold text-primary uppercase tracking-widest text-[10px] italic z-10 relative px-4 py-2 bg-white/70 backdrop-blur-md rounded-full shadow-sm">
                             {isSubmitting ? "Uploading Front..." : front ? front.name : "Upload ID Front"}
                        </span>
                    </label>
                    <label className={cn(
                        "relative group h-72 bg-surface-container-low rounded-[2.5rem] border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden",
                        back ? "border-primary bg-primary/5" : "hover:bg-white hover:shadow-2xl hover:border-primary/50"
                    )}>
                        <input type="file" accept="image/*" disabled={isSubmitting} className="hidden" onChange={(e) => setBack(e.target.files?.[0] || null)} />
                        {backUrl && <img src={backUrl} className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-multiply transition-all group-hover:scale-105 group-hover:opacity-40" alt="Back ID Preview" />}
                        {isSubmitting ? (
                             <div className="bg-white/80 backdrop-blur-md p-4 rounded-full shadow-lg mb-4 z-10 relative">
                                 <MaterialIcon name="refresh" className="text-4xl text-primary animate-spin" />
                             </div>
                        ) : (
                             <MaterialIcon name={back ? "check_circle" : "file_upload"} className={cn("text-5xl mb-4 transition-transform group-hover:-translate-y-2 z-10 relative", back ? "text-primary" : "text-primary/20")} />
                        )}
                        <span className="font-bold text-primary uppercase tracking-widest text-[10px] italic z-10 relative px-4 py-2 bg-white/70 backdrop-blur-md rounded-full shadow-sm">
                             {isSubmitting ? "Uploading Back..." : back ? back.name : "Upload ID Back"}
                        </span>
                    </label>
                </div>
            </section>

            <section className="space-y-8 pt-8 border-t border-outline-variant/10">
                <div>
                     <h3 className="text-3xl font-headline font-black text-primary italic tracking-tight flex items-center gap-4 mb-2">
                        Live Video Selfie
                        <span className="text-error text-sm">*</span>
                    </h3>
                    <p className="text-on-surface-variant font-medium leading-relaxed italic opacity-80 max-w-2xl">
                        To prevent identity fraud, please record a short 5-10 second video. Ensure your face is centered, well-lit, and completely visible. Hats and sunglasses must be removed.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 bg-white p-8 md:p-12 rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-outline-variant/10">
                     <div className="md:col-span-7 flex items-center justify-center">
                         <div className="w-full max-w-sm">
                            <VideoSelfieRecorder onCapture={setSelfie} />
                         </div>
                     </div>
                     <div className="md:col-span-5 space-y-8 flex flex-col justify-center">
                         <div className="space-y-6">
                            {[
                                { t: "Unobstructed Face", i: "face" },
                                { t: "Good Lighting", i: "light_mode" },
                                { t: "5-10 Second Limit", i: "timer" }
                            ].map((rule, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-[1rem] bg-secondary-container text-on-secondary-container flex items-center justify-center">
                                         <MaterialIcon name={rule.i} className="text-sm" />
                                     </div>
                                     <span className="font-black text-primary uppercase text-[10px] tracking-[0.2em] italic">{rule.t}</span>
                                </div>
                            ))}
                         </div>
                         {selfie && (
                             <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100 flex items-center gap-4">
                                 <MaterialIcon name="check_circle" className="text-green-600 text-2xl" />
                                 <div>
                                     <div className="text-[10px] font-black uppercase tracking-widest text-green-800 italic">Video Captured Successfully</div>
                                     <div className="text-xs font-medium text-green-700 italic opacity-80">Ready for upload</div>
                                 </div>
                             </div>
                         )}
                     </div>
                </div>
            </section>

            <div className="pt-12 flex justify-between items-center px-4">
                <p className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest max-w-xs italic leading-relaxed">
                    By continuing, you agree to our Identity Terms. Data is encrypted via Kindred's secure vault.
                </p>
                <button 
                    type="submit"
                    disabled={!front || !back || !selfie || isSubmitting}
                    className="bg-primary text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 group flex items-center gap-4"
                >
                    {isSubmitting ? "Encrypting Docs..." : "Save & Continue"}
                    {!isSubmitting && <MaterialIcon name="arrow_forward" className="group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>
        </form>
    );
}

function BackgroundStep({ user, onNext, onBack, isSubmitting, verifData, saveDraft }: any) {
    const [ssn, setSsn] = useState(verifData?.ssnDraft || "");
    const [signed, setSigned] = useState(false);

    const handleSsnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSsn(val);
        saveDraft("ssn", val);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 space-y-16 pb-20">
             <header className="relative">
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 2 of 4</span>
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
                    <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 3 of 4</span>
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
                <span className="text-secondary font-black text-[10px] uppercase tracking-[0.2em] mb-3 block italic opacity-60">Step 4 of 4</span>
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
