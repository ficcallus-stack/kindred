"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createCareMilestoneAction } from "@/app/dashboard/nanny/care-actions";

interface MilestoneEditorProps {
  parentId: string;
}

export function MilestoneEditor({ parentId }: MilestoneEditorProps) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [type, setType] = useState("moment");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCareMilestoneAction({
        parentId,
        content,
        type,
        photoUrl: null, // Placeholder for future upload logic
      });
      setOpen(false);
      setContent("");
      setType("moment");
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
