"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "kindred_verification_dismissed_at";

export function VerificationRemindModal() {
  const { user, dbUser } = useAuth();
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!user || !dbUser) return;
    if (dbUser.emailVerified) return;

    const lastDismissed = localStorage.getItem(DISMISS_KEY);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    if (!lastDismissed || now - parseInt(lastDismissed) > oneDay) {
       setShow(true);
    }
  }, [user, dbUser]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-10 left-10 z-[8000] w-full max-w-sm bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_32px_128px_rgba(0,0,0,0.1)] border border-white p-6 animate-in slide-in-from-left duration-500 ring-8 ring-primary/5">
      <button 
        onClick={handleDismiss}
        className="absolute top-6 right-6 text-on-surface-variant/40 hover:text-primary transition-all p-2 hover:bg-slate-50 rounded-full"
      >
        <MaterialIcon name="close" className="text-xl" />
      </button>

      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner">
          <MaterialIcon name="mark_email_read" className="text-3xl" fill />
        </div>
        
        <h3 className="font-headline font-black text-2xl text-primary tracking-tighter italic mb-3">Confirm Your Mission</h3>
        <p className="text-sm font-medium text-on-surface-variant leading-relaxed opacity-70 mb-8">
          To unlock all secure features & payments, you must verify your email address. 
        </p>

        <div className="flex flex-col w-full gap-3">
           <Button 
             onClick={() => router.push("/verify-email")}
             className="w-full h-14 bg-primary text-white font-headline font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
           >
             Verify Now
           </Button>
           <button 
             onClick={handleDismiss}
             className="py-3 text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 hover:text-primary transition-colors"
           >
             Remind Me Tomorrow
           </button>
        </div>
      </div>
    </div>
  );
}
