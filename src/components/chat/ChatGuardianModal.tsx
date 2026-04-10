"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { checkChatAccess, createChatUnlockSession } from "@/app/dashboard/messages/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChatGuardianModalProps {
  caregiverId: string;
  caregiverName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatGuardianModal({ caregiverId, caregiverName, isOpen, onClose }: ChatGuardianModalProps) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      verifyAccess();
    }
  }, [isOpen, caregiverId]);

  const verifyAccess = async () => {
    setLoading(true);
    try {
      const res = await checkChatAccess(caregiverId);
      if (res.hasAccess) {
        setHasAccess(true);
        // Direct redirect if already have access
        router.push(`/dashboard/messages?userId=${caregiverId}`);
      }
    } catch (err: any) {
      console.error("Access check failed:", err);
      if (err.message === "Unauthorized") {
        router.push(`/login?redirect=/nannies/${caregiverId}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setIsProcessing(true);
    try {
      const res = await createChatUnlockSession(caregiverId);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      showToast(err.message || "Failed to start checkout", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;
  
  // Loading overlay
  if (loading || hasAccess) return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-6 animate-in fade-in duration-700">
      <div className="absolute inset-0 bg-gradient-to-tr from-slate-50 via-white to-blue-50/30"></div>
      
      <div className="flex flex-col items-center gap-12 relative z-10 w-full max-w-sm">
        <div className="relative w-40 h-40 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-[1px] border-slate-200 rounded-full"></div>
          
          {/* Rotating Data Nodes */}
          <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"></div>
          </div>
          <div className="absolute inset-4 animate-[spin_12s_linear_reverse_infinite]">
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_12px_rgba(var(--secondary-rgb),0.5)]"></div>
          </div>

          {/* Central Logo/Icon */}
          <div className="w-24 h-24 bg-white rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.08)] flex items-center justify-center relative z-10 border border-slate-50">
             <div className="absolute inset-0 bg-primary/5 rounded-full animate-ping duration-[3s]"></div>
             <MaterialIcon name="security" className="text-5xl text-primary animate-pulse" fill />
          </div>
          
          {/* Scanning Line */}
          <div className="absolute inset-0 animate-[pulse_2s_infinite]">
             <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent absolute top-1/2 -translate-y-1/2"></div>
          </div>
        </div>
        
        <div className="text-center space-y-6">
            <div className="space-y-2">
              <h3 className="font-headline font-black text-primary text-3xl tracking-tighter italic">Establishing <span className="text-secondary-fixed-dim">Bridge</span></h3>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.5em] opacity-60 animate-pulse">Kindred Encryption v4.0 Active</p>
            </div>
            
            <div className="w-full bg-slate-100 h-[3px] rounded-full overflow-hidden relative">
                <div className="absolute inset-y-0 bg-primary animation-loading-bar w-1/3 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Peer-to-Peer</span>
               <span className="opacity-20">|</span>
               <span>TLS 1.3 Secure</span>
            </div>
        </div>
      </div>
      
      <style jsx>{`
        .animation-loading-bar {
          animation: slide 2s ease-in-out infinite;
        }
        @keyframes slide {
          0% { left: -100%; width: 30%; }
          50% { width: 60%; }
          100% { left: 200%; width: 30%; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-[#000716]/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
        <button onClick={onClose} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all z-10 hover:rotate-90">
          <MaterialIcon name="close" />
        </button>

        <div className="p-10 pt-16 text-center">
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 group overflow-hidden relative">
            <div className="absolute inset-0 bg-primary/5 group-hover:scale-110 transition-transform duration-700"></div>
            <MaterialIcon name="chat" className="text-5xl text-primary relative z-10" fill />
          </div>

          <h2 className="text-3xl md:text-4xl font-headline font-black text-primary leading-[1.1] mb-4 tracking-tighter italic">
            Unlock <span className="text-secondary-fixed-dim">Conversation</span><br />with {caregiverName.split(' ')[0]}
          </h2>
          
          <p className="text-on-surface-variant font-medium leading-relaxed mb-10 px-4 text-base italic">
            To ensure serious inquiries and protect caregiver time, we require a small one-time connection fee for private access.
          </p>

          <div className="space-y-6">
            <button 
              onClick={handleUnlock}
              disabled={isProcessing}
              className="w-full bg-primary text-white font-headline font-bold py-6 rounded-2xl shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              {isProcessing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-2xl italic tracking-tighter">$2.00</span>
                  <div className="w-px h-6 bg-white/20"></div>
                  <span className="uppercase tracking-widest text-xs">Unlock Forever</span>
                  <MaterialIcon name="arrow_forward" className="text-sm group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="p-8 bg-surface-container-low rounded-3xl border border-outline-variant/10 flex flex-col items-center gap-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-secondary/10 transition-all duration-700"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary mb-1">Platinum Advantage</span>
              <p className="text-sm text-on-surface-variant font-medium leading-tight">
                Kindred <span className="text-primary font-black">Elite Families</span> get unlimited unlocks for free.
              </p>
              <Link href="/pricing" className="text-xs font-black text-primary hover:underline mt-2 flex items-center gap-1 group/link">
                Compare Memberships
                <MaterialIcon name="chevron_right" className="text-xs group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
            <span className="flex items-center gap-1"><MaterialIcon name="verified_user" className="text-[10px]" /> Encrypted</span>
            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
            <span>Unlocks permanently</span>
          </div>
        </div>
      </div>
    </div>
  );
}
