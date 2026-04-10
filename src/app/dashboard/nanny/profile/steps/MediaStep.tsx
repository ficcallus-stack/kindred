"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

interface MediaStepProps {
  profile: any;
  handleUpdate: (field: string, value: any) => void;
  setModalConfig: (config: any) => void;
}

export function MediaStep({ profile, handleUpdate, setModalConfig }: MediaStepProps) {
  const slots = Array.from({length: 5}).map((_, i) => profile.photos[i] || null);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 border border-outline-variant/10 shadow-sm">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary mb-1">Visual Portfolio</h3>
            <p className="text-on-surface-variant text-sm">A maximum of 5 images displaying you engaged in childcare activities or professional settings.</p>
          </div>
          <div className="text-sm font-black text-primary bg-primary/5 px-4 py-2 rounded-xl">{profile.photos.length} / 5</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {slots.map((url, i) => url ? (
            <div key={i} className="relative group aspect-[4/5] bg-black rounded-2xl overflow-hidden shadow-inner cursor-pointer" onClick={() => {
                const action = confirm(`Manage Image ${i + 1}:\n\n- OK to Remove\n- Cancel to Replace with a new file`);
                if (action) {
                    handleUpdate("photos", profile.photos.filter((p: string) => p !== url));
                } else {
                    setModalConfig({
                        isOpen: true, 
                        title: `Replace Photo ${i + 1}`, 
                        acceptedTypes: "image/png, image/jpeg, image/webp",
                        isMulti: false,
                        replaceIndex: i,
                        onComplete: (newUrls: string[]) => {
                            // Logic is handled by ProfileWizard.startUpload now
                        }
                    });
                }
            }}>
                <img src={url} className="w-full h-full object-cover group-hover:scale-110 group-hover:opacity-40 transition-all duration-700" alt={`Portfolio ${i}`} />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex flex-col items-center gap-2">
                    <MaterialIcon name="refresh" className="text-white text-3xl" />
                    <span className="text-[10px] font-bold text-white uppercase">Replace</span>
                  </div>
                </div>
            </div>
          ) : (
            <div key={`empty-${i}`} onClick={() => {
                setModalConfig({
                    isOpen: true, 
                    title: `Upload Photo Vault`, 
                    acceptedTypes: "image/png, image/jpeg, image/webp",
                    isMulti: true,
                    onComplete: (newUrls: string[]) => {
                        handleUpdate("photos", [...profile.photos, ...newUrls].slice(0, 5));
                    }
                });
            }} className="aspect-[4/5] rounded-2xl border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center gap-4 hover:bg-primary/5 hover:border-primary/50 hover:text-primary text-slate-400 cursor-pointer transition-all group">
                <MaterialIcon name="add_circle" className="text-3xl group-hover:scale-125 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Add Photo</span>
            </div>
          ))}
        </div>
        {profile.photos.length === 0 && (
          <p className="text-xs font-medium text-amber-600 bg-amber-50 p-4 rounded-xl mt-6 italic">
            You can select multiple photos at once (up to 5) when you click the upload button!
          </p>
        )}
      </div>

      <div className="bg-tertiary-fixed rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row gap-10">
          <div className="flex-1">
            <h3 className="font-headline text-3xl font-black text-on-tertiary-fixed mb-4 italic tracking-tighter">Video Introduction</h3>
            <p className="text-sm text-on-tertiary-fixed-variant mb-8 opacity-90 leading-relaxed font-medium">Capture a 30-second reel speaking directly to parents. Placements with video reels see a 400% higher match rate for Core Care Team roles.</p>
            <button onClick={() => {
                setModalConfig({
                  isOpen: true, 
                  title: "Upload Video Intro", 
                  acceptedTypes: "video/mp4, video/quicktime, video/webm", 
                  isVideo: true,
                  isMulti: false,
                  onComplete: (urls: string[]) => handleUpdate("videoUrl", urls[0])
                })
            }} className="px-8 py-4 bg-tertiary text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-tertiary/20 flex items-center gap-3 hover:-translate-y-1 transition-transform">
                {profile.videoUrl ? "Replace Reel" : "Upload Reel"} <MaterialIcon name="videocam" />
            </button>
          </div>
          {profile.videoUrl ? (
            <div className="w-full md:w-80 aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-white shrink-0 group video-preview">
                <video 
                  key={profile.videoUrl}
                  controls 
                  playsInline
                  preload="auto"
                  className="w-full h-full object-cover" 
                >
                  <source src={profile.videoUrl} type="video/mp4" />
                  <source src={profile.videoUrl} type="video/quicktime" />
                  <source src={profile.videoUrl} type="video/webm" />
                   Your browser does not support the video tag.
                </video>
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
}
