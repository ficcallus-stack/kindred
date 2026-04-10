"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface IdentityMediaStepProps {
  profile: any;
  handleUpdate: (field: string, value: any) => void;
  setModalConfig: (config: any) => void;
}

export function IdentityMediaStep({ profile, handleUpdate, setModalConfig }: IdentityMediaStepProps) {
  const isValidName = profile.fullName.trim().split(/\s+/).length >= 2;
  const isNameLocked = profile.lastNameUpdateAt ? (() => {
    const lastUpdate = new Date(profile.lastNameUpdateAt);
    const fifteenWeeksInMs = 15 * 7 * 24 * 60 * 60 * 1000;
    return (Date.now() - lastUpdate.getTime()) < fifteenWeeksInMs;
  })() : false;

  const photoSlots = Array.from({length: 5}).map((_, i) => profile.photos[i] || null);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-10">
      {/* 1. Identity & Profile Photo */}
      <section className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/10">
        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
          <div className="relative group w-32 h-32 md:w-40 md:h-40 bg-slate-50 rounded-[2rem] overflow-hidden shadow-xl border-2 border-dashed border-outline-variant/30 hover:border-primary transition-all cursor-pointer flex-shrink-0" onClick={() => {
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
              className="w-full h-full object-cover group-hover:scale-110 group-hover:blur-[2px] transition-all duration-700"
              alt="Profile"
            />
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
               <MaterialIcon name="photo_camera" className="text-white text-2xl mb-1" />
               <span className="text-[9px] font-black uppercase text-white tracking-[0.2em] bg-black/40 px-3 py-1 rounded-full">Change</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1 italic">Legal Identity Name</label>
                {isNameLocked && (
                  <span className="text-[9px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-widest border border-amber-100 italic flex items-center gap-1.5 shadow-sm">
                    <MaterialIcon name="lock" className="text-xs" /> Lock Active
                  </span>
                )}
              </div>
              <input 
                className={cn(
                  "w-full bg-surface-container-low border-2 rounded-2xl px-6 py-4 focus:ring-4 focus:ring-primary/5 outline-none transition-all font-headline text-2xl font-black italic tracking-tight",
                  isNameLocked ? "border-amber-100 opacity-60 cursor-not-allowed" : "border-outline-variant/5 focus:border-primary shadow-sm hover:shadow-md",
                  !isValidName && profile.fullName.length > 0 && "border-rose-300 focus:border-rose-500 bg-rose-50/5"
                )}
                disabled={isNameLocked}
                value={profile.fullName}
                onChange={(e) => handleUpdate("fullName", e.target.value)}
                placeholder="First and Last Name"
              />
              {!isValidName && profile.fullName.length > 0 && (
                <p className="text-[10px] font-bold text-rose-500 italic px-2 animate-bounce">Provide both First and Last names for contract accuracy.</p>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant italic leading-relaxed opacity-70">
              Only your first name is public on the placement grid. Full names are strictly for verified contracts and safety check protocols.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Professional Bio (The Story) */}
      <section className="bg-surface-container-lowest p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-outline-variant/10 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex justify-between items-end mb-6">
             <div className="space-y-1">
                <h3 className="font-headline text-2xl font-black text-primary italic tracking-tight leading-none mb-1">Your Professional Narrative</h3>
                <p className="text-sm text-on-surface-variant italic font-medium opacity-70">Share your child-care philosophy and what families find most striking about your presence.</p>
             </div>
             <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{profile.bio?.length || 0} / 2000</span>
          </div>
          <textarea 
            className="w-full bg-surface-container-low border-2 border-outline-variant/5 focus:border-primary rounded-[2rem] px-8 py-6 focus:ring-4 focus:ring-primary/5 outline-none transition-all text-sm leading-relaxed text-on-surface-variant hover:shadow-lg min-h-[180px] scrollbar-hide" 
            placeholder="I believe that every child deserves a nurturing environment that fosters curiosity..."
            value={profile.bio || ""}
            onChange={(e) => handleUpdate("bio", e.target.value)}
          />
        </div>
        <MaterialIcon name="format_quote" className="absolute -bottom-10 -right-10 text-[200px] text-primary opacity-5 -rotate-12 pointer-events-none" />
      </section>

      {/* 3. Media Assets (Video & Gallery) */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Gallery */}
        <div className="xl:col-span-8 bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm">
           <div className="flex justify-between items-end mb-8 px-2">
              <div>
                <h3 className="font-headline text-2xl font-black text-primary italic mb-1 tracking-tight">Candid Portfolio</h3>
                <p className="text-on-surface-variant text-xs italic font-medium opacity-70">Up to 5 photos of you in your professional element.</p>
              </div>
              <div className="text-[10px] font-black text-primary bg-primary/5 px-4 py-2 rounded-full border border-primary/10 italic">{profile.photos.length} / 5 Slots</div>
           </div>
           <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {photoSlots.map((url, i) => url ? (
                <div key={i} className="relative group aspect-[4/5] bg-black rounded-3xl overflow-hidden shadow-inner cursor-pointer" onClick={() => {
                   if(confirm("Remove this photo?")) {
                      handleUpdate("photos", profile.photos.filter((p: string) => p !== url));
                   }
                }}>
                   <img src={url} className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-1000 ease-out" />
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MaterialIcon name="delete" className="text-white text-3xl" />
                   </div>
                </div>
              ) : (
                <div key={`empty-${i}`} onClick={() => {
                  setModalConfig({
                    isOpen: true, 
                    title: `Upload Photo Vault`, 
                    acceptedTypes: "image/png, image/jpeg, image/webp",
                    isMulti: true,
                    onComplete: (newUrls: string[]) => handleUpdate("photos", [...profile.photos, ...newUrls].slice(0, 5))
                  });
                }} className="aspect-[4/5] rounded-3xl border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/40 hover:text-primary text-slate-300 cursor-pointer transition-all active:scale-95 group">
                   <MaterialIcon name="add_circle" className="text-4xl group-hover:rotate-90 transition-transform duration-500" />
                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">Add Slot</span>
                </div>
              ))}
           </div>
        </div>

        {/* Video Intro */}
        <div className="xl:col-span-4 bg-tertiary-fixed rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-tertiary text-white rounded-xl flex items-center justify-center shadow-lg">
                    <MaterialIcon name="videocam" />
                 </div>
                 <h3 className="font-headline text-xl font-black text-on-tertiary-fixed italic tracking-tight">Public Intro Reel</h3>
              </div>
              <p className="text-[11px] font-bold text-on-tertiary-fixed-variant leading-relaxed mb-6 opacity-80 uppercase tracking-widest">
                4x higher engagement with a 30-sec video greeting.
              </p>
           </div>

           <div className="relative z-10 group/vid">
              {profile.videoUrl ? (
                <div className="relative aspect-[9/12] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white group/preview">
                   <video key={profile.videoUrl} className="w-full h-full object-cover">
                      <source src={profile.videoUrl} type="video/mp4" />
                   </video>
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                       <MaterialIcon name="play_circle" className="text-white text-6xl opacity-80 group-hover/preview:scale-110 transition-transform" />
                   </div>
                   <button onClick={(e) => { e.stopPropagation(); if(confirm("Discard reel?")) handleUpdate("videoUrl", ""); }} className="absolute top-4 right-4 bg-tertiary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg group-hover/preview:scale-100 scale-0 transition-transform duration-300">
                      <MaterialIcon name="close" className="text-sm" />
                   </button>
                </div>
              ) : (
                <div onClick={() => setModalConfig({ isOpen: true, title: "Upload Video Intro", acceptedTypes: "video/mp4, video/quicktime, video/webm", isVideo: true, onComplete: (urls: string[]) => handleUpdate("videoUrl", urls[0]) })} className="aspect-[9/12] border-4 border-dashed border-tertiary/20 rounded-3xl flex flex-col items-center justify-center text-tertiary/40 cursor-pointer bg-white/20 backdrop-blur-sm hover:bg-white/40 hover:border-tertiary/50 transition-all group/upload">
                   <MaterialIcon name="upload" className="text-5xl group-hover/upload:-translate-y-2 transition-transform" />
                   <span className="text-[10px] uppercase font-black tracking-[0.2em] mt-4">Upload Intro</span>
                </div>
              )}
           </div>
           <MaterialIcon name="video_settings" className="absolute -right-16 -bottom-16 text-[300px] text-tertiary opacity-5 rotate-12 pointer-events-none" />
        </div>
      </section>
    </div>
  );
}
