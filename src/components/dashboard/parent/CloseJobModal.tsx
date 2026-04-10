"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { closeJob } from "@/app/dashboard/parent/jobs/actions";
import { useToast } from "@/hooks/use-toast";

interface CloseJobModalProps {
  jobId: string;
  jobTitle: string;
}

export function CloseJobModal({ jobId, jobTitle }: CloseJobModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { toast } = useToast();

  const handleClose = async () => {
    try {
      setIsPending(true);
      const res = await closeJob(jobId);
      if (res.success) {
        toast({
          title: "Job Closed Successfully",
          description: "All applicants have been notified and the job is now archived.",
        });
        setIsOpen(false);
      }
    } catch (err: any) {
      toast({
        title: "Error Closing Job",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="ml-auto text-error font-black uppercase tracking-widest text-[10px] hover:underline transition-all font-label"
      >
        Close Job
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/20 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg asymmetric-clip shadow-2xl p-10 space-y-8 animate-in zoom-in-95 duration-300">
             <div className="bg-error/10 w-16 h-16 rounded-2xl flex items-center justify-center text-error mb-4">
                <MaterialIcon name="warning" size={32} fill />
             </div>
             
             <div>
                <h2 className="text-3xl font-headline font-black text-primary italic tracking-tight mb-4">
                    Close this Job?
                </h2>
                <div className="space-y-4 text-on-surface-variant font-medium leading-relaxed italic opacity-80 text-sm">
                    <p>You are about to close <span className="text-primary font-bold not-italic">"{jobTitle}"</span>.</p>
                    <p className="border-l-4 border-error pl-4">
                        This will automatically send <span className="text-error font-bold">REJECTION NOTICES</span> and emails to all current applicants who haven't been hired yet.
                    </p>
                    <p>This action is permanent and cannot be undone.</p>
                </div>
             </div>

             <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                    disabled={isPending}
                    onClick={handleClose}
                    className="flex-1 bg-error text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-error/20 hover:bg-error/90 transition-all flex items-center justify-center gap-2"
                >
                    {isPending ? "Closing..." : "Yes, Close and Notify"}
                </button>
                <button 
                    disabled={isPending}
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-surface-container-high text-primary py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-surface-container-highest transition-all"
                >
                    Cancel
                </button>
             </div>
          </div>
        </div>
      )}
    </>
  );
}
