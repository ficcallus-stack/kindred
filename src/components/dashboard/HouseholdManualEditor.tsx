"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { updateHouseholdManual } from "@/app/dashboard/parent/care-team/actions";

interface HouseholdManualEditorProps {
  initialValue: string;
}

export function HouseholdManualEditor({ initialValue }: HouseholdManualEditorProps) {
  const [content, setContent] = useState(initialValue || "");
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateHouseholdManual(content);
      showToast("Household Manual updated successfully!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update manual.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] p-10 border border-outline-variant/10 shadow-sm space-y-8 relative overflow-hidden group/manual">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -z-0"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h3 className="font-headline text-3xl font-black text-primary tracking-tighter leading-none italic">Household Manual</h3>
          <p className="text-sm font-medium opacity-60 italic text-on-surface-variant flex items-center gap-2">
            <MaterialIcon name="shield" className="text-xs text-secondary-fixed" fill />
            Shared only with your active Care Team
          </p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={cn(
            "px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 flex items-center gap-2 hover:bg-slate-900 transition-all",
            isSaving && "opacity-50 pointer-events-none grayscale"
          )}
        >
          <MaterialIcon name={isSaving ? "sync" : "save"} className={cn("text-sm", isSaving && "animate-spin")} />
          {isSaving ? "Saving..." : "Save Manual"}
        </button>
      </div>

      <div className="relative z-10">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="e.g., Emergency contacts, WiFi password, feeding schedules, house rules, and security codes..."
          className="w-full h-80 p-8 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 font-medium text-lg leading-relaxed focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:italic placeholder:opacity-30"
        />
        <div className="mt-4 flex flex-wrap gap-3">
          {["🔑 WiFi: [Insert]", "🚑 Emergency: [Insert]", "🛡️ Security: [Insert]"].map((tag) => (
            <button 
                key={tag}
                onClick={() => setContent(prev => prev + "\n" + tag)}
                className="px-4 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
            >
                Add {tag.split(":")[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/50 relative z-10 flex items-center gap-4 group-hover/manual:border-primary/20 transition-colors">
        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center rounded-2xl text-primary">
          <MaterialIcon name="info" fill />
        </div>
        <p className="text-xs font-medium text-on-surface-variant leading-relaxed opacity-60">
           Providing detailed house knowledge reduces onboarding friction for <strong>recurring nannies</strong> and ensures your home runs smoothly in your absence.
        </p>
      </div>
    </div>
  );
}
