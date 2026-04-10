"use client";

import { useState, useEffect, useCallback } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { updateNannyProfile } from "./actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

import { MediaUploadModal } from "./components/MediaUploadModal";
import { IdentityMediaStep } from "./steps/IdentityMediaStep";
import { ExperienceRatesStep } from "./steps/ExperienceRatesStep";
import { UploadTips } from "./components/UploadTips";

interface UploadStatus {
  id: string;
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  fileName: string;
}

interface ProfileWizardProps {
  initialData: any;
}

const STEPS = [
  { id: "media-bio", label: "Media & Bio", icon: "perm_media" },
  { id: "experience-rates", label: "Experience & Rates", icon: "payments" },
];

export function ProfileWizard({ initialData }: ProfileWizardProps) {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [profile, setProfile] = useState({
    ...initialData,
    availability: initialData.availability || {},
    coreSkills: initialData.coreSkills || [],
    specializations: initialData.specializations || [],
    logistics: initialData.logistics || [],
    photos: initialData.photos || [],
  });
  const [isSaving, setIsSaving] = useState(false);

  // ... (Upload logic omitted for brevity, keeping same)
  const [uploads, setUploads] = useState<UploadStatus[]>([]);
  const [modalConfig, setModalConfig] = useState<{ 
    isOpen: boolean; 
    title: string; 
    acceptedTypes: string; 
    isVideo?: boolean; 
    isMulti?: boolean;
    replaceIndex?: number;
    onComplete: (urls: string[]) => void 
  }>({
    isOpen: false, title: "", acceptedTypes: "", onComplete: () => {}
  });

  // Background Upload Logic
  const startUpload = useCallback(async (file: File, isVideo?: boolean, replaceIndex?: number) => {
    const uploadId = Math.random().toString(36).substring(7);
    const newUpload: UploadStatus = {
        id: uploadId,
        name: file.name,
        progress: 0,
        status: "uploading",
        fileName: file.name
    };

    setUploads(prev => [...prev, newUpload]);

    return new Promise<string>((resolve, reject) => {
        const formData = new FormData();
        formData.append("file", file);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload/multipart");

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100);
                setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, progress: percent } : u));
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                const res = JSON.parse(xhr.responseText);
                setUploads((prev: any) => prev.map((u: any) => u.id === uploadId ? { ...u, status: "done", progress: 100 } : u));
                
                // Automatically update profile data based on type
                if (isVideo) {
                    setProfile((prev: any) => ({ ...prev, videoUrl: res.publicUrl }));
                } else if (replaceIndex !== undefined) {
                    setProfile((prev: any) => {
                        const newPhotos = [...prev.photos];
                        newPhotos[replaceIndex] = res.publicUrl;
                        return { ...prev, photos: newPhotos };
                    });
                } else {
                    setProfile((prev: any) => ({ ...prev, photos: [...prev.photos, res.publicUrl].slice(0, 5) }));
                }
                
                resolve(res.publicUrl);
                setTimeout(() => {
                    setUploads((prev: any) => prev.filter((u: any) => u.id !== uploadId));
                }, 3000);
            } else {
                setUploads((prev: any) => prev.map((u: any) => u.id === uploadId ? { ...u, status: "error" } : u));
                reject(new Error("Upload failed"));
            }
        };

        xhr.onerror = () => {
            setUploads(prev => prev.map(u => u.id === uploadId ? { ...u, status: "error" } : u));
            reject(new Error("Network error"));
        };

        xhr.send(formData);
    });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (uploads.some(u => u.status === "uploading")) {
            e.preventDefault();
            e.returnValue = "";
        }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uploads]);

  const handleUpdate = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: "coreSkills" | "specializations" | "logistics", item: string) => {
    setProfile((prev: any) => {
      const arr = prev[field] || [];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter((i: string) => i !== item) };
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const calculateCompletion = () => {
    let score = 0;
    const totalPossiblePoints = 100;
    
    if (profile.fullName) score += 10;
    if (profile.profileImageUrl) score += 10;
    if (profile.bio && profile.bio.length > 50) score += 15;
    if (profile.photos && profile.photos.length >= 3) score += 20;
    else if (profile.photos && profile.photos.length > 0) score += 10;
    
    if (profile.hourlyRate) score += 5;
    if (profile.experienceYears) score += 10;
    if (profile.location) score += 10;
    if (profile.coreSkills && profile.coreSkills.length > 0) score += 15;
    if (profile.videoUrl) score += 5;
    
    return Math.min(score, totalPossiblePoints);
  };

  const handleSave = async (isFinal: boolean = false) => {
    if (isFinal) {
      const score = calculateCompletion();
      if (score < 80) {
        if (!confirm(`Your profile is currently ${score}% complete. Profiles under 80% are rarely selected. Publish anyway?`)) {
          return;
        }
      }
    }

    const cleanUrl = (url: any) => {
      if (typeof url !== "string" || url.includes("undefined/profiles/")) return undefined;
      return url;
    };

    setIsSaving(true);
    try {
      await updateNannyProfile({
        fullName: profile.fullName,
        profileImageUrl: cleanUrl(profile.profileImageUrl),
        bio: profile.bio ?? undefined,
        hourlyRate: String(profile.hourlyRate ?? "35"),
        weeklyRate: String(profile.weeklyRate ?? "1200"),
        experienceYears: profile.experienceYears ?? undefined,
        location: profile.location ?? undefined,
        latitude: profile.latitude,
        longitude: profile.longitude,
        education: profile.education ?? undefined,
        coreSkills: profile.coreSkills,
        specializations: profile.specializations,
        videoUrl: cleanUrl(profile.videoUrl),
        availability: profile.availability,
        logistics: profile.logistics,
        photos: profile.photos,
        hasCar: profile.hasCar,
        carDescription: profile.carDescription,
        detailedExperience: profile.detailedExperience,
        maxTravelDistance: profile.maxTravelDistance,
      });

      if (isFinal) {
        showToast("Profile live on the marketplace!", "success");
        router.push("/dashboard/nanny/profile");
      } else {
        showToast("Draft secured in the cloud.", "success");
        setCurrentStepIdx(prev => prev + 1);
      }
    } catch (err: any) {
      showToast(err.message || "Network synchronization failed.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const currentStep = STEPS[currentStepIdx].id;
  const completionPercent = calculateCompletion();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "media-bio":
        return <IdentityMediaStep profile={profile} handleUpdate={handleUpdate} setModalConfig={setModalConfig} />;
      case "experience-rates":
        return <ExperienceRatesStep profile={profile} handleUpdate={handleUpdate} handleArrayToggle={handleArrayToggle as any} />;
    }
  };

  const activeUploads = uploads.filter(u => u.status === "uploading");
  const totalProgress = activeUploads.length > 0 
    ? Math.round(activeUploads.reduce((acc, u) => acc + u.progress, 0) / activeUploads.length)
    : 0;

  return (
    <>
      <MediaUploadModal 
        {...modalConfig} 
        onClose={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))} 
        startUpload={startUpload}
      />

      {/* Global Background Uploader Hub */}
      {activeUploads.length > 0 && (
          <div className="fixed top-0 left-0 w-full z-[100] animate-in slide-in-from-top duration-500">
              <div className="bg-primary text-white px-6 py-3 flex items-center justify-between shadow-2xl">
                  <div className="flex items-center gap-4">
                      <div className="relative w-8 h-8 flex items-center justify-center">
                          <div className="absolute inset-0 border-2 border-white/20 rounded-full"></div>
                          <div 
                            className="absolute inset-0 border-2 border-white rounded-full transition-all duration-500"
                            style={{ clipPath: `inset(${100 - totalProgress}% 0 0 0)` }}
                          ></div>
                          <span className="text-[10px] font-black">{activeUploads.length}</span>
                      </div>
                      <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">
                               Media Syncing
                          </span>
                          <span className="text-[9px] opacity-70 font-medium italic">Your progress is being cached...</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-6">
                      <div className="text-sm font-black italic tracking-tighter">{totalProgress}%</div>
                  </div>
              </div>
          </div>
      )}

      <div className="w-full py-2 px-4 md:px-10 mb-32">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
           <div className="flex-1">
              <h1 className="font-headline text-5xl font-black text-primary tracking-tighter mb-4 italic leading-none">Core Care Credentials</h1>
              <div className="flex items-center gap-4">
                 <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
                    <div 
                      className={cn("h-full transition-all duration-1000", completionPercent > 80 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : "bg-primary")} 
                      style={{ width: `${completionPercent}%` }} 
                    />
                 </div>
                 <span className="text-xl font-black text-primary tracking-tighter w-12">{completionPercent}%</span>
              </div>
           </div>
        </div>

        <div className="relative mb-20 px-8 flex justify-center">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
           <div className="flex justify-between items-center relative gap-20">
              {STEPS.map((step, idx) => {
                 const isActive = currentStepIdx === idx;
                 const isCompleted = idx < currentStepIdx;
                 return (
                    <div key={step.id} className="flex flex-col items-center gap-3">
                       <button 
                         onClick={() => { if(idx < currentStepIdx) setCurrentStepIdx(idx) }}
                         className={cn(
                           "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 font-black text-sm relative",
                           isActive ? "bg-primary text-white border-primary shadow-2xl scale-125 z-10" : 
                           isCompleted ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-300 border-slate-100"
                         )}
                       >
                          {isCompleted ? <MaterialIcon name="check" className="text-lg" /> : <MaterialIcon name={step.icon} className="text-lg" fill={isActive} />}
                       </button>
                       <span className={cn(
                          "absolute top-16 whitespace-nowrap text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                          isActive ? "text-primary opacity-100" : "text-slate-400 opacity-40"
                       )}>{step.label}</span>
                    </div>
                 )
              })}
           </div>
        </div>

        <div className="bg-surface-container-low/50 rounded-[3.5rem] p-4 md:p-10 min-h-[500px]">
           {renderCurrentStep()}
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-outline-variant/10">
           <button 
              disabled={currentStepIdx === 0 || isSaving}
              onClick={() => setCurrentStepIdx(prev => prev - 1)}
              className="px-10 py-5 w-full md:w-auto rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-0 active:scale-95"
           >
              <MaterialIcon name="arrow_back" /> Back
           </button>

           {currentStepIdx < STEPS.length - 1 ? (
             <button 
                onClick={() => handleSave(false)}
                disabled={isSaving}
                className="px-12 py-5 w-full md:w-auto bg-primary text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
             >
                {isSaving ? "Securing Draft..." : "Save & Continue"} <MaterialIcon name="arrow_forward" />
             </button>
           ) : (
             <button 
                onClick={() => handleSave(true)}
                disabled={isSaving}
                className="px-16 py-6 w-full md:w-auto bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-[2.5rem] flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
             >
                {isSaving ? "Finalizing Profile..." : "Publish Professional Showcase"} <MaterialIcon name="bolt" fill />
             </button>
           )}
        </div>
      </div>
    </>
  );
}
