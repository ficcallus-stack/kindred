"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignIn, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";

export default function LoginPage() {
  const { isLoaded, signIn } = useSignIn();
  const { setActive } = useClerk();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await (signIn as any).create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/");
      } else {
        console.log(result);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const signInWith = (strategy: "oauth_google" | "oauth_apple") => {
    return (signIn as any).authenticateWithStrategy({
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
            <Link href="/signup" className="font-headline text-sm font-semibold tracking-tight text-slate-600 hover:text-blue-900 transition-all duration-300">
              Sign Up
            </Link>
          </div>
          <Link href="/login" className="bg-primary text-white font-bold px-5 py-2 rounded-xl text-xs active:scale-95 transition-transform uppercase tracking-widest shadow-lg shadow-primary/10">
            Sign In
          </Link>
        </div>
      </nav>

      <main className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-accent-orange/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl opacity-40"></div>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 lg:gap-20">
          {/* Left Side: Editorial Content */}
          <div className="hidden md:flex flex-1 flex-col gap-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extrabold tracking-tighter text-primary font-headline">Kindred Core</span>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent-orange/10 rounded-full"></div>
              <h1 className="font-headline text-5xl lg:text-6xl font-extrabold text-primary leading-tight relative z-10">
                Peace of mind for your <span className="text-accent-red">growing family.</span>
              </h1>
            </div>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed font-medium">
              Join thousands of families who trust our vetted caregivers to provide professional, loving care in every home.
            </p>
            <div className="relative mt-4">
              <img 
                alt="Happy family smiling together" 
                className="w-full h-80 object-cover asymmetric-radius shadow-xl shadow-primary/5" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBepyv5YWMXnwkEFGbrREbn6QFlqC9uiBA99AAXsBMCYo41Nlm0tqzGAZWCyz-tzFF52adiC8EUzhZBPug5HD_SyidpkmbYAZ9AyB2nehR5o-XTu603T8iFpbL-2LcNKHXwFV1cXGWy9Oga00mIZIYFGnz68fTXRPc-cWx63FDmDVx38FnLzijBWod_7DIuX3XvIslPsANnK1-jgxNaWNeZq4kaNLr2hKMhLIHDjwx0HlrYaHXpuMjA9nULFjCCnCzP9XsMKluSx6I" 
              />
              {/* Editorial Offset Card */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-lg max-w-[240px] border border-outline-variant/50">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center">
                    <MaterialIcon name="verified_user" className="text-accent-red text-lg" />
                  </div>
                  <span className="text-sm font-bold font-headline text-primary uppercase tracking-wide">Fully Vetted</span>
                </div>
                <p className="text-xs text-on-surface-variant leading-normal italic font-medium">"Finding Sarah through Kindred was the best decision for our twins."</p>
              </div>
            </div>
          </div>

          {/* Right Side: Login Card */}
          <div className="w-full max-w-md">
            <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl shadow-primary/10 border border-outline-variant/30">
              <div className="md:hidden flex justify-center mb-8">
                <span className="text-xl font-extrabold tracking-tighter text-primary font-headline">Kindred Core</span>
              </div>
              <div className="mb-10 text-center md:text-left">
                <h2 className="font-headline text-3xl font-bold text-primary mb-2">Welcome Back</h2>
                <p className="text-on-surface-variant text-sm font-medium">Please enter your details to access your account</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                    <MaterialIcon name="error" className="text-lg" />
                    {error}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="block text-xs font-bold font-label uppercase tracking-widest text-primary/60 mb-2 ml-1" htmlFor="email">Email</label>
                  <input 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-lg focus:ring-4 focus:ring-accent-orange/10 focus:border-accent-orange transition-all outline-none text-on-surface placeholder:text-primary/30 font-medium" 
                    id="email" 
                    name="email" 
                    placeholder="hello@kindredcore.com" 
                    type="email"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-2 ml-1">
                    <label className="block text-xs font-bold font-label uppercase tracking-widest text-primary/60" htmlFor="password">Password</label>
                    <Link className="text-xs font-bold text-accent-red hover:text-accent-orange transition-colors" href="/forgot-password">Forgot Password?</Link>
                  </div>
                  <div className="relative">
                    <input 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-outline-variant rounded-lg focus:ring-4 focus:ring-accent-orange/10 focus:border-accent-orange transition-all outline-none text-on-surface placeholder:text-primary/30 font-medium" 
                      id="password" 
                      name="password" 
                      placeholder="••••••••" 
                      type="password"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input className="h-4 w-4 rounded border-outline-variant text-accent-red focus:ring-accent-red/20" id="remember-me" name="remember-me" type="checkbox" />
                  <label className="text-sm text-on-surface-variant font-semibold" htmlFor="remember-me">Remember Me</label>
                </div>
                <button 
                  disabled={loading}
                  className="w-full py-5 bg-primary hover:bg-primary/95 text-white font-headline font-black rounded-xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs" 
                  type="submit"
                >
                  {loading ? "Logging in..." : "Login"}
                  <MaterialIcon name="arrow_forward" className="text-xl" />
                </button>
              </form>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-4 bg-white text-primary/40 font-bold uppercase tracking-[0.2em]">Or continue with</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  type="button"
                  onClick={() => signInWith("oauth_google")}
                  className="flex items-center justify-center py-4 border border-outline-variant/10 rounded-xl hover:bg-slate-50 transition-colors duration-300 shadow-sm"
                >
                  <img alt="Google" className="w-5 h-5 grayscale opacity-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzl_awn8TETYvPD_AIds-P1a8Vf-rM2Cvm9pAY0bT7ssIi6W_80DjKUSVTBgz3-NT-iEJgKuKZzPzoKneVa81CrBjbm_1wJVILIkz3mCvVANhEOyXOzRWtFUhq7MdGKcnNzyGMLel-ubBE5uSIsbDKesSC0OqVbO-B9q3XPNUYPVo1gksGcSVCmSiyuPA9poiE5ss2iNAOc65Ml91fYoastaHfsKrsHK6cGlcsSS8yih6pBLBhqb16JbsjvHBUSNeMCiWoaOhGvNo" />
                </button>
                <button 
                  type="button"
                  onClick={() => signInWith("oauth_apple")}
                  className="flex items-center justify-center py-4 border border-outline-variant/10 rounded-xl hover:bg-slate-50 transition-colors duration-300 shadow-sm"
                >
                  <img alt="Apple" className="w-5 h-5 grayscale opacity-50" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAo2DC1ia8gJjetVls-9cTO0P-Ja9vONSHOjfPIHK5bFGs9Dj_derNuj40IX6PXXV_jpThJ4L-AcYqquXAEj6-1YcfDheJNGYqTv3W4BZ0S8dGwpdtrYy8sqq-Kxvttd0mroh0Zn-3mVHG0kiL3ieTl6F4PYNpWIvAH7bu-s-nH7kH34yMhwql313RoVjd3oh71WiKUx4Hcv9pl8NM4Bu8lTa8W58sZ4zP65YFWd2isfu27HuIjn5Mtv4VPIRJv7Wg9fvx1olrS7v4" />
                </button>
              </div>
              <div className="mt-10 text-center">
                <p className="text-sm text-on-surface-variant font-medium">
                  Don't have an account? 
                  <Link className="font-bold text-accent-red hover:text-accent-orange transition-colors underline decoration-accent-red/20 decoration-2 underline-offset-4 ml-1" href="/signup">Join our community</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
