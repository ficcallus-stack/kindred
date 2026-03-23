"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export default function NannyProfilePage() {
  const [profile, setProfile] = useState({
    fullName: "Elena Rodriguez",
    location: "Brooklyn, NY",
    hourlyRate: 28,
    experience: "8-12 Years",
    bio: "I am a dedicated and compassionate caregiver with over 10 years of experience specializing in early childhood development. My approach combines structured educational activities with warm, creative play. I am CPR/First Aid certified and hold a degree in Childhood Education. I love fostering a curious and safe environment for children to grow and explore their world.",
    specialties: ["Newborn Care", "Montessori Method", "Bilingual (Spanish)", "Special Needs"]
  });

  const handleUpdate = (field: string, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed text-xs font-bold uppercase tracking-wider shadow-sm border border-secondary/10">
            <MaterialIcon name="public" className="text-sm" />
            Global Care
          </span>
        </div>
      </header>

      <div className="space-y-10">
        {/* Identity Section */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="relative group self-start">
              <div className="h-40 w-40 rounded-2xl overflow-hidden bg-surface-container-high border-4 border-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <img 
                  alt="Professional Headshot" 
                  className="h-full w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDYXJ9t9Mz5673uNjDd4CVfK7dTMa0Wlg_gzo_XZXwXzpO7C8xUkWsXwrlO1w396Ef7NxCHLAetCKZfGdxMWtHaa3R53EBoWdSCqu6um0zzNIYPdEaTqRKh_aLnfEiQjiTNDqtm5mlQXFkOfASY3bs83avdpLSDYTxaT-UMQtk7MAsG33Vw21lg8jFYXoMTLyah28yUQ8BmBbMVy4qBcz6sHiaqTFtT1Seeo_DRf65jAEwz4tXoyzu3Q9afjZyCrlxoeuCl_Rvnzw" 
                />
              </div>
              <button className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-3 rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all">
                <MaterialIcon name="edit" className="text-lg" />
              </button>
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
                    value={profile.location}
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
                    value={profile.hourlyRate}
                    onChange={(e) => handleUpdate("hourlyRate", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] px-1 font-label">Years of Experience</label>
                <div className="relative">
                  <select 
                    className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 px-5 py-4 text-primary font-bold font-headline shadow-inner appearance-none cursor-pointer"
                    value={profile.experience}
                    onChange={(e) => handleUpdate("experience", e.target.value)}
                  >
                    <option>5-8 Years</option>
                    <option>8-12 Years</option>
                    <option>12+ Years</option>
                  </select>
                  <MaterialIcon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
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
            <button className="text-primary font-bold text-sm flex items-center gap-2 hover:bg-primary/5 px-4 py-2 rounded-xl transition-all border border-primary/10">
              <MaterialIcon name="colors_spark" className="text-sm font-fill" fill />
              Enhance with AI
            </button>
          </div>
          <textarea 
            className="w-full bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 p-8 text-on-surface-variant leading-relaxed font-body shadow-inner min-h-[240px]" 
            rows={6}
            value={profile.bio}
            onChange={(e) => handleUpdate("bio", e.target.value)}
          ></textarea>
          <div className="mt-4 flex justify-end">
            <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest font-label">Character count: {profile.bio.length}/1000</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 bg-primary text-on-primary p-10 rounded-2xl relative overflow-hidden shadow-2xl shadow-primary/20">
            <div className="relative z-10">
              <h3 className="font-headline font-bold text-2xl mb-6 text-white tracking-tight">Care Specialties</h3>
              <div className="flex flex-wrap gap-3">
                {profile.specialties.map((tag) => (
                  <span key={tag} className="px-5 py-2.5 bg-white/10 backdrop-blur-xl rounded-xl text-sm font-medium border border-white/20 hover:bg-white/20 transition-all cursor-default">
                    {tag}
                  </span>
                ))}
                <button className="px-6 py-2.5 bg-secondary-fixed text-on-secondary-fixed rounded-xl text-sm font-extrabold shadow-lg hover:shadow-secondary/40 active:scale-95 transition-all">
                  + Add New
                </button>
              </div>
            </div>
            <MaterialIcon name="child_care" className="absolute -right-8 -bottom-8 text-[200px] opacity-10 font-thin italic" />
          </div>
          <div className="lg:col-span-4 bg-surface-container-low p-8 rounded-2xl flex flex-col items-center justify-center text-center border-2 border-dashed border-outline-variant/30 hover:border-primary/30 transition-colors group cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-surface-container-lowest flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
              <MaterialIcon name="add_a_photo" className="text-4xl text-on-surface-variant/40 group-hover:text-primary transition-colors" />
            </div>
            <p className="text-sm font-bold text-primary font-headline">Gallery Photo</p>
            <p className="text-[10px] text-on-surface-variant font-medium mt-1 uppercase tracking-wider">Showcase your play area</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="pt-10 flex flex-col sm:flex-row justify-end gap-4 border-t border-outline-variant/10">
          <button className="px-8 py-4 rounded-2xl text-on-surface-variant font-bold hover:bg-surface-container-low transition-all active:scale-95 text-sm font-headline">Discard Changes</button>
          <button className="px-12 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl font-extrabold shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 text-lg font-headline">
            Save Profile Updates
          </button>
        </div>
      </div>
    </div>
  );
}
