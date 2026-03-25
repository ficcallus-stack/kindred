"use client";

import { useState } from "react";
import Link from "next/link";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-client";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";

export default function SignUpPage() {
  const { showToast } = useToast();
  
  const [role, setRole] = useState<"parent" | "caregiver" | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle the signup submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      showToast("Please select your role (Parent or Caregiver) first.", "error");
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, emailAddress, password);

      // Set display name
      await updateProfile(credential.user, { displayName: fullName });

      // Sync to our DB with role
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, fullName }),
      });

      showToast("Check your email for a verification code!", "success");
      router.push("/verify-email");
    } catch (err: any) {
      const msg = err.code === "auth/email-already-in-use"
        ? "An account with this email already exists. Please sign in."
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters."
        : "Signup failed. Please check your details.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const signUpWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      
      // Sync to DB (role might be set later for Google users)
      await fetch("/api/auth/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: role || "parent" }),
      });

      showToast("Welcome to the Kindred family!", "success");
      router.push("/");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        showToast("Social signup failed. Please try email signup.", "error");
      }
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">
      {/* Top Navigation Shell */}
      <nav className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-sm shadow-blue-900/5">
        <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="text-xl font-bold tracking-tighter text-blue-900 font-headline">
            KindredCare <span className="text-accent-red underline decoration-accent-red/20 decoration-2 underline-offset-4">US</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="font-headline text-sm font-semibold tracking-tight text-slate-600 hover:text-blue-900 transition-all duration-300">
              Home
            </Link>
          </div>
          <Link href="/login" className="bg-primary text-white font-bold px-5 py-2 rounded-xl text-xs active:scale-95 transition-transform uppercase tracking-widest shadow-lg shadow-primary/10">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4 relative">

        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Branding & Welcome Column */}
          <div className="space-y-8 lg:pr-12">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant text-[10px] font-black uppercase tracking-[0.2em]">
                Premium Care
              </span>
              <h1 className="font-headline text-5xl md:text-6xl font-black tracking-tighter text-primary leading-[1.1]">
                Join the <span className="text-accent-red">KindredCare</span> Community
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed font-medium">
                Experience a bespoke childcare journey designed with safety, trust, and human connection at its heart.
              </p>
            </div>
            
            <div className="relative group asymmetric-radius overflow-hidden editorial-shadow">
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/0 transition-colors duration-500 z-10"></div>
              <img
                alt="Smiling diverse family"
                className="w-full aspect-square object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBepyv5YWMXnwkEFGbrREbn6QFlqC9uiBA99AAXsBMCYo41Nlm0tqzGAZWCyz-tzFF52adiC8EUzhZBPug5HD_SyidpkmbYAZ9AyB2nehR5o-XTu603T8iFpbL-2LcNKHXwFV1cXGWy9Oga00mIZIYFGnz68fTXRPc-cWx63FDmDVx38FnLzijBWod_7DIuX3XvIslPsANnK1-jgxNaWNeZq4kaNLr2hKMhLIHDjwx0HlrYaHXpuMjA9nULFjCCnCzP9XsMKluSx6I"
              />
            </div>
          </div>

          {/* Custom Registration Column */}
          <div className="space-y-8 bg-surface-container-low p-8 lg:p-12 rounded-[2rem] border border-outline-variant/10 shadow-sm relative overflow-hidden">
            
            {/* Role Selection */}
            <div className="space-y-6">
              <h3 className="font-headline text-xl font-bold text-primary italic">I am a...</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={() => setRole("parent")}
                  className={cn(
                    "group relative flex flex-col p-6 bg-white rounded-2xl text-left transition-all duration-300 shadow-sm border-2",
                    role === "parent" ? "border-primary ring-8 ring-primary/5" : "border-transparent hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "mb-4 w-12 h-12 flex items-center justify-center rounded-xl transition-colors shadow-inner",
                    role === "parent" ? "bg-primary text-white" : "bg-secondary-fixed text-on-secondary-fixed"
                  )}>
                    <MaterialIcon name="family_history" className="text-2xl" />
                  </div>
                  <span className="font-headline font-bold text-lg text-primary tracking-tight">Parent</span>
                  <span className="text-xs text-on-surface-variant font-medium opacity-60">Finding safe, professional care.</span>
                </button>

                <button 
                  onClick={() => setRole("caregiver")}
                  className={cn(
                    "group relative flex flex-col p-6 bg-white rounded-2xl text-left transition-all duration-300 shadow-sm border-2",
                    role === "caregiver" ? "border-primary ring-8 ring-primary/5" : "border-transparent hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "mb-4 w-12 h-12 flex items-center justify-center rounded-xl transition-colors shadow-inner",
                    role === "caregiver" ? "bg-primary text-white" : "bg-tertiary-fixed text-on-tertiary-fixed"
                  )}>
                    <MaterialIcon name="medical_services" className="text-2xl" />
                  </div>
                  <span className="font-headline font-bold text-lg text-primary tracking-tight">Caregiver</span>
                  <span className="text-xs text-on-surface-variant font-medium opacity-60">Providing trusted support.</span>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="font-label text-xs font-black text-primary/40 px-1 uppercase tracking-widest">Full Name</label>
                <input 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-outline-variant/15 rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium placeholder:text-slate-200 shadow-inner" 
                  placeholder="Jane Doe" 
                  type="text"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="font-label text-xs font-black text-primary/40 px-1 uppercase tracking-widest">Email</label>
                  <input 
                    required
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full bg-white border border-outline-variant/15 rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium placeholder:text-slate-200 shadow-inner" 
                    placeholder="jane@example.com" 
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-label text-xs font-black text-primary/40 px-1 uppercase tracking-widest">Password</label>
                  <input 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-outline-variant/15 rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium placeholder:text-slate-200 shadow-inner" 
                    placeholder="••••••••" 
                    type="password"
                  />
                </div>
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full bg-primary text-white font-headline font-black py-5 rounded-xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-[10px] mt-4 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div className="space-y-6 pt-6 border-t border-slate-100">
              <div className="relative flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-100"></div>
                <span className="text-[10px] font-black text-on-surface-variant tracking-[0.2em] uppercase opacity-40">Or Continue With</span>
                <div className="h-px flex-1 bg-slate-100"></div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button 
                  type="button"
                  onClick={signUpWithGoogle}
                  className="flex items-center justify-center gap-3 bg-white border border-outline-variant/10 py-4 rounded-xl hover:bg-slate-50 transition-all font-black text-[10px] text-primary uppercase tracking-widest shadow-sm"
                >
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzl_awn8TETYvPD_AIds-P1a8Vf-rM2Cvm9pAY0bT7ssIi6W_80DjKUSVTBgz3-NT-iEJgKuKZzPzoKneVa81CrBjbm_1wJVILIkz3mCvVANhEOyXOzRWtFUhq7MdGKcnNzyGMLel-ubBE5uSIsbDKesSC0OqVbO-B9q3XPNUYPVo1gksGcSVCmSiyuPA9poiE5ss2iNAOc65Ml91fYoastaHfsKrsHK6cGlcsSS8yih6pBLBhqb16JbsjvHBUSNeMCiWoaOhGvNo" className="w-5 h-5 grayscale opacity-50" alt="Google" />
                  Google
                </button>
              </div>
              <p className="text-center text-sm font-medium text-on-surface-variant">
                Already have an account? 
                <Link href="/login" className="text-accent-red font-black hover:underline underline-offset-4 ml-1 italic tracking-tight">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
