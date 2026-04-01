"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

export default function RoleSelectionPage() {
  const { user, role, loading: authLoading, setRole, setDbUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"parent" | "caregiver" | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Redirect if already has a role or not logged in
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (role) {
        if (role === "admin" || role === "moderator") {
           router.push("/dashboard/moderator");
        } else {
           router.push(role === "caregiver" ? "/dashboard/nanny" : "/browse");
        }
      }
    }
  }, [user, role, authLoading, router]);

  const handleCompleteSync = async () => {
    if (!selectedRole) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!res.ok) throw new Error("Sync failed");
      
      const data = await res.json();
      setRole(data.role);
      setDbUser({ role: data.role, emailVerified: data.emailVerified ?? false });

      showToast(`Welcome! You're now set as a ${selectedRole === "parent" ? "Parent" : "Caregiver"}.`, "success");
      router.push(selectedRole === "caregiver" ? "/dashboard/nanny" : "/browse");
    } catch (err) {
      showToast("Failed to save your role. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || (user && role)) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-medium">Verifying your account...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden font-body">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-secondary/5 rounded-full blur-3xl opacity-50"></div>

      <div className="w-full max-w-2xl relative z-10 bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-primary/5 border border-outline-variant/10">
        <div className="text-center mb-12">
           <h1 className="text-4xl font-black font-headline text-primary italic tracking-tighter mb-4 leading-tight">Welcome to KindredCare!</h1>
           <p className="text-on-surface-variant font-medium text-lg leading-relaxed">
             We just need to know how you'll be using the platform to personalize your experience.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => setSelectedRole("parent")}
            className={cn(
              "group relative flex flex-col p-8 bg-slate-50 rounded-3xl text-left transition-all duration-300 border-2",
              selectedRole === "parent" ? "border-primary bg-white ring-8 ring-primary/5 shadow-xl" : "border-transparent hover:border-slate-200"
            )}
          >
            <div className={cn(
              "mb-6 w-14 h-14 flex items-center justify-center rounded-2xl transition-colors shadow-inner",
              selectedRole === "parent" ? "bg-primary text-white" : "bg-white text-primary"
            )}>
              <MaterialIcon name="family_history" className="text-3xl" />
            </div>
            <span className="font-headline font-black text-2xl text-primary tracking-tight italic">Parent</span>
            <span className="text-sm text-on-surface-variant font-medium opacity-60 mt-1">Seeking exceptional childcare services.</span>
          </button>

          <button 
            onClick={() => setSelectedRole("caregiver")}
            className={cn(
              "group relative flex flex-col p-8 bg-slate-50 rounded-3xl text-left transition-all duration-300 border-2",
              selectedRole === "caregiver" ? "border-primary bg-white ring-8 ring-primary/5 shadow-xl" : "border-transparent hover:border-slate-200"
            )}
          >
            <div className={cn(
              "mb-6 w-14 h-14 flex items-center justify-center rounded-2xl transition-colors shadow-inner",
              selectedRole === "caregiver" ? "bg-primary text-white" : "bg-white text-primary"
            )}>
              <MaterialIcon name="medical_services" className="text-3xl" />
            </div>
            <span className="font-headline font-black text-2xl text-primary tracking-tight italic">Caregiver</span>
            <span className="text-sm text-on-surface-variant font-medium opacity-60 mt-1">Providing trusted professional care.</span>
          </button>
        </div>

        <button 
          onClick={handleCompleteSync}
          disabled={!selectedRole || loading}
          className="w-full py-6 bg-primary text-white font-headline font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest text-xs disabled:opacity-30 disabled:hover:scale-100"
        >
          {loading ? "Saving your role..." : "Start My Journey"}
        </button>
      </div>
    </main>
  );
}
