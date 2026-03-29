"use client";

import { useState } from "react";
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
    location: string;
    familyPhoto: string;
  };
  userId: string;
}

export default function ParentProfileForm({ initialProfile, userId }: ParentProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialProfile);
  const [coords, setCoords] = useState<{ lat?: number; lng?: number }>({});
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await uploadFile(data);
      if (res.url) {
        setFormData(prev => ({ ...prev, familyPhoto: res.url }));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateParentProfileAction({
        ...formData,
        latitude: coords.lat,
        longitude: coords.lng,
      });
      router.refresh();
      // Optional: show toast
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 group">
      {/* 1. Family Photo Section */}
      <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
           <div className="relative group/photo shrink-0 w-48 h-48">
              <img 
                src={formData.familyPhoto || "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop"} 
                className={cn(
                  "w-full h-full object-cover rounded-[2rem] shadow-xl border-4 border-white grayscale group-hover/photo:grayscale-0 transition-all duration-700",
                  uploading && "opacity-50 blur-sm"
                )}
                alt="Family Photo"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-[2rem] opacity-0 group-hover/photo:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                <input type="file" className="hidden" onChange={handlePhotoUpload} accept="image/*" />
                <div className="text-center">
                  <MaterialIcon name="photo_camera" className="text-3xl mb-1" />
                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">Change Photo</p>
                </div>
              </label>
           </div>
           <div className="flex-grow space-y-4 text-center md:text-left">
              <h3 className="font-headline text-3xl font-black text-primary tracking-tighter italic leading-none">Family Portrait</h3>
              <p className="text-on-surface-variant text-sm font-medium opacity-60 italic leading-relaxed">
                Add a warm family photo. This is what nannies see first when looking for local jobs.
              </p>
           </div>
        </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-secondary-fixed/10 rounded-full -mr-20 -mt-20 blur-3xl -z-0"></div>
      </section>

      {/* 2. Core Identity Details */}
      <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-outline-variant/10 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 ml-2">Family Name</label>
              <input 
                type="text" 
                value={formData.familyName}
                onChange={(e) => setFormData(prev => ({ ...prev, familyName: e.target.value }))}
                placeholder="e.g. The Smiths"
                className="w-full bg-surface-container-low border-none rounded-2xl p-5 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
           </div>
           <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 ml-2">Primary Service Location</label>
              <MapboxAutocomplete 
                initialLocation={formData.location}
                onSelect={(val, lat, lng) => {
                  setFormData(prev => ({ ...prev, location: val }));
                  setCoords({ lat, lng });
                }}
                inputClassName="w-full bg-surface-container-low border-none rounded-2xl p-5 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/10 transition-all"
                placeholder="Search your city or neighborhood..."
              />
           </div>
        </div>

        <div className="space-y-3 pt-4">
           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 ml-2">About Our Family</label>
           <textarea 
             rows={5}
             value={formData.bio}
             onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
             placeholder="Tell potential nannies about your family vibe, values, and what you're looking for..."
             className="w-full bg-surface-container-low border-none rounded-3xl p-6 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/10 transition-all italic leading-relaxed"
           />
        </div>
      </section>

      {/* 3. Submit Action */}
      <div className="flex justify-end gap-6 items-center pt-8">
         <span className={cn(
           "text-xs font-black uppercase tracking-widest text-secondary-container transition-opacity",
           loading ? "opacity-100 animate-pulse" : "opacity-0"
         )}>
           Syncing with Kindred Home...
         </span>
         <button 
           disabled={loading}
           className="px-12 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
         >
           {loading ? "Saving..." : "Save Family Profile"}
           <MaterialIcon name="auto_awesome" className="text-sm" />
         </button>
      </div>
    </form>
  );
}
