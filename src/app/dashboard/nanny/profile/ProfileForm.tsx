"use client";

import { useState, useRef, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";
import { updateNannyProfile } from "./actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

interface ProfileFormProps {
  initialData: {
    fullName: string;
    profileImageUrl: string;
    location: string | null;
    latitude?: number;
    longitude?: number;
    hourlyRate: string | null;
    experienceYears: number | null;
    bio: string | null;
    photos: string[];
    education: string | null;
    coreSkills: string[];
    specializations: string[];
    videoUrl: string | null;
    availability: any;
    logistics: string[];
  };
}

const STEPS = [
  { id: "personal", label: "Identity & Story", icon: "person" },
  { id: "media", label: "Media Gallery", icon: "image" },
  { id: "expertise", label: "Work & Education", icon: "work" },
  { id: "logistics", label: "Logistics", icon: "calendar_month" },
];

function MediaUploadModal({ 
  isOpen, onClose, onComplete, title, acceptedTypes, isVideo
}: { 
  isOpen: boolean; onClose: () => void; onComplete: (url: string) => void; 
  title: string; acceptedTypes: string; isVideo?: boolean;
}) {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (file) {
      const obj = URL.createObjectURL(file);
      setPreview(obj);
      return () => URL.revokeObjectURL(obj);
    } else {
      setPreview("");
    }
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const publicUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/upload");
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const res = JSON.parse(xhr.responseText);
            resolve(res.publicUrl);
          } else {
            console.error("Upload Error Response:", xhr.responseText);
            reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.statusText}`));
          }
        };

        xhr.onerror = (e) => {
          console.error("XHR Error:", e);
          reject(new Error("Network connection error. Check your internet connection or server logs."));
        };

        xhr.send(formData);
      });

      showToast("Media uploaded successfully!", "success");
      onComplete(publicUrl);
      setFile(null);
      onClose();
    } catch (err: any) {
      showToast(err.message || "Upload error", "error");
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
      <div className="bg-surface w-full max-w-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl relative flex flex-col max-h-[90vh]">
        <button 
           onClick={() => { setFile(null); onClose(); }} 
           className="absolute top-8 right-8 w-12 h-12 bg-surface-container rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
           disabled={isUploading}
        >
           <MaterialIcon name="close" />
        </button>

        <h2 className="text-3xl font-headline font-black text-primary mb-2 italic tracking-tighter">{title}</h2>
        <p className="text-on-surface-variant text-sm mb-8">Select a high-quality file from your device to preview before uploading.</p>

        <div className="flex-1 overflow-y-auto w-full no-scrollbar flex flex-col items-center justify-center min-h-[300px]">
          {!file ? (
            <label className="w-full h-full border-4 border-dashed border-outline-variant/30 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-primary/5 hover:border-primary/50 transition-all p-10 group min-h-[300px]">
               <input type="file" className="hidden" accept={acceptedTypes} onChange={e => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
               }} />
               <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6 text-white">
                  <MaterialIcon name={isVideo ? "videocam" : "photo_camera"} className="text-3xl" />
               </div>
               <span className="text-lg font-black text-primary">Browse Files</span>
               <span className="text-xs uppercase tracking-[0.2em] font-bold text-slate-400 mt-2">Max 50MB</span>
            </label>
          ) : (
            <div className="w-full flex justify-center items-center relative aspect-[4/5] sm:aspect-video rounded-[2rem] overflow-hidden bg-black shadow-inner">
               {isVideo ? (
                 preview && <video src={preview} controls className="w-full h-full object-contain" />
               ) : (
                 preview && <img src={preview} className="w-full h-full object-cover" />
               )}
               {isUploading && (
                 <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center px-10">
                    <p className="text-white text-3xl font-black italic tracking-tighter mb-6">{progress}%</p>
                    <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden shadow-inner">
                       <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                 </div>
               )}
            </div>
          )}
        </div>

        {file && !isUploading && (
           <div className="mt-8 flex justify-between gap-4 pt-8 border-t border-outline-variant/10">
             <button onClick={() => setFile(null)} className="px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Choose Different</button>
             <button onClick={handleUpload} className="px-10 py-4 bg-primary text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-3">
               Start Upload <MaterialIcon name="cloud_upload" className="text-lg" />
             </button>
           </div>
        )}
      </div>
    </div>
  );
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
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

  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; acceptedTypes: string; isVideo?: boolean; onComplete: (url: string) => void }>({
    isOpen: false, title: "", acceptedTypes: "", onComplete: () => {}
  });

  const handleUpdate = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayToggle = (field: "coreSkills" | "specializations" | "logistics", item: string) => {
    setProfile(prev => {
      const arr = prev[field];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter(i => i !== item) };
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const calculateCompletion = () => {
    let score = 0;
    const totalPossiblePoints = 100;
    
    // Major fields (10% Each)
    if (profile.fullName) score += 10;
    if (profile.profileImageUrl) score += 10;
    if (profile.bio && profile.bio.length > 50) score += 15;
    if (profile.photos && profile.photos.length >= 3) score += 20;
    else if (profile.photos && profile.photos.length > 0) score += 10;
    
    if (profile.hourlyRate) score += 10;
    if (profile.experienceYears) score += 10;
    if (profile.location) score += 10;
    if (profile.coreSkills && profile.coreSkills.length > 0) score += 5;
    if (profile.videoUrl) score += 10;
    
    return Math.min(score, totalPossiblePoints);
  };

  const handleSave = async () => {
    const score = calculateCompletion();
    if (score < 80) {
      if (!confirm(`Your profile is currently ${score}% complete. Profiles under 80% are rarely selected by families.\n\nMissing key items: ${score < 50 ? "Bio, Photos" : "Skills / Video"}.\n\nDo you want to publish anyway?`)) {
        return;
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
        hourlyRate: profile.hourlyRate ?? undefined,
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
      });
      showToast("Profile beautifully updated!", "success");
      router.push("/dashboard/nanny/profile");
    } catch (err: any) {
      showToast(err.message || "Failed to update profile.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const currentStep = STEPS[currentStepIdx].id;
  const completionPercent = calculateCompletion();

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "personal":
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
               <div className="md:col-span-4 bg-surface-container-lowest rounded-[2rem] p-6 shadow-sm border border-outline-variant/10 flex flex-col items-center text-center">
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 opacity-60">Profile Headshot</h3>
                  <div className="relative group w-full aspect-square max-w-[200px] mb-6 rounded-full overflow-hidden shadow-2xl border-4 border-white cursor-pointer bg-slate-100" onClick={() => {
                     setModalConfig({
                        isOpen: true,
                        title: "Upload Profile Photo",
                        acceptedTypes: "image/png, image/jpeg, image/webp",
                        onComplete: (url) => handleUpdate("profileImageUrl", url)
                     })
                  }}>
                     <img 
                       src={profile.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`} 
                       className="w-full h-full object-cover group-hover:blur-sm group-hover:scale-110 transition-all duration-500"
                     />
                     <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg text-primary mb-2">
                           <MaterialIcon name="photo_camera" />
                        </div>
                        <span className="text-[10px] font-black uppercase text-white tracking-widest bg-black/50 px-3 py-1 rounded-full">Change</span>
                     </div>
                  </div>
                  <p className="text-xs text-on-surface-variant italic px-4">Families trust profiles with clear, professional portraits.</p>
               </div>

               <div className="md:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 shadow-sm border border-outline-variant/10">
                 <h3 className="font-headline text-2xl font-bold mb-8 text-primary">Basic Credentials</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Full Name</label>
                     <input 
                       className="w-full bg-surface-container-low border border-outline-variant/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/40 focus:border-primary/40 outline-none transition-all font-bold text-primary" 
                       type="text" 
                       value={profile.fullName}
                       onChange={(e) => handleUpdate("fullName", e.target.value)}
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Display Name (Visible)</label>
                     <input 
                       className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-5 py-4 outline-none transition-all font-bold text-slate-400 cursor-not-allowed" 
                       type="text" 
                       value={profile.fullName.split(" ")[0]}
                       disabled
                     />
                   </div>
                   <div className="md:col-span-2 space-y-4 pt-4">
                     <div className="flex justify-between items-end">
                       <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Global Hourly Rate</label>
                       <span className="text-3xl font-black text-primary italic tracking-tighter">${profile.hourlyRate || "0"}<span className="text-xs tracking-normal">/hr</span></span>
                     </div>
                     <input 
                       type="range" min="15" max="150" step="1"
                       className="w-full accent-primary h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
                       value={profile.hourlyRate || 15}
                       onChange={(e) => handleUpdate("hourlyRate", e.target.value)}
                     />
                   </div>
                 </div>
               </div>
            </div>

            <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-sm border border-outline-variant/10">
              <div className="max-w-3xl">
                <h3 className="font-headline text-2xl font-bold mb-2 text-primary">Your Story</h3>
                <p className="text-on-surface-variant mb-6 text-sm">Share your philosophy on childcare and what makes your approach unique.</p>
                <textarea 
                  className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm leading-relaxed text-on-surface-variant min-h-[200px]" 
                  rows={6}
                  placeholder="I believe that every child deserves a nurturing environment..."
                  value={profile.bio || ""}
                  onChange={(e) => handleUpdate("bio", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      
      case "media":
        const slots = Array.from({length: 5}).map((_, i) => profile.photos[i] || null);
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 border border-outline-variant/10 shadow-sm">
               <div className="flex justify-between items-end mb-8">
                 <div>
                   <h3 className="font-headline text-2xl font-bold text-primary mb-1">Photo Gallery</h3>
                   <p className="text-on-surface-variant text-sm">A maximum of 5 images displaying you engaged in childcare activities.</p>
                 </div>
                 <div className="text-sm font-black text-primary bg-primary/5 px-4 py-2 rounded-xl">{profile.photos.length} / 5</div>
               </div>
               
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 {slots.map((url, i) => url ? (
                    <div key={i} className="relative group aspect-[4/5] bg-black rounded-2xl overflow-hidden shadow-inner cursor-pointer" onClick={() => {
                        if (confirm("Remove this image?")) handleUpdate("photos", profile.photos.filter(p => p !== url));
                    }}>
                       <img src={url} className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" />
                       <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <MaterialIcon name="delete" className="text-red-400 text-3xl" />
                       </div>
                    </div>
                 ) : (
                    <div key={`empty-${i}`} onClick={() => {
                        setModalConfig({
                           isOpen: true, title: `Upload Photo ${i+1}`, acceptedTypes: "image/png, image/jpeg, image/webp",
                           onComplete: (newUrl) => handleUpdate("photos", [...profile.photos, newUrl])
                        });
                    }} className="aspect-[4/5] rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/50 hover:text-primary text-slate-400 cursor-pointer transition-all group">
                       <MaterialIcon name="add_circle" className="text-3xl group-hover:scale-125 transition-transform" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add Photo</span>
                    </div>
                 ))}
               </div>
            </div>

            <div className="bg-tertiary-fixed rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
               <div className="relative z-10 flex flex-col md:flex-row gap-10">
                  <div className="flex-1">
                     <h3 className="font-headline text-3xl font-black text-on-tertiary-fixed mb-4 italic tracking-tighter">Video Introduction</h3>
                     <p className="text-sm text-on-tertiary-fixed-variant mb-8 opacity-90 leading-relaxed font-medium">Capture a 30-second reel speaking directly to parents.</p>
                     <button onClick={() => {
                        setModalConfig({
                           isOpen: true, title: "Upload Video Intro", acceptedTypes: "video/mp4, video/quicktime, video/webm", isVideo: true,
                           onComplete: (newUrl) => handleUpdate("videoUrl", newUrl)
                        })
                     }} className="px-8 py-4 bg-tertiary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-tertiary/20 flex items-center gap-3 hover:-translate-y-1 transition-transform">
                        {profile.videoUrl ? "Replace Video" : "Upload Video"} <MaterialIcon name="videocam" />
                     </button>
                  </div>
                  {profile.videoUrl ? (
                     <div className="w-full md:w-80 aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white shrink-0 group">
                        <video src={profile.videoUrl} controls className="w-full h-full object-cover" />
                        <button onClick={() => { if(confirm("Delete intro?")) handleUpdate("videoUrl", ""); }} className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                           <MaterialIcon name="delete" className="text-sm" />
                        </button>
                     </div>
                  ) : (
                     <div className="w-full md:w-80 aspect-[9/16] border-4 border-dashed border-tertiary/20 rounded-3xl flex flex-col items-center justify-center text-tertiary/40 shrink-0 opacity-50 bg-white/10 backdrop-blur-sm">
                        <MaterialIcon name="movie" className="text-6xl mb-4" />
                        <span className="text-[10px] uppercase font-black tracking-widest">No Intro Recorded</span>
                     </div>
                  )}
               </div>
               <MaterialIcon name="local_movies" data-weight="fill" className="absolute -right-10 -bottom-10 text-[300px] text-tertiary pointer-events-none opacity-5 -rotate-12" />
            </div>
          </div>
        );

      case "expertise":
         return (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 shadow-sm border border-outline-variant/10">
               <h3 className="font-headline text-2xl font-bold mb-8 text-primary">Professional Journey</h3>
               <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Total Years of Experience</label>
                    <input 
                      className="w-full bg-surface-container-low border-none rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-xl font-black text-primary max-w-[200px]" 
                      type="number" min="0" max="60"
                      value={profile.experienceYears || 0}
                      onChange={(e) => handleUpdate("experienceYears", parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1 block mb-2">Core Competencies Mastery</label>
                    <div className="flex gap-3 flex-wrap">
                       {["CPR/First Aid", "Newborns", "Montessori", "Reggio Emilia", "Special Needs", "Bilingual", "Sleep Training", "Potty Training", "Culinary Prep", "Water Safety", "Sign Language", "Homeschooling"].map(skill => {
                          const isSelected = profile.coreSkills.includes(skill);
                          return (
                             <button key={skill} onClick={() => handleArrayToggle("coreSkills", skill)} className={cn("px-5 py-3 rounded-[1rem] text-xs font-black border uppercase tracking-widest flex items-center gap-2", isSelected ? "bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105" : "bg-white text-on-surface-variant/60 border-outline-variant/30 hover:border-outline-variant/80 hover:text-primary")}>
                                {skill} {isSelected && <MaterialIcon name="verified" className="text-[14px]" fill />}
                             </button>
                          );
                       })}
                    </div>
                  </div>
               </div>
             </div>
          </div>
        );

      case "logistics":
         return (
           <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 shadow-sm border border-outline-variant/10 space-y-8">
                 <h3 className="font-headline text-xl font-bold text-primary">Location Protocol</h3>
                 <div className="relative">
                   <MaterialIcon name="map" className="absolute left-5 top-1/2 -translate-y-1/2 text-primary z-10" />
                   <MapboxAutocomplete initialLocation={profile.location || ""} onSelect={(loc, lat, lng) => { handleUpdate("location", loc); handleUpdate("latitude", lat); handleUpdate("longitude", lng); }} placeholder="e.g. Boston, MA" inputClassName="w-full bg-surface-container-low border-none rounded-xl pl-14 pr-5 py-4 outline-none text-sm font-bold text-primary shadow-inner" />
                 </div>
               </div>
               <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-10 shadow-sm border border-outline-variant/10">
                 <h3 className="font-headline text-xl font-bold text-primary mb-8">Target Demographics</h3>
                 <div className="flex flex-col gap-2">
                    {["Newborns (0-3m)", "Infants (3-12m)", "Toddlers (1-3y)", "Preschool (3-5y)", "School Age (5+)"].map(age => {
                       const isSelected = profile.specializations.includes(age);
                       return (
                          <button key={age} onClick={() => handleArrayToggle("specializations", age)} className={cn("px-6 py-4 rounded-xl text-xs font-black border flex items-center justify-between", isSelected ? "bg-secondary-fixed/50 text-secondary border-secondary/50 shadow-sm" : "bg-white text-on-surface-variant/60 border-outline-variant/30")}>
                             <span className="uppercase tracking-widest">{age}</span>
                             <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors", isSelected ? "border-secondary bg-secondary text-white" : "border-slate-300 bg-transparent")}>
                                {isSelected && <MaterialIcon name="check" className="text-[14px] font-bold" />}
                             </div>
                          </button>
                       )
                    })}
                 </div>
               </div>
             </div>
           </div>
         );
    }
  };

  return (
    <>
      <MediaUploadModal 
        {...modalConfig} 
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))} 
      />

      <div className="max-w-4xl mx-auto py-2 mb-32">
        {/* Header with Completion */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
           <div className="flex-1">
              <h1 className="font-headline text-5xl font-black text-primary tracking-tighter mb-4 italic leading-none">Profile Wizard</h1>
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

        {/* Horizontal Node Stepper */}
        <div className="relative mb-20 px-8">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 -z-10"></div>
           <div className="flex justify-between items-center relative">
              {STEPS.map((step, idx) => {
                 const isActive = currentStepIdx === idx;
                 const isCompleted = idx < currentStepIdx;
                 return (
                    <div key={step.id} className="flex flex-col items-center gap-3">
                       <button 
                         onClick={() => setCurrentStepIdx(idx)}
                         className={cn(
                           "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 font-black text-sm relative",
                           isActive ? "bg-primary text-white border-primary shadow-2xl shadow-primary/30 scale-125 z-10" : 
                           isCompleted ? "bg-emerald-500 text-white border-emerald-500" : "bg-white text-slate-400 border-slate-100"
                         )}
                       >
                          {isCompleted ? <MaterialIcon name="check" className="text-lg" /> : <MaterialIcon name={step.icon} className="text-lg" fill={isActive} />}
                       </button>
                       <span className={cn(
                          "absolute top-14 whitespace-nowrap text-[8px] font-black uppercase tracking-[0.2em] transition-all",
                          isActive ? "text-primary opacity-100 scale-110" : "text-slate-400 opacity-40"
                       )}>{step.label}</span>
                    </div>
                 )
              })}
           </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-surface-container-low/50 rounded-[3rem] p-4 md:p-10 min-h-[500px]">
           {renderCurrentStep()}
        </div>

        {/* Navigation Actions */}
        <div className="mt-12 flex justify-between items-center pt-10 border-t border-outline-variant/10">
           <button 
              disabled={currentStepIdx === 0}
              onClick={() => setCurrentStepIdx(prev => prev - 1)}
              className="px-10 py-5 rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all disabled:opacity-0 active:scale-95"
           >
              <MaterialIcon name="arrow_back" /> Back
           </button>

           {currentStepIdx < STEPS.length - 1 ? (
             <button 
                onClick={() => setCurrentStepIdx(prev => prev + 1)}
                className="px-12 py-5 bg-primary text-white rounded-2xl flex items-center gap-3 font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
             >
                Next Step <MaterialIcon name="arrow_forward" />
             </button>
           ) : (
             <button 
                onClick={handleSave}
                disabled={isSaving}
                className="px-12 py-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-[2rem] flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-emerald-500/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
             >
                {isSaving ? "Finalizing..." : "Final Publish"} <MaterialIcon name="bolt" fill />
             </button>
           )}
        </div>
      </div>
    </>
  );
}
