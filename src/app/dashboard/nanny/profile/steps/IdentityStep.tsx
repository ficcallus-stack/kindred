"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface IdentityStepProps {
  profile: any;
  handleUpdate: (field: string, value: any) => void;
  setModalConfig: (config: any) => void;
}

export function IdentityStep({ profile, handleUpdate, setModalConfig }: IdentityStepProps) {
  const isValidName = profile.fullName.trim().split(/\s+/).length >= 2;
  
  const isNameLocked = profile.lastNameUpdateAt ? (() => {
    const lastUpdate = new Date(profile.lastNameUpdateAt);
    const fifteenWeeksInMs = 15 * 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - lastUpdate.getTime()) < fifteenWeeksInMs;
  })() : false;

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
              isMulti: false,
              onComplete: (urls: string[]) => handleUpdate("profileImageUrl", urls[0])
            })
          }}>
            <img 
              src={profile.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.fullName}`} 
              className="w-full h-full object-cover group-hover:blur-sm group-hover:scale-110 transition-all duration-500"
              alt="Profile"
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
          <div className="flex flex-col gap-10">
            {/* Identity & Alias Duo */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
              <div className="xl:col-span-7 space-y-4 group">
                <div className="flex justify-between items-end">
                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Full Identity Name</label>
                    {isNameLocked && (
                      <span className="flex items-center gap-1.5 text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse border border-amber-100 italic shadow-sm">
                         <MaterialIcon name="lock" className="text-sm" /> Lock Active
                      </span>
                    )}
                </div>
                <div className="relative">
                  <input 
                    className={cn(
                      "w-full bg-surface-container-low border-2 rounded-[1.5rem] px-8 py-5 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-headline text-2xl font-black italic tracking-tight",
                      isNameLocked ? "border-amber-100 bg-amber-50/10 opacity-60 cursor-not-allowed" : "border-outline-variant/10 focus:border-primary shadow-sm hover:shadow-lg",
                      !isValidName && profile.fullName.length > 0 ? "border-rose-400 focus:border-rose-500 bg-rose-50/5" : ""
                    )}
                    type="text" 
                    disabled={isNameLocked}
                    value={profile.fullName}
                    onChange={(e) => handleUpdate("fullName", e.target.value)}
                    placeholder="First and Last Name"
                  />
                  {!isValidName && profile.fullName.length > 0 && (
                    <p className="mt-3 text-[10px] font-bold text-rose-500 italic flex items-center gap-2 animate-in slide-in-from-top-1 duration-300">
                      <MaterialIcon name="error" className="text-sm" /> Provide at least 2 names.
                    </p>
                  )}
                  {isNameLocked && (
                    <p className="mt-3 text-[10px] font-black text-on-surface-variant/40 italic flex items-center gap-2">
                      <MaterialIcon name="info" className="text-sm" /> Verified name changes are locked for 15 weeks.
                    </p>
                  )}
                </div>
              </div>

              <div className="xl:col-span-5 self-stretch flex flex-col justify-center bg-primary/5 p-6 rounded-[2rem] border border-primary/10 border-dashed relative overflow-hidden">
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                          <MaterialIcon name="visibility" className="text-lg" />
                      </div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic leading-none">Marketplace Alias</h4>
                  </div>
                  <p className="text-[11px] text-on-surface-variant italic font-medium leading-relaxed">
                      Only your first name is public: <span className="font-bold text-primary px-1.5 py-0.5 bg-white rounded-lg shadow-sm">"{profile.fullName.split(" ")[0] || "Caregiver"}"</span>
                  </p>
                </div>
                <MaterialIcon name="shield" className="absolute -right-4 -bottom-4 text-7xl text-primary opacity-5 rotate-12" />
              </div>
            </div>
            
            {/* Rates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-6 border-t border-outline-variant/10">
              {/* Hourly Rate Slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Spot Hourly Rate ($)</label>
                  <span className="text-2xl font-black text-primary italic tracking-tighter">${profile.hourlyRate || "35"}<span className="text-xs tracking-normal">/hr</span></span>
                </div>
                <p className="text-[10px] text-on-surface-variant leading-tight italic">For date nights, one-off gigs, or emergency care.</p>
                <input 
                  type="range" min="15" max="100" step="1"
                  className="w-full accent-primary h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
                  value={profile.hourlyRate || 35}
                  onChange={(e) => handleUpdate("hourlyRate", e.target.value)}
                />
              </div>

              {/* Weekly Retainer Slider */}
              <div className="space-y-4 relative">
                <div className="flex justify-between items-end">
                  <div className="flex flex-col">
                      <span className="bg-secondary text-[8px] font-black text-white uppercase tracking-widest px-2 py-0.5 rounded-full w-fit mb-1 shadow-sm">Recommended</span>
                      <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest px-1">Weekly Retainer Rate ($)</label>
                  </div>
                  <span className="text-2xl font-black text-secondary italic tracking-tighter">${profile.weeklyRate || "1200"}<span className="text-xs tracking-normal">/wk</span></span>
                </div>
                <p className="text-[10px] text-on-surface-variant leading-tight italic">For fixed, predictable income with permanent familiy placements.</p>
                <input 
                  type="range" min="300" max="4000" step="50"
                  className="w-full accent-secondary h-2 bg-surface-container-highest rounded-full appearance-none cursor-pointer"
                  value={profile.weeklyRate || 1200}
                  onChange={(e) => handleUpdate("weeklyRate", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-sm border border-outline-variant/10">
        <div className="max-w-3xl">
          <h3 className="font-headline text-2xl font-bold mb-2 text-primary">Your Core Story</h3>
          <p className="text-on-surface-variant mb-6 text-sm">Tell your future family why you are the perfect dedicated placement. Emphasize reliability, household integration, and your long-term childcare philosophy.</p>
          <textarea 
            className="w-full bg-surface-container-low border border-outline-variant/15 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-primary/40 outline-none transition-all text-sm leading-relaxed text-on-surface-variant min-h-[200px]" 
            rows={6}
            placeholder="I believe that every child deserves a nurturing environment, and I pride myself on becoming an integrated, indispensable part of the family dynamic..."
            value={profile.bio || ""}
            onChange={(e) => handleUpdate("bio", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
