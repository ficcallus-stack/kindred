"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";
import { updateNannyProfile, uploadProfilePhotos, deleteProfilePhoto } from "./actions";
import { useRouter } from "next/navigation";

interface ProfileFormProps {
  initialData: {
    fullName: string;
    location: string | null;
    latitude?: number;
    longitude?: number;
    hourlyRate: string | null;
    experienceYears: number | null;
    bio: string | null;
    photos: string[];
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [profile, setProfile] = useState(initialData);
  const [photos, setPhotos] = useState<string[]>(initialData.photos || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleUpdate = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage("");
    try {
      await updateNannyProfile({
        fullName: profile.fullName,
        bio: profile.bio ?? undefined,
        hourlyRate: profile.hourlyRate ?? undefined,
        experienceYears: profile.experienceYears ?? undefined,
        location: profile.location ?? undefined,
        latitude: profile.latitude,
        longitude: profile.longitude,
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const formData = new FormData();
    for (let i = 0; i < e.target.files.length; i++) {
        formData.append("photos", e.target.files[i]);
    }
    try {
        await uploadProfilePhotos(formData);
        router.refresh();
        // Optimistically append local state just in case
    } catch (err: any) {
        alert(err.message);
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (url: string) => {
      try {
          await deleteProfilePhoto(url);
          setPhotos(prev => prev.filter(p => p !== url));
          router.refresh();
      } catch (err: any) {
          alert(err.message);
      }
  };

  // Sync state if props change (Optimistic UI fallback)
  const syncPhotosFromProps = initialData.photos;
  useState(() => {
    if (syncPhotosFromProps) {
        setPhotos(syncPhotosFromProps);
    }
    return null;
  });

  return (
    <div className="animate-in fade-in duration-700">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2 font-headline">Profile Details</h1>
          <p className="text-on-surface-variant font-body">Update your professional information and public presence.</p>
        </div>
        <div className="flex gap-3">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold uppercase tracking-wider shadow-sm border border-tertiary/10">
            <MaterialIcon name="verified" className="text-sm font-fill" fill />
            Verified
          </span>
        </div>
      </header>

      {message && (
        <div className={cn(
          "mb-8 p-4 rounded-xl text-sm font-bold border",
          message.includes("success") ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
        )}>
          {message}
        </div>
      )}

      <div className="space-y-10">
        {/* Identity Section */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="relative group self-start">
              <div className="h-40 w-40 rounded-2xl overflow-hidden bg-surface-container-high border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <img 
                  alt="Professional" 
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDYXJ9t9Mz5673uNjDd4CVfK7dTMa0Wlg_gzo_XZXwXzpO7C8xUkWsXwrlO1w396Ef7NxCHLAetCKZfGdxMWtHaa3R53EBoWdSCqu6um0zzNIYPdEaTqRKh_aLnfEiQjiTNDqtm5mlQXFkOfASY3bs83avdpLSDYTxaT-UMQtk7MAsG33Vw21lg8jFYXoMTLyah28yUQ8BmBbMVy4qBcz6sHiaqTFtT1Seeo_DRf65jAEwz4tXoyzu3Q9afjZyCrlxoeuCl_Rvnzw" 
                />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1 font-label">Full Name</label>
                <input 
                  className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 px-5 py-4 text-primary font-bold font-headline shadow-inner" 
                  type="text" 
                  value={profile.fullName}
                  onChange={(e) => handleUpdate("fullName", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1 font-label">Location</label>
                <div className="relative">
                  <MaterialIcon name="location_on" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60 z-10" />
                  <MapboxAutocomplete 
                    initialLocation={profile.location || ""}
                    onSelect={(loc, lat, lng) => {
                      handleUpdate("location", loc);
                      handleUpdate("latitude", lat);
                      handleUpdate("longitude", lng);
                    }}
                    placeholder="City, State"
                    inputClassName="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 pl-12 pr-5 py-4 text-primary font-bold font-headline shadow-inner relative z-0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1 font-label">Hourly Rate (USD)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 pl-10 pr-5 py-4 text-primary font-bold font-headline shadow-inner text-xl" 
                    type="number" 
                    value={profile.hourlyRate || ""}
                    onChange={(e) => handleUpdate("hourlyRate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1 font-label">Years of Experience</label>
                <div className="relative">
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 px-5 py-4 text-primary font-bold font-headline shadow-inner" 
                    type="number" 
                    value={profile.experienceYears || ""}
                    onChange={(e) => handleUpdate("experienceYears", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Professional Bio */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <MaterialIcon name="auto_awesome" className="text-secondary font-fill" fill />
              </div>
              <h3 className="text-2xl font-bold text-primary font-headline">Professional Bio</h3>
            </div>
          </div>
          <textarea 
            className="w-full bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 p-8 text-on-surface-variant leading-relaxed font-body shadow-inner min-h-[240px]" 
            rows={6}
            value={profile.bio || ""}
            placeholder="Tell families about your experience, approach, and why you love childcare..."
            onChange={(e) => handleUpdate("bio", e.target.value)}
          ></textarea>
        </div>

        {/* Photo Gallery Gallery */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <MaterialIcon name="photo_library" className="text-tertiary font-fill" fill />
              </div>
              <h3 className="text-2xl font-bold text-primary font-headline">Photo Gallery</h3>
            </div>
            <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">
              {photos.length} / 5 photos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {photos.map((url, index) => (
              <div key={index} className="relative group aspect-square rounded-xl overflow-hidden bg-surface-container-high border-2 border-transparent hover:border-primary/20 transition-all shadow-sm">
                <img src={url} alt={`Profile Photo ${index + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => handleDeletePhoto(url)}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MaterialIcon name="close" className="text-sm" />
                </button>
              </div>
            ))}

            {photos.length < 5 && (
              <label 
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 hover:bg-surface-container-high transition-all",
                  isUploading && "opacity-50 pointer-events-none"
                )}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleUploadPhotos} 
                  className="hidden" 
                />
                <div className="w-10 h-10 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                  <MaterialIcon name="add" className="text-primary text-xl" />
                </div>
                <span className="text-xs font-bold text-on-surface-variant/70 uppercase tracking-widest">
                  {isUploading ? "Uploading..." : "Add Photo"}
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-error-container/10 rounded-2xl p-8 shadow-sm border border-error/20">
          <div className="flex items-center gap-3 mb-4">
            <MaterialIcon name="warning" className="text-error" />
            <h3 className="text-xl font-bold text-error font-headline">Danger Zone</h3>
          </div>
          <p className="text-on-surface-variant text-sm mb-6 max-w-2xl">
            Permanently delete your KindredCare account and instantly purge all personally identifiable information, active job applications, and profile images from our servers. <strong>This action is irreversible.</strong>
          </p>
          <button 
            type="button"
            onClick={async () => {
              if (window.confirm("Are you absolutely sure you want to permanently delete your account? This action cannot be undone.")) {
                setIsSaving(true);
                try {
                  const { deleteNannyAccount } = await import('./actions');
                  await deleteNannyAccount();
                  window.location.href = "/";
                } catch (e: any) {
                  alert(e.message);
                  setIsSaving(false);
                }
              }
            }}
            className="px-6 py-3 bg-error text-on-error rounded-xl font-bold text-sm shadow-sm hover:opacity-90 transition-opacity uppercase tracking-widest"
          >
            Permanently Delete Account
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-outline-variant/10">
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className="px-12 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl font-extrabold shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 text-lg font-headline disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Profile Updates"}
          </button>
        </div>
      </div>
    </div>
  );
}
