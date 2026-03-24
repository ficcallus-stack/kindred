"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignUp, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const { isLoaded, signUp } = useSignUp() as any;
  const { setActive } = useClerk();
  const [role, setRole] = useState<"parent" | "caregiver" | null>(null);
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isLoaded) return null;

  // Handle the signup submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    if (!role) {
      setError("Please select a role first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await (signUp as any).create({
        emailAddress,
        password,
        unsafeMetadata: { role },
      });

      // Send the verification email
      await (signUp as any).prepareEmailAddressVerification({ strategy: "email_code" });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Handle the verification code submission
  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    setLoading(true);
    setError("");

    try {
      const completeSignUp = await (signUp as any).attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };

  const signUpWith = (strategy: "oauth_google" | "oauth_apple") => {
    return (signUp as any).authenticateWithStrategy({
      strategy,
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
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

      <main className="min-h-screen pt-32 pb-16 flex items-center justify-center px-4">
        {!pendingVerification ? (
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
            <div className="space-y-8 bg-surface-container-low p-8 lg:p-12 rounded-[2rem] border border-outline-variant/10 shadow-sm">
              {/* Role Selection */}
              <div className="space-y-6">
                <h3 className="font-headline text-xl font-bold text-primary">I am a...</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setRole("parent")}
                    className={cn(
                      "group relative flex flex-col p-6 bg-white rounded-xl text-left transition-all duration-300 shadow-sm border-2",
                      role === "parent" ? "border-primary ring-4 ring-primary/5" : "border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "mb-4 w-12 h-12 flex items-center justify-center rounded-xl transition-colors",
                      role === "parent" ? "bg-primary text-white" : "bg-secondary-fixed text-on-secondary-fixed"
                    )}>
                      <MaterialIcon name="family_history" className="text-2xl" />
                    </div>
                    <span className="font-headline font-bold text-lg text-primary">Parent</span>
                    <span className="text-sm text-on-surface-variant">Finding safe, professional care.</span>
                  </button>

                  <button 
                    onClick={() => setRole("caregiver")}
                    className={cn(
                      "group relative flex flex-col p-6 bg-white rounded-xl text-left transition-all duration-300 shadow-sm border-2",
                      role === "caregiver" ? "border-primary ring-4 ring-primary/5" : "border-transparent hover:border-slate-200"
                    )}
                  >
                    <div className={cn(
                      "mb-4 w-12 h-12 flex items-center justify-center rounded-xl transition-colors",
                      role === "caregiver" ? "bg-primary text-white" : "bg-tertiary-fixed text-on-tertiary-fixed"
                    )}>
                      <MaterialIcon name="medical_services" className="text-2xl" />
                    </div>
                    <span className="font-headline font-bold text-lg text-primary">Caregiver</span>
                    <span className="text-sm text-on-surface-variant">Providing trusted support.</span>
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                    <MaterialIcon name="error" className="text-lg" />
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="font-label text-xs font-bold text-primary/60 px-1">Full Name</label>
                  <input 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-outline-variant/15 rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium placeholder:text-slate-300" 
                    placeholder="Jane Doe" 
                    type="text"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="font-label text-xs font-bold text-primary/60 px-1">Email</label>
                    <input 
                      required
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      className="w-full bg-white border border-outline-variant/15 rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium placeholder:text-slate-300" 
                      placeholder="jane@example.com" 
                      type="email"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-label text-xs font-bold text-primary/60 px-1">Password</label>
                    <input 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-outline-variant/15 rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all font-medium placeholder:text-slate-300" 
                      placeholder="••••••••" 
                      type="password"
                    />
                  </div>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-primary text-white font-headline font-bold py-5 rounded-xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-xs mt-4"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>

              <div className="space-y-6 pt-4 border-t border-slate-100">
                <div className="relative flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-100"></div>
                  <span className="text-[10px] font-bold text-on-surface-variant tracking-[0.2em] uppercase">Or Continue With</span>
                  <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => signUpWith("oauth_google")}
                    className="flex items-center justify-center gap-3 bg-white border border-outline-variant/10 py-4 rounded-xl hover:bg-slate-50 transition-colors duration-300 font-bold text-xs text-slate-600"
                  >
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzl_awn8TETYvPD_AIds-P1a8Vf-rM2Cvm9pAY0bT7ssIi6W_80DjKUSVTBgz3-NT-iEJgKuKZzPzoKneVa81CrBjbm_1wJVILIkz3mCvVANhEOyXOzRWtFUhq7MdGKcnNzyGMLel-ubBE5uSIsbDKesSC0OqVbO-B9q3XPNUYPVo1gksGcSVCmSiyuPA9poiE5ss2iNAOc65Ml91fYoastaHfsKrsHK6cGlcsSS8yih6pBLBhqb16JbsjvHBUSNeMCiWoaOhGvNo" className="w-5 h-5 grayscale opacity-50" alt="Google" />
                    Google
                  </button>
                  <button 
                    type="button"
                    onClick={() => signUpWith("oauth_apple")}
                    className="flex items-center justify-center gap-3 bg-white border border-outline-variant/10 py-4 rounded-xl hover:bg-slate-50 transition-colors duration-300 font-bold text-xs text-slate-600"
                  >
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo2DC1ia8gJjetVls-9cTO0P-Ja9vONSHOjfPIHK5bFGs9Dj_derNuj40IX6PXXV_jpThJ4L-AcYqquXAEj6-1YcfDheJNGYqTv3W4BZ0S8dGwpdtrYy8sqq-Kxvttd0mroh0Zn-3mVHG0kiL3ieTl6F4PYNpWIvAH7bu-s-nH7kH34yMhwql313RoVjd3oh71WiKUx4Hcv9pl8NM4Bu8lTa8W58sZ4zP65YFWd2isfu27HuIjn5Mtv4VPIRJv7Wg9fvx1olrS7v4" className="w-5 h-5 grayscale opacity-50" alt="Apple" />
                    Apple
                  </button>
                </div>
                <p className="text-center text-sm font-medium text-on-surface-variant">
                  Already have an account? 
                  <Link href="/login" className="text-primary font-bold hover:underline decoration-accent-red/20 decoration-2 underline-offset-4 ml-1">Sign in</Link>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-md w-full space-y-8 bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-50 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mx-auto text-primary">
                <MaterialIcon name="mark_email_read" className="text-4xl" />
              </div>
              <h2 className="font-headline text-3xl font-black text-slate-900 italic tracking-tighter">Verify your email</h2>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">
                We've sent a 6-digit code to <span className="text-slate-900 font-black">{emailAddress}</span>. Enter it below to activate your account.
              </p>
            </div>

            <form onSubmit={onPressVerify} className="space-y-6">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                className="w-full text-center text-5xl font-black tracking-[0.4em] bg-slate-50 border-none rounded-2xl py-8 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                required
              />
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <MaterialIcon name="error" className="text-lg" />
                  {error}
                </div>
              )}
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-primary text-white font-headline font-bold py-5 rounded-xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-xs"
              >
                {loading ? "Verifying..." : "Verify & Join"}
              </button>
            </form>
            
            <button 
              onClick={() => setPendingVerification(false)}
              className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors font-headline"
            >
              Back to registration
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
