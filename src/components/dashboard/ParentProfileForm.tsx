"use client";

import { useState, useRef, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";
import { uploadFile } from "@/lib/actions/upload";
import { updateParentProfileAction } from "@/lib/actions/parent-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ParentProfileFormProps {
  initialProfile: {
    familyName: string;
    bio: string;
    philosophy: string;
    location: string;
    familyPhoto: string;
  };
  userId: string;
  onSuccess?: () => void;
}

export default function ParentProfileForm({ initialProfile, userId, onSuccess }: ParentProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialProfile);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const uploadPromiseRef = useRef<Promise<string> | null>(null);

  // Clean up local preview URL to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewPhoto) URL.revokeObjectURL(previewPhoto);
    };
  }, [previewPhoto]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Instant Local Preview
    const localUrl = URL.createObjectURL(file);
    setPreviewPhoto(localUrl);

    // 2. Background Upload (using existing multipart endpoint)
    const uploadFn = async () => {
      setUploading(true);
      try {
        const data = new FormData();
        data.append("file", file);
        const response = await fetch("/api/upload/multipart", {
          method: "POST",
          body: data,
        });
        
        if (!response.ok) throw new Error("Upload failed");
        const res = await response.json();
        
        if (res.publicUrl) {
          setFormData(prev => ({ ...prev, familyPhoto: res.publicUrl }));
          return res.publicUrl;
        }
        throw new Error("Invalid response");
      } catch (err) {
        console.error("Background upload failed", err);
        throw err;
      } finally {
        setUploading(false);
      }
    };

    uploadPromiseRef.current = uploadFn();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Wait for background upload if still in progress
      let finalPhotoUrl = formData.familyPhoto;
      if (uploadPromiseRef.current) {
        finalPhotoUrl = await uploadPromiseRef.current;
      }

      await updateParentProfileAction({
        ...formData,
        familyPhoto: finalPhotoUrl,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Enhanced Premium Family Photo Section */}
      <section className="relative group">
         <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-secondary/10 to-primary/20 rounded-[3rem] blur-xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
         <div className="relative bg-white rounded-[3rem] p-10 shadow-2xl border border-outline-variant/10 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
               <div className="relative shrink-0">
                   <div className="w-56 h-56 rounded-[2.5rem] overflow-hidden shadow-2xl ring-8 ring-surface-container-low transition-transform duration-700 group-hover:scale-[1.02] relative bg-slate-100">
                      <img 
                        src={previewPhoto || formData.familyPhoto || "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop"} 
                        className={cn(
                          "w-full h-full object-cover transition-all duration-700",
                          uploading && "opacity-50 blur-sm scale-110"
                        )}
                        alt="Family Portrait"
                        onError={(e) => {
                          console.error("Image load error:", e.currentTarget.src);
                        }}
                      />
                      {/* Debug Text Requested by User */}
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-[8px] font-black uppercase tracking-tighter rounded backdrop-blur-md">
                        {(!previewPhoto && !formData.familyPhoto) ? "missing" : "update"}
                      </div>
                     <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-md">
                       <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                       <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                         <MaterialIcon name="file_upload" className="text-4xl mb-2" />
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">Upload Portrait</p>
                       </div>
                     </label>
                  </div>
                  {uploading && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
               </div>
               
               <div className="flex-grow space-y-4 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full text-secondary mb-2">
                     <MaterialIcon name="stars" className="text-sm" fill />
                     <span className="text-[10px] font-black uppercase tracking-widest italic">Core Identity</span>
                  </div>
                  <h3 className="font-headline text-4xl font-black text-primary tracking-tighter italic leading-none">Family Portrait</h3>
                  <p className="text-on-surface-variant text-base font-medium opacity-50 italic leading-relaxed max-w-md">
                    This is the first thing caregivers see. Upload a warm, welcoming photo of your family to build instant trust.
                  </p>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full -mr-40 -mt-40 blur-[100px] -z-0"></div>
         </div>
      </section>

      {/* 2. Structured Identity Details */}
      <section className="bg-white rounded-[3rem] p-12 shadow-2xl border border-outline-variant/10 space-y-10 relative overflow-hidden">
        <div className="grid md:grid-cols-2 gap-10">
           <div className="space-y-4 group/field">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 ml-2 group-focus-within/field:text-primary transition-colors">
                <MaterialIcon name="badge" className="text-sm" />
                Family Name
              </label>
              <input 
                type="text" 
                value={formData.familyName}
                onChange={(e) => setFormData(prev => ({ ...prev, familyName: e.target.value }))}
                placeholder="e.g. The Smiths"
                className="w-full bg-surface-container-low border-none rounded-[1.5rem] p-6 text-base font-black text-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:text-primary/20"
              />
           </div>
           <div className="space-y-4 group/field">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 ml-2 group-focus-within/field:text-primary transition-colors">
                <MaterialIcon name="location_on" className="text-sm" />
                Base Location
              </label>
              <MapboxAutocomplete 
                initialLocation={formData.location}
                onSelect={(val, lat, lng) => {
                  setFormData(prev => ({ ...prev, location: val }));
                  setCoords({ lat, lng });
                }}
                inputClassName="w-full bg-surface-container-low border-none rounded-[1.5rem] p-6 text-base font-black text-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner placeholder:text-primary/20"
                placeholder="Search your city..."
              />
           </div>
        </div>

        <div className="space-y-4 group/field pt-4">
           <div className="flex items-center justify-between ml-2">
              <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 group-focus-within/field:text-primary transition-colors">
                <MaterialIcon name="auto_stories" className="text-sm" />
                Our Family Story & Philosophy
              </label>
              <span className="text-[10px] font-black text-primary/20 uppercase tracking-widest italic">Merged Profile Content</span>
           </div>
           <textarea 
             rows={6}
             value={formData.philosophy || ""}
             onChange={(e) => setFormData(prev => ({ ...prev, philosophy: e.target.value }))}
             placeholder="Describe your family vibe, values, parenting style and what makes your home special..."
             className="w-full bg-surface-container-low border-none rounded-[2.5rem] p-8 text-base font-bold text-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-inner italic leading-relaxed placeholder:text-primary/20"
           />
        </div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/5 rounded-full -mr-32 -mb-32 blur-[80px] -z-0"></div>
      </section>

      {/* 3. Action Hub */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-primary rounded-[2.5rem] p-8 shadow-2xl shadow-primary/30 text-white gap-6">
         <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
               <MaterialIcon name={loading ? "autorenew" : "verified_user"} className={cn("text-2xl", loading && "animate-spin")} />
            </div>
            <div className="text-left">
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Secure Sync</p>
               <h4 className="font-headline text-xl font-black italic">Identity Cloud Update</h4>
            </div>
         </div>
         <div className="flex items-center gap-4">
           {onSuccess && (
             <button
               type="button"
               onClick={onSuccess}
               disabled={loading}
               className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border border-white/10"
             >
               Discard
             </button>
           )}
           <button 
             disabled={loading}
             className="px-14 py-5 bg-white text-primary rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
           >
             {loading ? "Optimizing..." : "Finalize Profile"}
             <MaterialIcon name="rocket_launch" className="text-sm" />
           </button>
         </div>
      </div>
    </form>
  );
}
