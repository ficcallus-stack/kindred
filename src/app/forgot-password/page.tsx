"use client";

import { useState } from "react";
import Link from "next/link";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";

export default function ForgotPasswordPage() {
  const { isLoaded, signIn } = useSignIn() as any;
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSuccessfulCreation(true);
      showToast("Check your email for the reset code!", "success");
    } catch (err: any) {
      showToast(err.errors?.[0]?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        showToast("Password reset successful! Redirecting to login...", "success");
        router.push("/login");
      } else {
        console.log(result);
      }
    } catch (err: any) {
      showToast(err.errors?.[0]?.message || "Failed to reset password. Please check the code.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-accent-orange/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-outline-variant/10">
          <div className="mb-10 text-center">
             <Link href="/" className="inline-block text-xl font-bold tracking-tighter text-blue-900 font-headline mb-6">
              KindredCare <span className="text-accent-red">US</span>
            </Link>
            <h2 className="font-headline text-2xl font-bold text-primary mb-2 italic">Reset Password</h2>
            <p className="text-on-surface-variant text-sm font-medium">We'll help you get back into your account</p>
          </div>

          {!successfulCreation ? (
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-primary/40 px-1">Email Address</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-outline-variant rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                />
              </div>
              <button
                disabled={loading || !isLoaded}
                type="submit"
                className="w-full bg-primary text-white font-headline font-black py-5 rounded-xl shadow-xl shadow-primary/10 active:scale-95 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-primary/40 px-1">Reset Code</label>
                <input
                  required
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-outline-variant rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium text-center tracking-[0.5em] text-2xl"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-primary/40 px-1">New Password</label>
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-outline-variant rounded-xl py-4 px-5 focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                />
              </div>
              <button
                disabled={loading || !isLoaded}
                type="submit"
                className="w-full bg-primary text-white font-headline font-black py-5 rounded-xl shadow-xl shadow-primary/10 active:scale-95 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Update Password"}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link href="/login" className="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1">
              <MaterialIcon name="arrow_back" className="text-lg" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
