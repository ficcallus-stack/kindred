"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StripeProvider } from "@/components/StripeProvider";
import { checkPaymentStatus, enrollCertification, getMyCertifications } from "@/app/dashboard/nanny/certifications/actions";
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
        return_url: `${window.location.origin}/dashboard/nanny/verification?success=true`,
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

export default function CertificationsOverview() {
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{ clientSecret: string } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const success = successParam === "true";

  const [enrolledTypes, setEnrolledTypes] = useState<string[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});

  const refreshData = async () => {
    const certs = await getMyCertifications();
    const activeCerts = certs.filter(c => c.status !== "pending_payment");
    setEnrolledTypes(activeCerts.map((c: any) => c.type));
    
    const sm: Record<string, string> = {};
    certs.forEach((c: any) => {
        sm[c.type!] = c.status;
    });
    setStatusMap(sm);
  };

  useEffect(() => {
    refreshData();
  }, []);

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
    <div className="mt-20 border-t border-outline-variant/10 pt-20">
      <div className="mb-12">
        <h2 className="font-headline text-4xl font-black text-primary italic tracking-tight mb-2">Professional Standards</h2>
        <p className="text-slate-500 font-medium italic opacity-60 text-lg">Elevate your visibility and earning potential through our certification program.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {PLANS.map((plan) => {
          const isEnrolled = enrolledTypes.includes(plan.id);
          const isCompleted = statusMap[plan.id] === 'completed';

          return (
            <div
              key={plan.id}
              className={cn(
                "relative p-10 rounded-[3rem] flex flex-col justify-between transition-all duration-700 overflow-hidden group border",
                plan.featured 
                  ? "bg-primary text-white shadow-2xl shadow-primary/20 border-transparent" 
                  : "bg-white border-slate-100 hover:border-primary/20"
              )}
            >
              <div>
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-8",
                  plan.featured ? "bg-white/10" : "bg-primary/5"
                )}>
                  <MaterialIcon name={plan.icon} className={plan.featured ? "text-white text-2xl" : "text-primary text-2xl"} fill />
                </div>
                
                <h3 className="font-headline text-2xl font-black mb-2 tracking-tight italic">{plan.title}</h3>
                <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-4xl font-black font-headline italic">{plan.price}</span>
                    <span className="opacity-40 line-through text-sm font-bold">{plan.originalPrice}</span>
                </div>
                
                <p className={cn("text-sm font-medium leading-relaxed mb-8 opacity-80", plan.featured ? "text-white" : "text-on-surface-variant")}>
                    {plan.description}
                </p>
                
                <ul className="space-y-3 mb-10">
                  {plan.features.map((f: string) => (
                    <li key={f} className="flex items-center gap-3 text-[10px] font-black italic tracking-wide uppercase">
                      <MaterialIcon name="check_circle" className={cn("text-lg", plan.featured ? "text-emerald-400" : "text-emerald-600")} fill />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleEnroll(plan.id)}
                disabled={isPending || isEnrolled || isCompleted}
                className={cn(
                  "w-full py-5 font-black rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.2em] shadow-lg",
                  plan.featured 
                    ? "bg-white text-primary hover:bg-slate-50" 
                    : "bg-primary text-white"
                )}
              >
                {isCompleted ? "Program Completed" : isEnrolled ? "Active in Academy" : plan.buttonText}
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </button>
            </div>
          );
        })}

        {/* Benefits Card */}
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden flex flex-col justify-center border border-slate-800">
           <div className="relative z-10">
              <h3 className="text-2xl font-headline font-black italic mb-4">Elite Marketplace Status</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6">
                 Professionals who complete the Standards Program see a <span className="text-emerald-400 font-black italic">300% increase</span> in job invitations and higher hourly rates.
              </p>
              <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden shadow-xl">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=verified${i}`} alt="Verified" />
                    </div>
                 ))}
                 <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                    +1.2k
                 </div>
              </div>
           </div>
           <MaterialIcon name="military_tech" className="absolute -right-8 -bottom-8 text-[12rem] text-white/5 -rotate-12" />
        </div>
      </div>

      {selectedPlan && paymentData && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-2xl z-50 flex items-center justify-center p-6">
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="bg-white rounded-[3rem] p-12 max-w-md w-full shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-headline text-2xl font-black text-primary italic">Investment Hook</h3>
              <button onClick={() => { setSelectedPlan(null); setPaymentData(null); }} className="p-2 hover:bg-slate-50 rounded-full">
                <MaterialIcon name="close" />
              </button>
            </div>
            <StripeProvider clientSecret={paymentData.clientSecret}>
              <CertPaymentForm
                clientSecret={paymentData.clientSecret}
                onSuccess={handlePaymentSuccess}
              />
            </StripeProvider>
          </motion.div>
        </div>
      )}
    </div>
  );
}
