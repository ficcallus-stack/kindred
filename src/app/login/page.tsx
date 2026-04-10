"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword, signInWithPopup, signInAnonymously } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase-client";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const { user, loading: authLoading, role } = useAuth();
  const { showToast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect_url");

  // Redirect based on user role
  useEffect(() => {
    if (!authLoading && user && !user.isAnonymous) {
      if (role) {
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          if (role === "caregiver") {
            router.push("/dashboard/nanny");
          } else if (role === "parent") {
            router.push("/browse");
          } else if (role === "admin" || role === "moderator") {
            router.push("/dashboard/moderator");
          } else {
            router.push("/");
          }
        }
      } else {
        // Authenticated but no role found in synced DB -> force role selection
        const timer = setTimeout(() => {
          router.push("/signup/role");
        }, 1500); // Small grace period for sync to complete
        return () => clearTimeout(timer);
      }
    }
  }, [user, authLoading, role, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast("Welcome back to Kindred!", "success");
      if (redirectPath) router.push(redirectPath);
    } catch (err: any) {
      const msg = err.code === "auth/invalid-credential" 
        ? "Invalid email or password. Please try again."
        : err.code === "auth/user-not-found"
        ? "No account found with this email."
        : err.code === "auth/too-many-requests"
        ? "Too many attempts. Please try again later."
        : "Login failed. Please check your credentials.";
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Welcome to Kindred!", "success");
      if (redirectPath) router.push(redirectPath);
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        showToast("Google login failed. Please try email login.", "error");
      }
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      await signInAnonymously(auth);
      showToast("Browsing as guest. Sign up anytime to save your progress!", "info");
      router.push("/");
    } catch {
      showToast("Guest login failed. Please try again.", "error");
    }
  };

  if (user && !user.isAnonymous && !role) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-8 shadow-xl shadow-primary/5"></div>
        <h2 className="text-2xl font-headline font-bold text-primary mb-2">Setting things up...</h2>
        <p className="text-on-surface-variant font-medium text-sm">We're tailoring your dashboard experience.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen">

      <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-20">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-orange/5 rounded-full blur-[120px] opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] opacity-40"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Side: Editorial Content (5/12) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-10">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                 <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/10">
                   Member Access
                 </span>
              </div>
              <h1 className="font-headline text-5xl lg:text-7xl font-black text-primary leading-[0.9] italic tracking-tighter">
                Welcome <span className="text-secondary opacity-70">home.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-md leading-relaxed font-medium">
                Rejoin the circle of trust. Access your bespoke dashboard and manage your care journey with ease.
              </p>
            </div>

            <div className="relative group rounded-[3rem] overflow-hidden shadow-2xl shadow-primary/10 border-4 border-white/50 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-60 z-10"></div>
              <img 
                alt="Kindred community" 
                className="w-full h-[400px] object-cover scale-110 group-hover:scale-100 transition-all duration-[3000ms] ease-out" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBepyv5YWMXnwkEFGbrREbn6QFlqC9uiBA99AAXsBMCYo41Nlm0tqzGAZWCyz-tzFF52adiC8EUzhZBPug5HD_SyidpkmbYAZ9AyB2nehR5o-XTu603T8iFpbL-2LcNKHXwFV1cXGWy9Oga00mIZIYFGnz68fTXRPc-cWx63FDmDVx38FnLzijBWod_7DIuX3XvIslPsANnK1-jgxNaWNeZq4kaNLr2hKMhLIHDjwx0HlrYaHXpuMjA9nULFjCCnCzP9XsMKluSx6I" 
              />
              <div className="absolute top-8 left-8">
                 <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/30 flex items-center gap-3">
                    <MaterialIcon name="verified" className="text-white text-xl" fill />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">Enterprise Secure</span>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card (7/12) */}
          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white/60 backdrop-blur-2xl p-10 md:p-14 rounded-[4rem] shadow-[0_48px_128px_rgba(0,0,0,0.06)] border border-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

              <div className="mb-12 text-center lg:text-left">
                <h2 className="font-headline text-4xl font-black text-primary tracking-tighter italic mb-3">Sign In</h2>
                <p className="text-on-surface-variant text-sm font-medium opacity-60">Enter your credentials to access your private enclave.</p>
              </div>
              
              <form method="POST" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black font-label uppercase tracking-[0.2em] text-primary/40 ml-1" htmlFor="email">Email Address</label>
                  <input 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-outline-variant/15 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-on-surface placeholder:text-primary/10 font-medium shadow-inner" 
                    id="email" 
                    name="email" 
                    placeholder="name@domain.com" 
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="block text-[10px] font-black font-label uppercase tracking-[0.2em] text-primary/40" htmlFor="password">Password</label>
                    <Link className="text-[10px] font-black text-accent-red uppercase tracking-widest hover:text-accent-orange transition-colors" href="/forgot-password">Reset Access</Link>
                  </div>
                  <input 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-6 py-4 bg-white border border-outline-variant/15 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none text-on-surface placeholder:text-primary/10 font-medium shadow-inner" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type="password"
                  />
                </div>
                
                <div className="flex items-center gap-3 py-2 ml-1">
                  <input className="h-5 w-5 rounded-lg border-outline-variant/30 text-primary focus:ring-primary/10 transition-all cursor-pointer" id="remember-me" name="remember-me" type="checkbox" />
                  <label className="text-xs text-on-surface-variant font-bold cursor-pointer" htmlFor="remember-me">Keep me signed in</label>
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-primary hover:opacity-95 text-white font-headline font-black rounded-2xl shadow-2xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-[10px] disabled:opacity-50 mt-4" 
                  type="submit"
                >
                  {loading ? "Verifying..." : "Enter KindredCare"}
                  <MaterialIcon name="login" className="text-xl" fill />
                </button>
              </form>

              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[9px]">
                  <span className="px-4 bg-white/50 backdrop-blur-sm text-primary/30 font-black uppercase tracking-[0.2em]">Or use secondary methods</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex items-center justify-center py-4 bg-white border border-outline-variant/10 rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-sm group"
                >
                  <img alt="Google" className="w-5 h-5 grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzl_awn8TETYvPD_AIds-P1a8Vf-rM2Cvm9pAY0bT7ssIi6W_80DjKUSVTBgz3-NT-iEJgKuKZzPzoKneVa81CrBjbm_1wJVILIkz3mCvVANhEOyXOzRWtFUhq7MdGKcnNzyGMLel-ubBE5uSIsbDKesSC0OqVbO-B9q3XPNUYPVo1gksGcSVCmSiyuPA9poiE5ss2iNAOc65Ml91fYoastaHfsKrsHK6cGlcsSS8yih6pBLBhqb16JbsjvHBUSNeMCiWoaOhGvNo" />
                </button>
                <button 
                  type="button"
                  onClick={handleAnonymousSignIn}
                  className="flex items-center justify-center py-4 bg-white border border-outline-variant/10 rounded-2xl hover:bg-slate-50 transition-all duration-300 shadow-sm gap-2 group"
                >
                  <MaterialIcon name="person" className="text-xl text-slate-300 group-hover:text-primary transition-colors" />
                  <span className="text-[9px] font-black text-slate-400 group-hover:text-primary uppercase tracking-widest transition-colors">Guest</span>
                </button>
              </div>

              <div className="mt-12 text-center">
                <p className="text-xs text-on-surface-variant font-medium">
                  Not a member yet? 
                  <Link className="font-black text-secondary hover:text-primary transition-colors underline decoration-secondary/20 decoration-2 underline-offset-4 ml-2 italic tracking-tight" href="/signup">Join the Circle</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
