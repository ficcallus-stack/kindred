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
    philosophy: string;
    location: string;
    familyPhoto: string;
  };
  userId: string;
}

export function FamilyOverviewHero({ initialProfile, userId }: FamilyOverviewHeroProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white rounded-[4rem] p-10 lg:p-14 shadow-2xl shadow-primary/5 border border-outline-variant/10 relative overflow-hidden group/hero">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-fixed/10 rounded-full blur-[120px] -z-0 group-hover/hero:scale-125 transition-transform duration-1000"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0"></div>
        
        <div className="lg:col-span-7 space-y-8 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-secondary font-black text-[10px] tracking-[0.4em] uppercase opacity-60">
              <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                 <MaterialIcon name="location_on" className="text-sm" fill />
              </div>
              {initialProfile.location || "Location not set"}
            </div>
            <h1 className="font-headline text-5xl lg:text-8xl font-black text-primary tracking-tighter leading-[0.9] italic">
              The {initialProfile.familyName || "Unknown"} <br/>
              <span className="text-secondary-fixed bg-secondary-fixed/10 px-4 rounded-3xl -ml-4 inline-block transform -rotate-1">Family Home</span>
            </h1>
          </div>
          
          <div className="space-y-4">
             <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl font-medium opacity-60 italic border-l-4 border-secondary/20 pl-6">
               {initialProfile.philosophy || initialProfile.bio || "Welcome to your family dashboard. Start by updating your profile and child details to find your perfect match."}
             </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-6">
            <button 
              onClick={() => setIsEditing(true)}
              className="px-10 py-5 bg-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/30 flex items-center gap-4 hover:scale-[1.05] active:scale-95 transition-all group/btn"
            >
              <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover/btn:rotate-12 transition-transform">
                 <MaterialIcon name="edit_note" className="text-sm" />
              </div>
              Edit Family Profile
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 relative z-10 self-stretch">
          <div className="relative h-full min-h-[500px]">
            <div className="absolute inset-0 bg-primary/5 rounded-[4rem] transform translate-x-4 translate-y-4 -z-10 transition-transform group-hover/hero:translate-x-6 group-hover/hero:translate-y-6 duration-700"></div>
            <img 
              alt={initialProfile.familyName} 
              className={cn(
                "w-full h-full object-cover shadow-2xl rounded-[4rem] border-8 border-white",
                "grayscale-0 group-hover/hero:grayscale-0 transition-all duration-700"
              )}
              src={initialProfile.familyPhoto || "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=2070&auto=format&fit=crop"} 
            />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-[2.5rem] p-6 shadow-2xl border border-outline-variant/10 flex items-center gap-5 transition-transform group-hover/hero:-translate-y-2 duration-700">
              <div className="w-14 h-14 bg-secondary flex items-center justify-center rounded-[1.25rem] text-white shadow-xl shadow-secondary/20">
                <MaterialIcon name="verified" fill className="rotate-12" />
              </div>
              <div>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40 leading-none mb-1">Status</p>
                <p className="font-black text-primary tracking-tight text-lg italic">Active Searcher</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PREMIUM MODAL OVERLAY */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-primary/20 backdrop-blur-2xl cursor-pointer"
            onClick={() => setIsEditing(false)}
          ></div>
          
          <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,0.2)] border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
             <div className="sticky top-0 z-50 flex items-center justify-between p-10 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/5">
                <div className="flex items-center gap-6">
                   <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
                      <MaterialIcon name="edit_square" className="text-2xl" />
                   </div>
                   <div>
                      <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic leading-none">Family Hub Editor</h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant/40 mt-1">Identity Management</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-high text-primary hover:bg-slate-200 transition-all hover:rotate-90"
                >
                  <MaterialIcon name="close" />
                </button>
             </div>
             
             <div className="p-10">
                <ParentProfileForm 
                   initialProfile={initialProfile} 
                   userId={userId} 
                   onSuccess={() => setIsEditing(false)} 
                />
             </div>
          </div>
        </div>
      )}
    </>
  );
}
