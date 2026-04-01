"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";

export function RoleSelectionModal() {
  const { setRole, setDbUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"parent" | "caregiver" | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

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
      
      showToast(`Welcome! You are now registered as a ${selectedRole === "parent" ? "Parent" : "Caregiver"}.`, "success");
    } catch (err) {
      showToast("Failed to save your role. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-primary/20 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-white rounded-[3rem] p-12 shadow-2xl relative overflow-hidden border border-white/50 animate-in zoom-in-95 duration-500">
        {/* Background Decor */}
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-secondary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-3xl opacity-50" />

        <div className="relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black font-headline text-primary italic tracking-tighter mb-4 leading-tight">Tailoring Your Experience</h2>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-md mx-auto italic">
              Welcome to the Kindred family. Please select how you will be joining our community today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <button 
              onClick={() => setSelectedRole("parent")}
              className={cn(
                "group relative flex flex-col p-8 bg-slate-50/50 rounded-[2.5rem] text-left transition-all duration-300 border-2",
                selectedRole === "parent" ? "border-primary bg-white shadow-2xl ring-8 ring-primary/5" : "border-transparent hover:border-slate-200"
              )}
            >
              <div className={cn(
                "mb-6 w-14 h-14 flex items-center justify-center rounded-2xl transition-colors shadow-inner",
                selectedRole === "parent" ? "bg-primary text-white" : "bg-white text-primary"
              )}>
                <MaterialIcon name="family_history" className="text-3xl" />
              </div>
              <span className="font-headline font-black text-2xl text-primary tracking-tight italic">Parent</span>
              <span className="text-sm text-on-surface-variant font-medium opacity-60 mt-1">Seeking premium childcare solutions.</span>
            </button>

            <button 
              onClick={() => setSelectedRole("caregiver")}
              className={cn(
                "group relative flex flex-col p-8 bg-slate-50/50 rounded-[2.5rem] text-left transition-all duration-300 border-2",
                selectedRole === "caregiver" ? "border-primary bg-white shadow-2xl ring-8 ring-primary/5" : "border-transparent hover:border-slate-200"
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

          <Button 
            onClick={handleCompleteSync}
            disabled={!selectedRole || loading}
            className="w-full h-20 rounded-[1.5rem] bg-primary text-white font-headline font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20"
          >
            {loading ? "Initializing Account..." : "Enter KindredCare"}
          </Button>

          <p className="text-center text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-8">
            This selection is required for account security & compliance.
          </p>
        </div>
      </div>
    </div>
  );
}
