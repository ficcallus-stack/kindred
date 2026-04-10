"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { StripeProvider } from "@/components/StripeProvider";
import { checkPaymentStatus, enrollCertification, getMyCertifications } from "./actions";
import { loadStripe } from "@stripe/stripe-js";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";


const PLANS = [
  {
    id: "standards_program",
    icon: "verified_user",
    title: "Professional Caregiver Program",
    price: "$45",
    priceRaw: 45,
    originalPrice: "$120",
    description: "Our all-in-one professional onboarding. Includes Identity Verification, Background Check, and the Global Care Standards Exam to unlock Elite Status.",
    featured: true,
    buttonText: "Enroll & Start Verification",
    features: [
      "ID Verification & Safety Check",
      "Global Care Standards Exam",
      "Elite 'Core Care' Badge",
      "3x Marketplace Visibility"
    ],
  },
];

function TrustMockup() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-20">
        {/* Standard Profile */}
        <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col items-center opacity-60 grayscale-[0.5] scale-95 origin-right">
            <div className="w-20 h-20 bg-slate-200 rounded-full mb-4 shadow-inner"></div>
            <div className="h-6 w-32 bg-slate-200 rounded-full mb-6"></div>
            <div className="space-y-2 w-full">
                <div className="h-2 w-full bg-slate-200 rounded-full"></div>
                <div className="h-2 w-5/6 bg-slate-200 rounded-full"></div>
            </div>
            <div className="mt-8 flex gap-2">
                <div className="h-4 w-12 bg-slate-200 rounded-md"></div>
                <div className="h-4 w-16 bg-slate-200 rounded-md"></div>
            </div>
            <span className="mt-4 text-[10px] font-black tracking-widest text-slate-400 uppercase">Standard Profile</span>
        </div>

        {/* Elite Profile */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-primary/10 shadow-2xl shadow-primary/10 flex flex-col items-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="w-24 h-24 bg-primary/5 rounded-full mb-4 flex items-center justify-center p-1 border-2 border-primary/20 relative">
                <img src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=200&h=200&auto=format&fit=crop" className="w-full h-full object-cover rounded-full" alt="Expert" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                    <MaterialIcon name="verified" className="text-sm" fill />
                </div>
            </div>
            <h4 className="font-headline font-black text-primary text-xl mb-1">Professional Nanny</h4>
            <div className="flex items-center gap-1 mb-6">
                {[1,2,3,4,5].map(s => <MaterialIcon key={s} name="star" className="text-xs text-amber-400" fill />)}
            </div>
            <div className="space-y-2 w-full">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-primary/20"></div>
                </div>
                <div className="h-2 w-5/6 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-primary/20"></div>
                </div>
            </div>
            <div className="mt-8 flex gap-2">
                <div className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-black rounded-full uppercase tracking-tighter">Verified Identity</div>
                <div className="px-3 py-1 bg-blue-50 text-blue-700 text-[8px] font-black rounded-full uppercase tracking-tighter">Standards Graduate</div>
            </div>
            <div className="mt-10 w-full py-3 bg-primary text-white text-center rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 group-hover:scale-[1.02] transition-transform">Hire Specialist</div>
            <span className="absolute top-4 left-4 text-[8px] font-black tracking-[0.3em] text-primary uppercase bg-primary/5 px-3 py-1 rounded-full">Elite Status Active</span>
        </div>
    </div>
  )
}

