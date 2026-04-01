"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { deleteJobDraft } from "@/app/dashboard/parent/post-job/actions";

export function ResumeJobBanner() {
  const [hasDraft, setHasDraft] = useState(false);
  const [draftStep, setDraftStep] = useState(1);
  const pathname = usePathname();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    // Check if a draft exists in localStorage
    const draft = localStorage.getItem("kindred_job_draft");
    if (draft && !pathname.includes("/dashboard/parent/post-job")) {
      try {
        const parsed = JSON.parse(draft);
        // Only show if the draft was updated recently (e.g. within 7 days) or just exists
        if (parsed.location || parsed.description) {
           setHasDraft(true);
           setDraftStep(parsed.step || 1);
        }
      } catch (e) {
        console.error("Failed to parse local job draft", e);
      }
    }
  }, [pathname]);

  const handleDiscard = async () => {
    localStorage.removeItem("kindred_job_draft");
    try {
       await deleteJobDraft();
    } catch (e) {
       console.error("Failed to delete cloud draft", e);
    }
    setHasDraft(false);
    showToast("Unfinished job post discarded.", "info");
  };

  const handleResume = () => {
    router.push("/dashboard/parent/post-job");
  };

  if (!hasDraft) return null;

  return (
    <div className="fixed top-20 left-0 right-0 z-[60] bg-primary text-white py-3 px-6 shadow-2xl animate-in slide-in-from-top duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <MaterialIcon name="history_edu" className="text-white text-xl" />
          </div>
          <div>
            <p className="text-sm font-bold font-headline leading-tight">You have an unfinished job post.</p>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Saved at Step {draftStep} • Continue where you left off</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleDiscard}
            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 rounded-xl transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={handleResume}
            className="px-6 py-2 bg-secondary text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-all"
          >
            Resume Now
          </button>
        </div>
      </div>
    </div>
  );
}
