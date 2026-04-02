"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { createCareMilestoneAction } from "@/app/dashboard/nanny/care-actions";
import { getPublicR2Url } from "@/lib/r2";

interface MilestoneEditorProps {
  parentId: string;
}

export function MilestoneEditor({ parentId }: MilestoneEditorProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("moment");
  const [loading, setLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let photoUrl: string | null = null;

      // Upload photo if selected
      if (photoFile) {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: JSON.stringify({ fileName: photoFile.name, fileType: photoFile.type, fileSize: photoFile.size })
        });
        if (res.ok) {
          const { uploadUrl, key } = await res.json();
          await fetch(uploadUrl, { method: "PUT", body: photoFile, headers: { "Content-Type": photoFile.type } });
          photoUrl = getPublicR2Url(key);
        }
      }

      await createCareMilestoneAction({
        parentId,
        content,
        type,
        photoUrl,
      });
      setOpen(false);
      setContent("");
      setType("moment");
      setPhotoFile(null);
      setPhotoPreview(null);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return (
     <button 
       onClick={() => setOpen(true)}
       className="w-full py-6 bg-amber-50 text-amber-700 border-2 border-dashed border-amber-200 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-amber-100 transition-all opacity-60 hover:opacity-100 group"
     >
        <MaterialIcon name="auto_stories" className="text-xl group-hover:rotate-12 transition-transform" />
        Record Kindred Moment
     </button>
  );

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-outline-variant/10 shadow-2xl space-y-6 animate-in zoom-in duration-500">
      <div className="flex items-center justify-between">
         <h3 className="text-lg font-black text-primary font-headline tracking-tighter italic uppercase">Capture a Milestone</h3>
         <button onClick={() => setOpen(false)} className="p-2 text-primary/20 hover:text-primary transition-colors">
            <MaterialIcon name="close" />
         </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
         <div className="grid grid-cols-2 gap-4">
            {[
              { id: "moment", icon: "favorite", label: "Moment" },
              { id: "motor_skill", icon: "directions_run", label: "Motor Skill" },
              { id: "funny_moment", icon: "sentiment_very_satisfied", label: "Funny" },
              { id: "first_word", icon: "record_voice_over", label: "Speech" }
            ].map((t) => (
              <button 
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={cn(
                  "p-4 rounded-2xl border flex flex-col items-center gap-2 transition-all",
                  type === t.id ? "bg-primary text-white border-primary shadow-lg" : "bg-slate-50 text-primary border-slate-200 hover:border-primary/20"
                )}
              >
                 <MaterialIcon name={t.icon} fill={type === t.id} />
                 <span className="text-[9px] font-black uppercase tracking-widest">{t.label}</span>
              </button>
            ))}
         </div>

         <textarea 
           value={content}
           onChange={(e) => setContent(e.target.value)}
           placeholder="Describe this precious moment for the parents..."
           className="w-full h-32 p-6 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-[2rem] text-sm italic font-medium text-primary outline-none resize-none transition-all"
           required
         />

         {/* Photo Upload */}
         <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
           const f = e.target.files?.[0];
           if (f) { setPhotoFile(f); setPhotoPreview(URL.createObjectURL(f)); }
         }} />
         <button type="button" onClick={() => fileRef.current?.click()} className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-xs font-bold text-slate-400 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2">
           <MaterialIcon name="add_a_photo" />
           {photoPreview ? "Change Photo" : "Attach Photo (Optional)"}
         </button>
         {photoPreview && (
           <div className="relative w-full h-40 rounded-2xl overflow-hidden">
             <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
             <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"><MaterialIcon name="close" className="text-sm" /></button>
           </div>
         )}

         <button 
           type="submit"
           disabled={loading || !content}
           className="w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
         >
            {loading ? <MaterialIcon name="sync" className="animate-spin" /> : (
                <>
                   <MaterialIcon name="publish" />
                   Add to Scrapbook
                </>
            )}
         </button>
      </form>
    </div>
  );
}
