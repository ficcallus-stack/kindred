"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { motion, AnimatePresence } from "framer-motion";
import { StripeProvider } from "@/components/StripeProvider";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { enrollCertification, getMyCertifications } from "../actions";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

/**
 * Caregiver Certification Hub - Premium Design Implementation
 * Incorporates User's high-fidelity HTML/Tailwind snippet with state-driven logic.
 * 🛡️✨💎🛡️🏆🛡️
 */

function ExamPaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    const { error: submitError } = await elements.submit();
    if (submitError) {
      showToast(submitError.message || "Invalid payment details", "error");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/nanny/certifications/global-care?success=true`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      showToast(confirmError.message || "Payment failed", "error");
      setProcessing(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement options={{ layout: "tabs" }} />
      <button
        type="submit"
        disabled={!stripe || processing}
        className="group relative w-full py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl font-headline font-bold text-xl shadow-xl hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-[1px] transition-all duration-300 disabled:opacity-50"
      >
        {processing ? "Starting Enrollment..." : "Enroll & Start Exam"}
        <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
      </button>
    </form>
  );
}

export default function GlobalCareOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  
  // State Machine
  const [status, setStatus] = useState<'idle' | 'enrolled' | 'marking' | 'passed' | 'failed'>('idle');
  const [paymentData, setPaymentData] = useState<{ clientSecret: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
        setShowConfirmation(true);
    }
    refreshState();
  }, [searchParams]);

  const refreshState = async () => {
    try {
        const certs = await getMyCertifications();
        const globalCert = certs.find(c => c.type === 'standards_program') as any;
        
        if (globalCert) {
            if (globalCert.status === 'completed') {
                setStatus('passed');
            } else if (globalCert.lastSubmissionStatus === 'marking') {
                setStatus('marking');
            } else if (globalCert.lastSubmissionStatus === 'failed') {
                setStatus('failed');
            } else if (globalCert.status === 'enrolled' || globalCert.status === 'in_progress') {
                setStatus('enrolled');
            }
        }
    } catch (e) {
        console.error("Failed to fetch state:", e);
    } finally {
        setLoading(false);
    }
  };

  const handleEnroll = () => {
    startTransition(async () => {
      try {
        const type = status === 'failed' ? "standards_retake" : "standards_program";
        const result = await enrollCertification({ type });
        setPaymentData({ clientSecret: result.clientSecret! });
      } catch (err: any) {
        showToast(err.message || "Enrollment failed", "error");
      }
    });
  };

  if (loading) {
     return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <MaterialIcon name="sync" className="text-4xl text-primary animate-spin" />
        </div>
     );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-0">
      <AnimatePresence mode="wait">
        
        {/* State A: Idle (Marketing) or State B: Enrolled (Hub) */}
        {(status === 'idle' || status === 'enrolled') && (
            <motion.div 
                key="enrollment-hub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-12"
            >
                {/* 1. Payment Success Badge (State B Only) */}
                {(status === 'enrolled' || showConfirmation) && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-10 inline-flex items-center gap-2 px-4 py-2 bg-tertiary-fixed text-on-tertiary-fixed rounded-full shadow-sm"
                    >
                        <MaterialIcon name="check_circle" className="text-lg" fill />
                        <span className="text-sm font-semibold">Payment Successful — $45.00</span>
                    </motion.div>
                )}

                {/* 2. Header Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16 items-center">
                    <div className="lg:col-span-8">
                        <h1 className="text-5xl md:text-6xl font-headline font-extrabold text-primary tracking-tight leading-tight mb-4">
                            {status === 'enrolled' ? (
                                <>Enrollment Confirmed: <br/><span className="text-on-primary-container">Ready to Begin?</span></>
                            ) : (
                                <>Global Caregiver Standards <br/><span className="text-on-primary-container">Secure Your Elite Badge</span></>
                            )}
                        </h1>
                        <p className="text-xl text-on-surface-variant font-medium">Global Caregiver Standards Exam (GCS-2024)</p>
                    </div>
                    <div className="hidden lg:block lg:col-span-4">
                        <img 
                            alt="Caregiver Hands" 
                            className="rounded-3xl shadow-xl border-8 border-white/50 w-full aspect-square object-cover" 
                            src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?q=80&w=1000" 
                        />
                    </div>
                </div>

                {/* 3. Exam Stats Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-4 text-primary">
                            <MaterialIcon name="quiz" className="text-2xl" />
                        </div>
                        <h4 className="text-2xl font-headline font-bold text-primary">50 Questions</h4>
                        <p className="text-on-surface-variant text-sm mt-1">Multiple choice & case studies</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-secondary/5 rounded-xl flex items-center justify-center mb-4 text-secondary">
                            <MaterialIcon name="timer" className="text-2xl" />
                        </div>
                        <h4 className="text-2xl font-headline font-bold text-secondary">60 Minutes</h4>
                        <p className="text-on-surface-variant text-sm mt-1">Timed secure environment</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-tertiary-fixed-dim/10 rounded-xl flex items-center justify-center mb-4 text-on-tertiary-fixed-variant">
                            <MaterialIcon name="grade" className="text-2xl" />
                        </div>
                        <h4 className="text-2xl font-headline font-bold text-on-tertiary-fixed-variant">75% Passing</h4>
                        <p className="text-on-surface-variant text-sm mt-1">Global benchmark score</p>
                    </div>
                </div>

                {/* 4. Instructions and Outcome Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
                    <div className="lg:col-span-7 space-y-8">
                        {/* Pre-Exam Checklist */}
                        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                            <h3 className="text-xl font-headline font-bold text-primary mb-6 flex items-center gap-2">
                                <MaterialIcon name="fact_check" className="text-primary" />
                                Pre-Exam Checklist
                            </h3>
                            <div className="space-y-3">
                                {[
                                    "Quiet environment free from distractions",
                                    "Stable, high-speed internet connection",
                                    "Understanding of automated proctoring rules"
                                ].map((item, idx) => (
                                    <label key={idx} className="flex items-center gap-4 p-4 bg-surface rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors group border border-transparent hover:border-slate-200">
                                        <input className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" type="checkbox"/>
                                        <span className="text-on-surface font-medium group-hover:text-primary transition-colors">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        {/* Pass/Fail Outcomes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <section className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                                <h3 className="text-lg font-headline font-bold text-primary mb-4 flex items-center gap-2">
                                    <MaterialIcon name="celebration" />
                                    If You Pass
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                        <MaterialIcon name="check_circle" className="text-green-600 text-[14px] mt-0.5" fill />
                                        <div>
                                            <p className="font-bold leading-none mb-1">22% Higher Pay</p>
                                            <p className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">Marketplace average</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                        <MaterialIcon name="check_circle" className="text-green-600 text-[14px] mt-0.5" fill />
                                        <span className="leading-tight">Digital Badge & Elite Passport</span>
                                    </li>
                                </ul>
                            </section>
                            <section className="bg-cream p-6 rounded-3xl border border-secondary/10">
                                <h3 className="text-lg font-headline font-bold text-secondary mb-4 flex items-center gap-2">
                                    <MaterialIcon name="refresh" />
                                    If You Fail
                                </h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                        <MaterialIcon name="history" className="text-secondary text-[14px] mt-0.5" />
                                        <div>
                                            <p className="font-bold leading-none mb-1">24-Hour Wait</p>
                                            <p className="text-[10px] text-slate-500 font-normal uppercase tracking-wider">Mandatory study period</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm font-medium text-slate-700">
                                        <MaterialIcon name="library_books" className="text-secondary text-[14px] mt-0.5" />
                                        <span className="leading-tight">Custom study resources shared</span>
                                    </li>
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-8">
                        {/* Proctoring Warning */}
                        <section className="bg-error-container/20 p-8 rounded-3xl border border-error/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-error/5 -mr-12 -mt-12 rounded-full"></div>
                            <div className="flex items-center gap-3 mb-4">
                                <MaterialIcon name="security" className="text-error" />
                                <h3 className="text-xl font-headline font-bold text-error">Proctoring Warning</h3>
                            </div>
                            <p className="text-on-surface-variant leading-relaxed mb-6 text-sm">
                                This exam uses <span className="font-bold text-error">Active Integrity Monitoring</span>. Switching tabs or minimizing this window results in immediate failure.
                            </p>
                            <ul className="space-y-3 text-sm font-medium text-on-surface-variant">
                                <li className="flex items-start gap-2">
                                    <MaterialIcon name="radio_button_checked" className="text-error text-[10px] mt-1.5" fill />
                                    Webcam & Mic access required
                                </li>
                                <li className="flex items-start gap-2">
                                    <MaterialIcon name="radio_button_checked" className="text-error text-[10px] mt-1.5" fill />
                                    AI-powered tab-locking active
                                </li>
                            </ul>
                        </section>

                        {/* Exam FAQs (Dark) */}
                        <section className="bg-primary-container p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                            <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
                                <MaterialIcon name="help_center" className="text-primary-fixed" />
                                Exam FAQs
                            </h3>
                            <div className="space-y-4 relative z-10">
                                <div className="pb-4 border-b border-white/10">
                                    <p className="text-sm font-bold text-primary-fixed mb-1">Time Limit?</p>
                                    <p className="text-xs text-secondary-fixed/60">Exactly 60 minutes. Timer stays visible.</p>
                                </div>
                                <div className="pb-4 border-b border-white/10">
                                    <p className="text-sm font-bold text-primary-fixed mb-1">Passing score?</p>
                                    <p className="text-xs text-secondary-fixed/60">75% (38/50 correct) is the global benchmark.</p>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-primary-fixed mb-1">Retake policy?</p>
                                    <p className="text-xs text-secondary-fixed/60">Unlimited retakes available for $5 each.</p>
                                </div>
                            </div>
                            <MaterialIcon name="school" className="absolute -right-8 -bottom-8 text-9xl opacity-[0.03] text-white -rotate-12 transition-transform group-hover:scale-110 duration-700" />
                        </section>
                    </div>
                </div>

                {/* 5. Final Action Section */}
                <div className="flex flex-col items-center justify-center mb-24 py-12 border-y border-outline-variant/10">
                    {status === 'enrolled' ? (
                        <>
                            <button 
                                onClick={() => router.push("/dashboard/nanny/certifications/global-care/exam")}
                                className="group relative px-16 py-6 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-3xl font-headline font-bold text-2xl shadow-xl hover:shadow-2xl hover:translate-y-[-4px] active:translate-y-[1px] transition-all duration-300"
                            >
                                Start My Exam Session
                                <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">bolt</span>
                            </button>
                            <p className="mt-8 text-on-surface-variant text-sm text-center max-w-sm font-medium opacity-60">
                                By clicking, you agree to begin your 60-minute session. This action cannot be undone once proctoring initializes.
                            </p>
                        </>
                    ) : (
                        <button
                            onClick={handleEnroll}
                            disabled={isPending}
                            className="group relative px-16 py-6 bg-primary text-on-primary rounded-3xl font-headline font-bold text-2xl shadow-xl hover:shadow-2xl hover:translate-y-[-4px] active:translate-y-[1px] transition-all duration-300"
                        >
                            {isPending ? "Preparing Academy..." : "Enroll for $45.00"}
                            <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">payments</span>
                        </button>
                    )}
                </div>

                {/* 6. Social Proof / Alumni */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center bg-cream rounded-[3rem] p-12 md:p-20 overflow-hidden border border-slate-100">
                    <div className="md:col-span-7">
                        <h4 className="text-4xl md:text-5xl font-headline font-extrabold text-primary mb-8 leading-tight">
                            Empowering Care Excellence <br/><span className="text-secondary/80 italic">Worldwide</span>
                        </h4>
                        <p className="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-lg">
                            Your journey to becoming a certified global caregiver starts here. Recognized by over 500 premium agencies, unlocking elite placements and career security.
                        </p>
                        <div className="flex gap-6 items-center">
                            <div className="flex -space-x-3 overflow-hidden">
                                <img className="inline-block h-12 w-12 rounded-full ring-4 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Annie" alt="Alumni" />
                                <img className="inline-block h-12 w-12 rounded-full ring-4 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Beth" alt="Alumni" />
                                <img className="inline-block h-12 w-12 rounded-full ring-4 ring-white" src="https://api.dicebear.com/7.x/avataaars/svg?seed=Cara" alt="Alumni" />
                            </div>
                            <div>
                                <p className="font-black text-primary leading-none text-xl">Join 12,000+ Alumni</p>
                                <p className="text-slate-500 text-sm font-medium">Certified Elite Professionals</p>
                            </div>
                        </div>
                    </div>
                    <div className="md:col-span-5">
                         <img 
                            src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1000" 
                            className="rounded-[3rem] shadow-2xl aspect-[4/5] object-cover border-4 border-white" 
                         />
                    </div>
                </div>
            </motion.div>
        )}

        {/* State C: Marking (Pending) */}
        {status === 'marking' && (
            <motion.div 
                key="marking"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-20 space-y-12"
            >
                <div className="w-32 h-32 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mb-8">
                    <MaterialIcon name="hourglass_empty" className="text-6xl text-amber-500 animate-spin [animation-duration:3s]" />
                </div>
                <div className="max-w-2xl space-y-4">
                    <h2 className="text-5xl font-headline font-black text-slate-900 italic">Evaluating Expertise...</h2>
                    <p className="text-lg text-slate-500 font-medium">
                        Your scenario responses have been submitted into the proctoring pipeline. Our auditors are finalizing your score. Results are typically released within 24 hours.
                    </p>
                </div>
                <div className="flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 bg-slate-100 px-8 py-4 rounded-full text-slate-500 text-xs font-black uppercase tracking-widest">
                        <MaterialIcon name="hourglass_top" className="text-sm animate-pulse" />
                        Status: Review in Progress
                    </div>
                    <button 
                         onClick={() => refreshState()}
                         className="text-primary text-xs font-black uppercase tracking-widest hover:underline"
                    >
                        Poll for Results
                    </button>
                </div>
            </motion.div>
        )}

        {/* State D: Passed (Success) */}
        {status === 'passed' && (
            <motion.div 
                key="passed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-20 space-y-12"
            >
                <div className="w-40 h-40 bg-emerald-500 rounded-[3rem] shadow-2xl shadow-emerald-200 flex items-center justify-center mb-10 overflow-hidden relative group">
                    <MaterialIcon name="workspace_premium" className="text-8xl text-white relative z-10 group-hover:scale-110 transition-transform duration-500" fill />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                </div>
                <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                        Elite Status Verified
                    </div>
                    <h2 className="text-6xl font-headline font-black text-primary italic leading-tight">Professional Eminence Secured</h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        Congratulations! You have joined the top tier of caregivers. Your 'Global Care Professional' badge is now live on your profile, boosting your marketplace priority by 3x.
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/nanny/profile")}
                    className="px-16 py-8 bg-primary text-white font-black rounded-[2.5rem] shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-[0.3em] flex items-center gap-4"
                >
                    View Your Elite Profile <MaterialIcon name="verified_user" fill />
                </button>
            </motion.div>
        )}

        {/* State E: Failed (Retake) */}
        {status === 'failed' && (
            <motion.div 
                key="failed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-20 space-y-12"
            >
                <div className="w-32 h-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mb-8">
                    <MaterialIcon name="refresh" className="text-6xl text-rose-500" />
                </div>
                <div className="max-w-2xl space-y-4">
                    <h2 className="text-5xl font-headline font-black text-rose-900 italic">Close, But Not Quite.</h2>
                    <p className="text-lg text-slate-500 font-medium leading-relaxed">
                        Your last attempt didn't reach the passing threshold (75%). Don't worry—most professionals use this as a learning milestone. Review the developmental standards and try again.
                    </p>
                </div>
                <button
                    onClick={handleEnroll}
                    disabled={isPending}
                    className="px-16 py-8 bg-rose-600 text-white font-black rounded-[2.5rem] shadow-xl hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-4"
                >
                    {isPending ? "Preparing Retake..." : "Pay $5 & Retake Exam"}
                    <MaterialIcon name="payments" />
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Enrollment Modal */}
      {paymentData && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-3xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-700">
          <motion.div 
             initial={{ scale: 0.95, opacity: 0, y: 20 }}
             animate={{ scale: 1, opacity: 1, y: 0 }}
             className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-outline-variant/10"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-headline text-3xl font-black text-primary italic">Academy Enrollment</h3>
              <button 
                 onClick={() => setPaymentData(null)} 
                 className="w-12 h-12 flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
                >
                <MaterialIcon name="close" />
              </button>
            </div>
            
            <StripeProvider clientSecret={paymentData.clientSecret}>
              <ExamPaymentForm
                clientSecret={paymentData.clientSecret}
                onSuccess={() => {
                    setPaymentData(null);
                    showToast("Successfully enrolled!", "success");
                    refreshState();
                    setShowConfirmation(true);
                }}
              />
            </StripeProvider>
            
            <p className="mt-8 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                KindredCare Secure Enrollment Hub
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
}
