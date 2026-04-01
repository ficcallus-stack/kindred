"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/Toast";

export function AuthGuard() {
  const { user, role, dbUser, setRole, setDbUser, loading } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSettingRole, setIsSettingRole] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // 1. Role Check (Undismissable)
  const needsRole = user && !user.isAnonymous && !role && !loading;
  
  // 2. Email Check (Once a day logic)
  useEffect(() => {
    if (user && !user.isAnonymous && dbUser && !dbUser.emailVerified && !needsRole && !loading) {
      const lastShown = localStorage.getItem("kindred_email_verify_dismissed_at");
      const dayInMs = 24 * 60 * 60 * 1000;
      
      if (!lastShown || Date.now() - parseInt(lastShown) > dayInMs) {
        setShowEmailModal(true);
      }
    }
  }, [user, dbUser, needsRole, loading]);

  const handleSelectRole = async (selectedRole: "parent" | "caregiver") => {
    setIsSettingRole(true);
    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        setDbUser({ role: data.role, emailVerified: data.emailVerified });
        showToast(`Welcome! You are now set as a ${selectedRole === "parent" ? "Parent" : "Caregiver"}.`, "success");
        
        // Soft redirect to ensure dashboard state matches
        if (selectedRole === "parent") router.push("/browse");
        else router.push("/dashboard/nanny");
      }
    } catch (err) {
      showToast("Failed to assign role. Please try again.", "error");
    } finally {
      setIsSettingRole(false);
    }
  };

  const closeEmailModal = () => {
    setShowEmailModal(false);
    localStorage.setItem("kindred_email_verify_dismissed_at", Date.now().toString());
  };

  // Exclude auth-related pages to avoid redirection loops or blocking UI
  const isExcluded = pathname === "/signup/role" || pathname === "/login" || pathname === "/signup" || pathname === "/verify-email" || pathname === "/forgot-password";

  if (loading || !user || user.isAnonymous) return null;

  return (
    <>
      {/* ── ROLE SELECTION MODAL (Undismissable) ── */}
      {needsRole && !isExcluded && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-primary/20 backdrop-blur-3xl animate-in fade-in duration-700">
           <div className="w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-white/50 animate-in zoom-in-95 duration-500">
              {/* Background Decor */}
              <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl opacity-50" />
              <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl opacity-50" />

              <div className="relative z-10">
                 <div className="text-center mb-12">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-inner">
                       <MaterialIcon name="person_search" className="text-3xl text-primary" fill />
                    </div>
                    <h2 className="text-3xl font-black font-headline text-primary tracking-tighter mb-4 leading-tight">Complete your Kindred Profile</h2>
                    <p className="text-on-surface-variant font-medium leading-relaxed max-w-sm mx-auto italic opacity-70">
                       We need to know how you'll be using the platform to tailor your experience.
                    </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <button 
                      onClick={() => handleSelectRole("parent")}
                      disabled={isSettingRole}
                      className="group p-8 bg-slate-50 border-2 border-transparent hover:border-primary hover:bg-white hover:shadow-2xl hover:shadow-primary/5 rounded-[2.5rem] transition-all text-left disabled:opacity-50"
                    >
                       <div className="mb-4 w-12 h-12 flex items-center justify-center rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <MaterialIcon name="family_history" className="text-2xl" fill />
                       </div>
                       <h3 className="font-headline font-black text-xl text-primary mb-1">Parent</h3>
                       <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed opacity-60">Seeking premium, trusted childcare professionals.</p>
                    </button>

                    <button 
                      onClick={() => handleSelectRole("caregiver")}
                      disabled={isSettingRole}
                      className="group p-8 bg-slate-50 border-2 border-transparent hover:border-secondary hover:bg-white hover:shadow-2xl hover:shadow-secondary/5 rounded-[2.5rem] transition-all text-left disabled:opacity-50"
                    >
                       <div className="mb-4 w-12 h-12 flex items-center justify-center rounded-xl bg-secondary/5 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                          <MaterialIcon name="medical_services" className="text-2xl" fill />
                       </div>
                       <h3 className="font-headline font-black text-xl text-primary mb-1">Caregiver</h3>
                       <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed opacity-60">Offering certified expertise & professional care.</p>
                    </button>
                 </div>

                 <p className="text-center text-[9px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em]">
                    Choice is mandatory for platform security & role-based dashboard access.
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* ── EMAIL VERIFICATION MODAL (Dismissable) ── */}
      {showEmailModal && !needsRole && !isExcluded && (
        <div className="fixed bottom-10 left-10 z-[8000] w-full max-w-sm animate-in slide-in-from-left-8 duration-700">
           <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-10 shadow-[0_32px_128px_rgba(0,0,0,0.1)] border border-white relative overflow-hidden group ring-8 ring-primary/5">
              <button 
                onClick={closeEmailModal}
                className="absolute top-6 right-6 text-on-surface-variant/40 hover:text-primary transition-all p-2 hover:bg-slate-50 rounded-full"
                aria-label="Close"
              >
                 <MaterialIcon name="close" className="text-xl" />
              </button>

              <div className="flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 shadow-inner">
                    <MaterialIcon name="mark_email_unread" className="text-3xl" fill />
                 </div>
                 
                 <h3 className="font-headline font-black text-2xl text-primary tracking-tighter italic mb-3">Verify Your Email</h3>
                 <p className="text-sm font-medium text-on-surface-variant leading-relaxed opacity-70 mb-8 px-2">
                    Unlock all secure features, including messaging and booking, by confirming your address. 
                 </p>

                 <div className="flex flex-col w-full gap-3">
                    <button 
                      onClick={() => { setShowEmailModal(false); router.push("/verify-email"); }}
                      className="w-full h-14 bg-primary text-white font-headline font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                       Verify Account Now
                    </button>
                    <button 
                      onClick={closeEmailModal}
                      className="py-3 text-[9px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 hover:text-primary transition-colors"
                    >
                       Remind Me Tomorrow
                    </button>
                 </div>
              </div>
              
              <div className="absolute bottom-0 left-0 h-1 bg-amber-500/20 w-full">
                 <div className="h-full bg-amber-500 w-1/4 animate-pulse"></div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
