"use client";

import { useState } from "react";
import Link from "next/link";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
      showToast("Password reset link sent to your email!", "success");
    } catch (err: any) {
      const msg = err.code === "auth/user-not-found"
        ? "No account found with this email."
        : "Something went wrong. Please try again.";
      showToast(msg, "error");
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

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                disabled={loading}
                type="submit"
                className="w-full bg-primary text-white font-headline font-black py-5 rounded-xl shadow-xl shadow-primary/10 active:scale-95 transition-all uppercase tracking-widest text-[10px] disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto">
                <MaterialIcon name="mark_email_read" className="text-4xl text-green-600" />
              </div>
              <div>
                <h3 className="font-headline text-xl font-bold text-primary mb-2">Check your inbox</h3>
                <p className="text-sm text-on-surface-variant">
                  We sent a password reset link to <span className="font-bold text-primary">{email}</span>. 
                  Click the link to set a new password.
                </p>
              </div>
              <button
                onClick={() => setSent(false)}
                className="text-xs font-bold text-accent-red hover:text-accent-orange transition-colors uppercase tracking-widest"
              >
                Didn't get it? Send again
              </button>
            </div>
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
