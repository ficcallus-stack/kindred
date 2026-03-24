"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { updateNannyProfile } from "./actions";

interface ProfileFormProps {
  initialData: {
    fullName: string;
    location: string | null;
    hourlyRate: string | null;
    experienceYears: number | null;
    bio: string | null;
  };
}

export default function ProfileForm({ initialData }: ProfileFormProps) {
  const [profile, setProfile] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

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
      });
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

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
                  <MaterialIcon name="location_on" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/60" />
                  <input 
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 pl-12 pr-5 py-4 text-primary font-bold font-headline shadow-inner" 
                    type="text" 
                    value={profile.location || ""}
                    placeholder="City, State"
                    onChange={(e) => handleUpdate("location", e.target.value)}
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
