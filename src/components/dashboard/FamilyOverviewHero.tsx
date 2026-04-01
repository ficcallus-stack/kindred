"use client";

import { useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import ParentProfileForm from "./ParentProfileForm";

interface FamilyOverviewHeroProps {
  initialProfile: {
    familyName: string;
    bio: string;
    location: string;
    familyPhoto: string;
  };
  userId: string;
}

export function FamilyOverviewHero({ initialProfile, userId }: FamilyOverviewHeroProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-outline-variant/10">
          <div>
             <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic leading-none mb-1">Editing Profile</h2>
             <p className="text-sm font-medium opacity-60 italic text-on-surface-variant">Update your core identity markers below.</p>
          </div>
          <button 
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 bg-surface-container-high text-primary rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <MaterialIcon name="close" className="text-sm" />
            Cancel
          </button>
        </div>
        <ParentProfileForm initialProfile={initialProfile} userId={userId} />
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-[3rem] p-10 shadow-sm border border-outline-variant/10 relative overflow-hidden group/hero">
      <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/5 rounded-full blur-[100px] -z-0"></div>
      
      <div className="lg:col-span-7 space-y-6 relative z-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-secondary font-black text-xs tracking-[0.3em] uppercase opacity-70">
            <MaterialIcon name="location_on" className="text-sm" fill />
            {initialProfile.location || "Location not set"}
          </div>
          <h1 className="font-headline text-5xl lg:text-7xl font-black text-primary tracking-tighter leading-none italic">
            The {initialProfile.familyName || "Unknown"} <br/><span className="text-secondary-container">Family Home</span>
          </h1>
        </div>
        <p className="text-lg text-on-surface-variant leading-relaxed max-w-xl font-medium opacity-60 italic">
          {initialProfile.bio || "Welcome to your family dashboard. Start by updating your profile and child details to find your perfect match."}
        </p>
        <div className="flex flex-wrap gap-4 pt-4">
          <button 
            onClick={() => setIsEditing(true)}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex items-center gap-2 hover:bg-slate-900 transition-all"
          >
            <MaterialIcon name="edit" className="text-sm" />
            Edit Profile
          </button>
        </div>
      </div>
      <div className="lg:col-span-5 relative z-10">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-tertiary-fixed rounded-full -z-10 opacity-30 blur-2xl animate-pulse"></div>
        <div className="relative">
          <img 
            alt={initialProfile.familyName} 
            className={cn(
              "w-full h-[450px] object-cover shadow-2xl rounded-[3rem]",
              "clip-path:[polygon(0_0,100%_0,95%_100%,0%_100%)]"
            )}
            src={initialProfile.familyPhoto || "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop"} 
          />
        </div>
        <div className="absolute -bottom-4 -right-4 bg-surface rounded-3xl p-5 shadow-2xl border border-outline-variant/10 flex items-center gap-4 animate-in slide-in-from-right duration-500">
          <div className="w-12 h-12 bg-secondary-fixed flex items-center justify-center rounded-2xl text-secondary shadow-inner">
            <MaterialIcon name="verified" fill />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">Status</p>
            <p className="font-black text-primary tracking-tight">Active Searcher</p>
          </div>
        </div>
      </div>
    </section>
  );
}
