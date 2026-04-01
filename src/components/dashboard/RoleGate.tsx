"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { switchUserRole } from "@/lib/actions/role-actions";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

export function RoleGate({ currentRole, intendedRole, lastSwitchedAt }: { currentRole: string, intendedRole: "parent" | "caregiver", lastSwitchedAt?: Date | null }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  // Calculate cooldown
  let cooldownRemaining = 0;
  if (lastSwitchedAt) {
    const hoursSinceSwitch = (new Date().getTime() - new Date(lastSwitchedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceSwitch < 4) {
      cooldownRemaining = parseFloat((4 - hoursSinceSwitch).toFixed(1));
    }
  }

  const handleSwitch = async () => {
    if (cooldownRemaining > 0) {
      showToast(`Please wait ${cooldownRemaining} hours before switching roles again.`, "error");
      return;
    }

    setLoading(true);
    try {
      await switchUserRole(intendedRole);
      showToast(`Successfully switched your account to a ${intendedRole === "parent" ? "Family" : "Nanny"} profile!`, "success");
      router.refresh(); // Triggers server re-render
    } catch (err: any) {
      showToast(err.message || "Failed to switch role.", "error");
    } finally {
      setLoading(false);
    }
  };

  const benefits = intendedRole === "parent" ? [
    "Post childcare jobs instantly",
    "Review elite caregiver applicants",
    "Secure bookings with smart escrow",
    "Earn platform credits on hires"
  ] : [
    "Build a premium care portfolio",
    "Apply to high-paying family listings",
    "Get instant matching requests",
    "Earn 85% commission directly to bank"
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white rounded-[3rem] p-10 shadow-2xl border border-outline-variant/10 text-center relative overflow-hidden group">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl group-hover:bg-secondary/10 transition-colors"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center mx-auto shadow-inner">
            <MaterialIcon name={intendedRole === "parent" ? "family_restroom" : "child_care"} className="text-5xl text-primary" fill />
          </div>

          <div>
            <h1 className="font-headline text-4xl font-black text-primary tracking-tighter italic mb-3">
              Switch to {intendedRole === "parent" ? "Family Mode" : "Caregiver Mode"}
            </h1>
            <p className="text-on-surface-variant text-lg font-medium opacity-80 leading-relaxed italic px-4">
              You're currently viewing the app as a <span className="font-bold underline uppercase tracking-widest text-[10px]">{currentRole}</span>. 
              To access this dashboard, you need to swap your profile.
            </p>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 text-left space-y-3 shadow-sm border border-slate-100">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-fixed-dim opacity-50 mb-4 px-2">What you unlock</p>
             {benefits.map(b => (
               <div key={b} className="flex items-center gap-3 text-sm font-bold text-slate-700 italic">
                 <MaterialIcon name="check_circle" className="text-secondary text-lg" fill />
                 {b}
               </div>
             ))}
          </div>

          <div className="space-y-4 pt-4">
            <button 
              onClick={handleSwitch}
              disabled={loading || cooldownRemaining > 0}
              className="w-full py-5 bg-primary text-white font-headline font-black uppercase tracking-widest text-lg rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? "Switching Accounts..." : cooldownRemaining > 0 ? "Cooldown Active" : "Tap To Switch"}
              {!loading && cooldownRemaining === 0 && <MaterialIcon name="swap_horiz" />}
            </button>
            {cooldownRemaining > 0 ? (
               <p className="text-xs font-black uppercase tracking-widest text-error animate-pulse">
                You can switch back in {cooldownRemaining} hours.
               </p>
            ) : (
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1.5">
                 <MaterialIcon name="info" className="text-[12px]" />
                 You can switch back anytime (4hr cooldown)
               </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
