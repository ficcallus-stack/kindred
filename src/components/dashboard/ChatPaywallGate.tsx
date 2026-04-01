"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface ChatPaywallGateProps {
  nannyName: string;
  onUnlock: () => Promise<void>;
}

export function ChatPaywallGate({ nannyName, onUnlock }: ChatPaywallGateProps) {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      await onUnlock();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Premium Glassmorphic Backdrop */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-2xl" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full animate-pulse delay-700" />

      <div className="relative max-w-lg w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-white/20 text-center space-y-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-primary/5 rounded-[2rem] flex items-center justify-center mx-auto ring-8 ring-primary/5">
          <MaterialIcon name="lock" className="text-4xl text-primary animate-bounce-subtle" fill />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black font-headline text-primary tracking-tighter italic leading-tight">
            Unlock Chat with {nannyName}
          </h2>
          <p className="text-on-surface-variant font-medium opacity-60 leading-relaxed italic">
            To maintain our high standards of safety and elite caregiver privacy, chatting with nannies before a confirmed booking requires an active unlock or a Premium membership.
          </p>
        </div>

        <div className="space-y-4">
          {/* Unlock Option 1: One-time Pay */}
          <button 
            onClick={handleUnlock}
            disabled={loading}
            className="w-full flex items-center justify-between p-6 bg-white rounded-3xl border-2 border-primary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group overflow-hidden relative active:scale-95"
          >
            <div className="text-left relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">One-Time Access</p>
              <p className="text-xl font-black font-headline text-primary italic">Unlock This Chat</p>
              <p className="text-xs font-bold text-on-surface-variant opacity-60">Permanent access to {nannyName}</p>
            </div>
            <div className="text-right relative z-10">
              {loading ? (
                <Loader2 className="animate-spin text-primary" />
              ) : (
                <p className="text-2xl font-black font-headline text-primary italic">$1.50</p>
              )}
            </div>
          </button>

          {/* Unlock Option 2: Premium Upsell */}
          <Link href="/dashboard/parent/wallet" className="block group">
            <div className="w-full flex items-center justify-between p-6 bg-indigo-600 rounded-3xl border-2 border-indigo-500 shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95 text-white">
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Kindred Elite</p>
                <p className="text-xl font-black font-headline italic">Go Premium</p>
                <p className="text-xs font-bold text-white/70">Unlimited chat with every nanny</p>
              </div>
              <div className="flex items-center gap-2">
                 <MaterialIcon name="diamond" className="text-2xl" fill />
              </div>
            </div>
          </Link>
        </div>

        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
           Payments are processed securely via Stripe. Unlocked chats remain open even if you don't hire this caregiver immediately.
        </p>
      </div>
    </div>
  );
}
