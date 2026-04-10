"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { applyToJob, cancelApplication } from "../actions";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import Link from "next/link";

import { useRouter } from "next/navigation";

interface ApplyButtonProps {
    jobId: string;
    isVerified: boolean;
    isPremium?: boolean;
    hasApplied?: boolean;
    applicationId?: string;
    familyName?: string;
    size?: "sm" | "md" | "lg";
    fullWidth?: boolean;
}

export default function ApplyButton({ 
    jobId, 
    isVerified, 
    isPremium = false,
    hasApplied: initialHasApplied, 
    applicationId,
    familyName = "the Family",
    size = "md",
    fullWidth = false
}: ApplyButtonProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [isApplying, setIsApplying] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [hasApplied, setHasApplied] = useState(initialHasApplied);
    const [currentApplicationId, setCurrentApplicationId] = useState(applicationId);
    const { showToast } = useToast();
    const router = useRouter();

    const canApply = isVerified || isPremium;

    const handleApply = async () => {
        if (!canApply) {
            showToast("Verification Required: You must be a verified caregiver or a premium subscriber to apply.", "error");
            return;
        }

        if (!message || message.trim().length < 20) {
            showToast("Please write a bit more in your pitch (at least 20 characters).", "error");
            return;
        }

        setIsApplying(true);
        try {
            const result = await applyToJob(jobId, message);
            setHasApplied(true);
            setCurrentApplicationId(result.applicationId);
            setIsMenuOpen(false);
            showToast("Application submitted successfully!", "success");
            
            // Redirect to the status page after a brief delay
            setTimeout(() => {
                router.push(`/dashboard/nanny/applications/${result.applicationId}`);
            }, 1000);
        } catch (err: any) {
            showToast(err.message || "Failed to apply.", "error");
        } finally {
            setIsApplying(false);
        }
    };

    const handleCancel = async () => {
        if (!currentApplicationId) return;
        setIsCancelling(true);
        try {
            await cancelApplication(currentApplicationId);
            setHasApplied(false);
            setIsCancelConfirmOpen(false);
            showToast("Application withdrawn successfully.", "success");
            router.refresh();
        } catch (err: any) {
            showToast(err.message || "Failed to withdraw application.", "error");
        } finally {
            setIsCancelling(false);
        }
    };

    if (hasApplied) {
        return (
            <div className="space-y-3">
                <div className="w-full py-4 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-xl font-headline font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                    <MaterialIcon name="check_circle" className="text-lg" fill />
                    Application Submitted
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Link 
                        href={`/dashboard/nanny/applications/${currentApplicationId}`}
                        className="py-3 bg-primary/5 text-primary rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                    >
                        <MaterialIcon name="visibility" className="text-sm" />
                        View Status
                    </Link>
                    <button 
                        onClick={() => setIsCancelConfirmOpen(true)}
                        className="py-3 bg-error/5 text-error rounded-xl font-bold uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:bg-error hover:text-white transition-all"
                    >
                        <MaterialIcon name="cancel" className="text-sm" />
                        Withdraw
                    </button>
                </div>

                {/* Cancel Confirmation Modal */}
                {isCancelConfirmOpen && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
                        <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 border border-outline-variant/10 animate-in zoom-in-95 duration-300">
                            <div className="w-16 h-16 bg-error/10 rounded-2xl flex items-center justify-center text-error mb-6">
                                <MaterialIcon name="report" className="text-3xl" />
                            </div>
                            <h3 className="font-headline text-2xl font-black text-primary italic tracking-tighter leading-tight mb-2">Withdraw Application?</h3>
                            <p className="text-on-surface-variant font-medium text-sm leading-relaxed mb-8">
                                Are you sure you want to withdraw your application? This cannot be undone and you'll lose your spot in the review queue.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsCancelConfirmOpen(false)}
                                    className="flex-1 py-4 bg-surface-container-low text-on-surface-variant rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-surface-container-high transition-all"
                                >
                                    No, Keep it
                                </button>
                                <button 
                                    onClick={handleCancel}
                                    disabled={isCancelling}
                                    className="flex-1 py-4 bg-error text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-error/20 hover:opacity-90 transition-all flex items-center justify-center"
                                >
                                    {isCancelling ? <MaterialIcon name="sync" className="animate-spin" /> : "Yes, Withdraw"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            <button 
                onClick={() => canApply ? setIsMenuOpen(true) : showToast("Verification Required", "error")}
                className={cn(
                    "rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3",
                    fullWidth ? "w-full" : "w-max px-12",
                    size === "sm" && "py-3 text-[10px]",
                    size === "md" && "py-5 text-[11px]",
                    size === "lg" && "py-6 text-sm",
                    canApply 
                        ? "bg-gradient-to-br from-primary to-primary-container text-white shadow-primary/20 hover:opacity-95" 
                        : "bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10 shadow-none"
                )}
            >
                {!canApply ? (
                    <>
                        <MaterialIcon name="lock" />
                        Verification Required
                    </>
                ) : (
                    <>
                        Apply Now
                        <MaterialIcon name="arrow_forward" />
                    </>
                )}
            </button>

            {/* Pitch Modal */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10 animate-in zoom-in-95 duration-300">
                        <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-headline text-2xl font-black text-primary italic tracking-tighter">Your Application Pitch</h3>
                                <p className="text-on-surface-variant text-sm font-medium mt-1">Introduce yourself to {familyName}</p>
                            </div>
                            <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 transition-colors flex items-center justify-center text-on-surface-variant">
                                <MaterialIcon name="close" />
                            </button>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 block">Tell them why you're a great fit</label>
                                <textarea 
                                    className="w-full min-h-[160px] bg-surface-container-low border-none rounded-2xl p-6 font-medium text-on-surface-variant focus:ring-2 focus:ring-primary/10 placeholder:opacity-30"
                                    placeholder="e.g. Hi Thompson Family! I have 5 years of experience with toddlers and love creative arts..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                ></textarea>
                                <div className="flex justify-between items-center px-1">
                                    <span className={cn("text-[10px] font-bold", message.length < 20 ? "text-error" : "text-green-600")}>
                                        {message.length} / 20 characters min
                                    </span>
                                    <span className="text-[10px] font-bold text-on-surface-variant/20 italic">Families appreciate thoughtful notes.</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleApply}
                                disabled={isApplying || message.length < 20}
                                className={cn(
                                    "w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3",
                                    message.length >= 20 ? "bg-primary text-white shadow-primary/20" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                {isApplying ? (
                                    <>
                                        <MaterialIcon name="sync" className="animate-spin" />
                                        Sending Application...
                                    </>
                                ) : (
                                    <>
                                        Send Application
                                        <MaterialIcon name="send" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
