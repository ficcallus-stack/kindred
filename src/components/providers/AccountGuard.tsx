"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@/components/Toast";

export function AccountGuard() {
  const { user, role, dbUser, setRole, setDbUser, loading } = useAuth();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSettingRole, setIsSettingRole] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();

  // 1. Role Check
  const needsRole = user && !role && !loading;
  
  // 2. Email Check (Once a day logic)
  useEffect(() => {
    if (user && dbUser && !dbUser.emailVerified && !needsRole) {
      const lastShown = localStorage.getItem("last_email_verify_modal");
      const dayInMs = 24 * 60 * 60 * 1000;
      
      if (!lastShown || Date.now() - parseInt(lastShown) > dayInMs) {
        setShowEmailModal(true);
      }
    }
  }, [user, dbUser, needsRole]);

  const handleSelectRole = async (selectedRole: "parent" | "caregiver") => {
    setIsSettingRole(true);
    try {
      const res = await fetch("/api/auth/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (res.ok) {
        const data = await res.json();
        setRole(data.role);
        setDbUser({ role: data.role, emailVerified: data.emailVerified });
        showToast(`Welcome! You are now set as a ${selectedRole}.`, "success");
        
        // Redirect based on role
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
    localStorage.setItem("last_email_verify_modal", Date.now().toString());
  };

  // If we are on public pages, don't show the role guard unless explicitly needed?
  // Actually the user said "at the heart of the application", so it should guard everywhere for logged in users.
  // But let's exclude specific pages like /signup/role to avoid loops
  const isExcluded = pathname === "/signup/role" || pathname === "/login" || pathname === "/signup";

  if (isExcluded || loading) return null;

  return (
    <>
      {/* ── ROLE SELECTION MODAL (Undismissable) ── */}
      {needsRole && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-primary/20 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-surface-container-lowest max-w-xl w-full rounded-[3rem] p-10 shadow-2xl border border-outline-variant/10 text-center relative overflow-hidden">
              {/* Decorative patterns */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/5 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                 <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3">
                    <MaterialIcon name="person_search" className="text-4xl text-primary" fill />
                 </div>

                 <h2 className="text-3xl font-black font-headline text-primary tracking-tight mb-4">Complete your Profile</h2>
                 <p className="text-on-surface-variant mb-10 leading-relaxed">
                    Welcome to KindredCare! To provide you with the best experience, please let us know how you'll be using the platform.
                 </p>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                      onClick={() => handleSelectRole("parent")}
                      disabled={isSettingRole}
                      className="group p-6 bg-white border border-outline-variant/15 rounded-3xl hover:border-primary hover:shadow-xl hover:shadow-primary/5 transition-all text-left disabled:opacity-50"
                    >
                       <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors">
                          <MaterialIcon name="family_restroom" className="text-xl" fill />
                       </div>
                       <h3 className="font-headline font-bold text-primary mb-1">I'm a Parent</h3>
                       <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">Looking for trusted care professionals.</p>
                    </button>

                    <button 
                      onClick={() => handleSelectRole("caregiver")}
                      disabled={isSettingRole}
                      className="group p-6 bg-white border border-outline-variant/15 rounded-3xl hover:border-secondary hover:shadow-xl hover:shadow-secondary/5 transition-all text-left disabled:opacity-50"
                    >
                       <div className="w-10 h-10 bg-secondary/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-secondary group-hover:text-white transition-colors">
                          <MaterialIcon name="child_care" className="text-xl" fill />
                       </div>
                       <h3 className="font-headline font-bold text-primary mb-1">I'm a Nanny</h3>
                       <p className="text-[10px] text-on-surface-variant font-medium leading-relaxed">Offering professional care services.</p>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* ── EMAIL VERIFICATION MODAL (Dismissable) ── */}
      {showEmailModal && !needsRole && (
        <div className="fixed bottom-8 right-8 z-[9998] max-w-sm w-full animate-in slide-in-from-right-8 duration-700">
           <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.1)] border border-outline-variant/10 relative overflow-hidden group">
              <button 
                onClick={closeEmailModal}
                className="absolute top-6 right-6 text-on-surface-variant/40 hover:text-primary transition-colors"
                aria-label="Close"
              >
                 <MaterialIcon name="close" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                    <MaterialIcon name="mark_email_unread" className="text-amber-600" fill />
                 </div>
                 <div>
                    <h3 className="font-headline font-bold text-primary">Verify Email</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Secure Account</p>
                 </div>
              </div>

              <p className="text-sm text-on-surface-variant leading-relaxed mb-8">
                 Please verify your email address to unlock all platform features, including messaging and booking.
              </p>

              <div className="space-y-3">
                 <button 
                  onClick={() => router.push("/verify-email")}
                  className="w-full py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/10 hover:opacity-90 active:scale-95 transition-all"
                 >
                    Verify Now
                 </button>
                 <button 
                  onClick={closeEmailModal}
                  className="w-full py-4 text-on-surface-variant hover:text-primary text-xs font-bold transition-colors"
                 >
                    I'll do it later
                 </button>
              </div>
              
              {/* Progress Bar (24h) */}
              <div className="absolute bottom-0 left-0 h-1 bg-amber-500/20 w-full">
                 <div className="h-full bg-amber-500 w-1/4"></div>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