function CertPaymentForm({ clientSecret, onSuccess }: { clientSecret: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "Error");
      setProcessing(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/nanny/certifications?success=true`,
      },
      redirect: "if_required",
    });

    if (confirmError) {
      setError(confirmError.message || "Payment failed");
      setProcessing(false);
      return;
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && (
        <p className="text-red-600 text-sm font-medium flex items-center gap-2">
          <MaterialIcon name="error" className="text-lg" fill /> {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {processing ? "Processing..." : "Complete Investment"}
      </button>
    </form>
  );
}

function ActivationPipeline() {
    return (
        <div className="flex flex-col items-center justify-center p-20 text-center space-y-8">
            <div className="relative">
                <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
                    <MaterialIcon name="verified" className="text-6xl text-primary" fill />
                </div>
                <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            </div>
            
            <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <h3 className="text-3xl font-headline font-black text-primary">Activation in Progress</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                    We're securing your Elite status and unlocking academy access. This usually takes just a few seconds...
                </p>
            </div>

            <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                        className="w-2 h-2 rounded-full bg-primary"
                    />
                ))}
            </div>
        </div>
    );
}

export default function CertificationsPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{ clientSecret: string } | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const redirectStatus = searchParams.get("redirect_status");
  const success = successParam === "true" && (!redirectStatus || redirectStatus === "succeeded");

  const [enrolledTypes, setEnrolledTypes] = useState<string[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [lastSubmissionMap, setLastSubmissionMap] = useState<Record<string, string>>({});

  const refreshData = async () => {
    const certs = await getMyCertifications();
    const activeCerts = certs.filter(c => c.status !== "pending_payment");
    setEnrolledTypes(activeCerts.map((c: any) => c.type));
    
    const sm: Record<string, string> = {};
    const lsm: Record<string, string> = {};
    certs.forEach((c: any) => {
        sm[c.type!] = c.status;
        if (c.lastSubmissionId) lsm[c.type!] = c.lastSubmissionId;
    });
    setStatusMap(sm);
    setLastSubmissionMap(lsm);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Polling logic for Success Redirect
  useEffect(() => {
    if (success) {
        setIsActivating(true);
        let attempts = 0;
        const maxAttempts = 5;

        const poll = async () => {
            const { recovered } = await checkPaymentStatus();
            if (recovered > 0 || attempts >= maxAttempts) {
                await refreshData();
                setIsActivating(false);
                // Clear the URL params to prevent re-polling on manual refresh
                router.replace("/dashboard/nanny/certifications");
            } else {
                attempts++;
                setTimeout(poll, 2500);
            }
        };

        poll();
    }
  }, [success]);

  const handleEnroll = (type: string) => {
    if (type === 'standards_program') {
        router.push("/dashboard/nanny/certifications/global-care");
        return;
    }
    setSelectedPlan(type);
    startTransition(async () => {
      try {
        const result = await enrollCertification({ type: type as any });
        setPaymentData({ clientSecret: result.clientSecret! });
      } catch (err: any) {
        alert(err.message || "Enrollment failed");
        setSelectedPlan(null);
      }
    });
  };

  const handlePaymentSuccess = () => {
    setEnrolledTypes((prev) => [...prev, selectedPlan!]);
    setSelectedPlan(null);
    setPaymentData(null);
    router.refresh();
  };

  return (
    <div className="pb-32">
      {/* Dynamic Success Messenger */}
      {success && !isActivating && (
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-emerald-500 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-500/20 relative overflow-hidden"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md">
                <MaterialIcon name="military_tech" className="text-5xl" fill />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-headline font-black text-3xl mb-1">Status Eleveted!</h3>
                <p className="font-medium opacity-90">Your professional portfolio is being upgraded to Elite Status.</p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
               <button 
                  onClick={() => router.push('/dashboard/nanny/certifications/global-care')}
                  className="flex-1 md:flex-none px-10 py-5 bg-white text-emerald-600 font-black rounded-2xl shadow-xl shadow-black/5 hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-widest"
                >
                  Enter Academy
               </button>
            </div>
          </div>
          <MaterialIcon name="verified" className="absolute -top-10 -right-10 text-[15rem] text-white/10 -rotate-12" />
        </motion.div>
      )}

      {/* Action Hub for Enrolled but not Completed */}
      {enrolledTypes.includes("standards_program") && statusMap["standards_program"] !== "completed" && (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-24 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden group"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">Action Required</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h2 className="text-4xl font-headline font-black italic tracking-tight mb-4 leading-none">Complete Your Professional Validation</h2>
              <p className="text-lg font-medium opacity-80 leading-relaxed italic">
                You've successfully enrolled! The only thing standing between you and **Elite Status** (with 3x visibility) is the Global Care Standards Exam.
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-center gap-6">
              <button 
                onClick={() => router.push('/dashboard/nanny/certifications/global-care')}
                className="px-12 py-6 bg-white text-indigo-600 font-black rounded-[2rem] shadow-2xl shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center gap-3"
              >
                Enter Academy <MaterialIcon name="arrow_forward" />
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic">Estimated Time: 15 Mins</p>
            </div>
          </div>
          
          {/* Background Decor */}
          <MaterialIcon name="school" className="absolute -bottom-10 -right-10 text-[18rem] text-white/5 -rotate-12 transition-transform group-hover:scale-110 duration-1000" />
        </motion.div>
      )}
      <section className="relative mt-10 mb-24 overflow-hidden rounded-[3rem] bg-primary dark:bg-slate-900 p-12 md:p-24 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent"></div>
        <div className="relative z-10 max-w-3xl">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="px-6 py-2 bg-secondary text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-full mb-8 inline-block shadow-lg shadow-secondary/20"
            >
              The Eminence Program
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-headline font-black text-white leading-[0.9] tracking-tighter mb-10"
            >
              Sell Your Expertise for <span className="text-secondary italic">Premium Rates.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/70 font-medium leading-relaxed mb-12 max-w-xl"
            >
              Parents aren't just looking for helpers—they're looking for verified specialists. Elite nannies earn an average of <span className="text-white font-bold underline decoration-secondary decoration-4">$18,000 more</span> annually.
            </motion.p>
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="flex flex-col sm:flex-row gap-4"
            >
               <a href="#enrollment" className="px-12 py-6 bg-white text-primary font-black rounded-2xl shadow-xl hover:scale-105 transition-all text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                  Claim Status Badge <MaterialIcon name="bolt" fill />
               </a>
            </motion.div>
        </div>
        <MaterialIcon name="verified" className="absolute -bottom-20 -right-20 text-[25rem] text-white/5 -rotate-12 pointer-events-none" />
      </section>

      {/* Trust Mockup Stage */}
      <section className="max-w-5xl mx-auto px-4 mb-32">
        <div className="text-center mb-16">
            <h2 className="font-headline text-4xl font-black text-primary mb-4 tracking-tight">The Visual Proof</h2>
            <p className="text-slate-400 font-medium uppercase text-[10px] tracking-widest">How families perceive you</p>
        </div>
        <TrustMockup />
        <div className="text-center max-w-2xl mx-auto">
            <p className="text-lg text-on-surface-variant leading-relaxed italic">
                "Verified badges and Standards Graduation aren't just symbols—they are trust-accelerators. Families filter by 'Academy Experts' before even browsing the main directory."
            </p>
        </div>
      </section>

      {/* Enrollment Options */}
      <section id="enrollment" className="mb-40">
        {isActivating ? (
            <ActivationPipeline />
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {PLANS.map((plan, idx) => {
                const isEnrolled = enrolledTypes.includes(plan.id);
                const isCompleted = statusMap[plan.id] === 'completed';
                const isDisabled = isPending || isEnrolled || isCompleted;

                return (
                <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    className={cn(
                    "relative p-12 rounded-[3.5rem] flex flex-col justify-between transition-all duration-700 overflow-hidden group",
                    plan.featured 
                        ? "bg-primary text-white shadow-2xl shadow-primary/20 scale-105" 
                        : "bg-surface-container-lowest border border-slate-100 hover:border-primary/20 hover:shadow-2xl"
                    )}
                >
                    {plan.featured && <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent"></div>}
                    
                    <div>
                    <div className={cn(
                        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 transition-transform group-hover:scale-110",
                        plan.featured ? "bg-white/10" : "bg-primary/5"
                    )}>
                        <MaterialIcon name={plan.icon} className={plan.featured ? "text-white text-3xl" : "text-primary text-3xl"} fill />
                    </div>
                    
                    <h3 className="font-headline text-3xl font-black mb-2 tracking-tight">{plan.title}</h3>
                    <div className="flex items-baseline gap-3 mb-8">
                        <span className="text-5xl font-black font-headline">{plan.price}</span>
                        {plan.originalPrice && <span className="opacity-40 line-through text-lg font-bold">{plan.originalPrice}</span>}
                    </div>
                    
                    <p className={cn("text-lg font-medium leading-relaxed mb-10", plan.featured ? "text-white/70" : "text-on-surface-variant")}>
                        {plan.description}
                    </p>
                    
                    {plan.features && (
                        <ul className="space-y-4 mb-12">
                        {plan.features.map((f: string) => (
                            <li key={f} className="flex items-center gap-4 text-sm font-black italic tracking-wide uppercase">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0", plan.featured ? "bg-emerald-400" : "bg-emerald-50")}>
                                <MaterialIcon name="check" className={cn("text-[14px]", plan.featured ? "text-primary" : "text-emerald-600")} />
                            </div>
                            {f}
                            </li>
                        ))}
                        </ul>
                    )}
                    </div>

                    <button
                    onClick={() => handleEnroll(plan.id)}
                    disabled={isDisabled}
                    className={cn(
                        "w-full py-6 font-black rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-xs uppercase tracking-[0.3em] shadow-xl",
                        plan.featured 
                            ? "bg-white text-primary hover:bg-slate-50" 
                            : "bg-primary text-white hover:brightness-110"
                    )}
                    >
                    {isCompleted ? "View Achievement" : isEnrolled ? "Already Academic" : plan.buttonText}
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                    </button>
                </motion.div>
                );
            })}
            </div>
        )}
      </section>

      {/* Benefits Bento */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
           <motion.div 
             whileHover={{ y: -5 }}
             className="md:col-span-8 bg-surface-container-low p-12 rounded-[3.5rem] flex flex-col md:flex-row gap-12 items-center"
           >
              <div className="w-40 h-40 bg-white rounded-[2.5rem] shadow-xl flex items-center justify-center shrink-0 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                  <MaterialIcon name="insights" className="text-7xl text-primary" fill />
              </div>
              <div>
                  <h3 className="font-headline text-3xl font-black text-primary mb-4">Priority Placement</h3>
                  <p className="text-lg text-on-surface-variant font-medium leading-relaxed">
                      Graduates of the Standards Program are surfaced first in the <strong>Connect Feed</strong>. Parents who filter by "Verified Expert" see you before anyone else, giving you the first pick of premium roles.
                  </p>
              </div>
           </motion.div>
           
           <motion.div 
             whileHover={{ y: -5 }}
             className="md:col-span-4 bg-primary p-12 rounded-[3.5rem] text-white flex flex-col items-center text-center justify-center shadow-2xl shadow-primary/20"
           >
              <MaterialIcon name="paid" className="text-6xl mb-6 text-secondary" fill />
              <h3 className="font-headline text-2xl font-black mb-4 uppercase tracking-widest">Rate Authority</h3>
              <p className="font-medium opacity-80 leading-relaxed">
                  Certified nannies can command up to 30% higher hourly rates with zero resistance from parents.
              </p>
           </motion.div>
        </div>
      </section>

      {/* Payment Modal */}
      {selectedPlan && paymentData && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-2xl z-50 flex items-center justify-center p-6 animate-in fade-in duration-500">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-10">
              <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Securing Status</span>
                  <h3 className="font-headline text-2xl font-black text-primary">
                    {PLANS.find((p) => p.id === selectedPlan)?.title}
                  </h3>
              </div>
              <button onClick={() => { setSelectedPlan(null); setPaymentData(null); }} className="p-3 hover:bg-slate-50 rounded-full transition-colors">
                <MaterialIcon name="close" />
              </button>
            </div>
            
            <StripeProvider clientSecret={paymentData.clientSecret}>
              <CertPaymentForm
                clientSecret={paymentData.clientSecret}
                onSuccess={handlePaymentSuccess}
              />
            </StripeProvider>
            
            <div className="mt-8 flex items-center justify-center gap-3 opacity-40">
                <MaterialIcon name="lock" className="text-xs" fill />
                <span className="text-[10px] font-black uppercase tracking-widest">Symmetrical AES-256 Encryption</span>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
