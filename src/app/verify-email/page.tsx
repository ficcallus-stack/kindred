"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const initialSendRef = useRef(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();
  const { user, dbUser } = useAuth();

  // Send OTP on mount
  useEffect(() => {
    if (user && !initialSendRef.current) {
      // Robust deduplication using sessionStorage to prevent double-fire on hydration/re-mount
      const sessionKey = `kindred_otp_sent_${user.uid}`;
      const lastSent = sessionStorage.getItem(sessionKey);
      const isRecentlySent = lastSent && (Date.now() - parseInt(lastSent) < 30000); // 30s throttle

      if (!isRecentlySent) {
        initialSendRef.current = true;
        sessionStorage.setItem(sessionKey, Date.now().toString());
        sendOTP();
      } else {
        initialSendRef.current = true; // Mark as sent if it was recently sent in another mount
        setResendCooldown(60); 
      }
    }
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // Redirect if already verified
  useEffect(() => {
    if (dbUser?.emailVerified) {
      router.replace("/");
    }
  }, [dbUser, router]);

  const sendOTP = async () => {
    try {
      const res = await fetch("/api/auth/send-otp", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send code");
        return;
      }
      setResendCooldown(60);
      setError("");
    } catch {
      setError("Failed to send verification code");
    }
  };

  const handleChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);

    // Auto-advance
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }

    // Auto-submit when all filled
    if (next.every((d) => d !== "")) {
      verifyOTP(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(""));
      inputRefs.current[5]?.focus();
      verifyOTP(text);
    }
  };

  const verifyOTP = useCallback(async (code: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (data.success) {
        router.replace("/");
      } else {
        setError(data.error || "Invalid code");
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <main className="flex-grow flex items-center justify-center px-6 py-20 relative overflow-hidden min-h-screen bg-surface">
      {/* Atmospheric Background */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-fixed opacity-20 blur-[120px]" />
      <div className="absolute bottom-[-5%] left-[-5%] w-[30%] h-[30%] rounded-full bg-secondary-fixed opacity-30 blur-[100px]" />

      <div className="w-full max-w-xl relative z-10">
        {/* Brand */}
        <div className="mb-12 text-center">
          <h1 className="font-headline font-extrabold text-2xl tracking-tight text-primary">
            KindredCare <span className="text-secondary italic">US</span>
          </h1>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_32px_64px_rgba(3,31,65,0.06)] p-8 md:p-12">
          <div className="flex flex-col items-center text-center max-w-sm mx-auto">
            {/* Icon */}
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-3xl">mark_email_read</span>
            </div>

            <h2 className="font-headline text-3xl font-bold text-primary mb-3">Confirm your email</h2>
            <p className="text-on-surface-variant text-base mb-10">
              We've sent a 6-digit code to{" "}
              <span className="font-semibold text-primary">{user?.email || "your email"}</span>
            </p>

            {/* OTP Inputs */}
            <div className="flex gap-2 md:gap-4 mb-4" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-lg border border-outline-variant/30 bg-surface-container-lowest focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all outline-none disabled:opacity-50"
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-error text-sm font-medium mb-4">{error}</p>
            )}

            {/* Verify Button */}
            <button
              onClick={() => verifyOTP(otp.join(""))}
              disabled={loading || otp.some((d) => d === "")}
              className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 px-8 rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-md active:scale-95 mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Verifying...
                </span>
              ) : "Verify Email"}
            </button>

            {/* Secondary Options */}
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm">
                <span>Didn't receive the code?</span>
                <button
                  onClick={sendOTP}
                  disabled={resendCooldown > 0}
                  className="text-secondary font-bold hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 flex items-center justify-center gap-8 opacity-60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">shield_person</span>
            <span className="text-xs font-label uppercase tracking-widest">Verified Profiles</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">lock</span>
            <span className="text-xs font-label uppercase tracking-widest">256-bit Encryption</span>
          </div>
        </div>
      </div>
    </main>
  );
}
