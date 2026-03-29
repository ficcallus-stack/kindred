"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { StripeProvider } from "@/components/StripeProvider";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { enrollCertification, getMyCertifications } from "./actions";

const PLANS = [
  {
    id: "registration",
    icon: "how_to_reg",
    title: "Registration Fee",
    price: "$65",
    priceRaw: 65,
    description: "Required for all active caregivers. Covers essential background check and professional onboarding.",
    featured: false,
    buttonText: "Pay Fee Only",
  },
  {
    id: "elite_bundle",
    icon: "verified",
    title: "Elite Bundle",
    price: "$95",
    priceRaw: 95,
    description: "Complete your professional profile. Includes Registration Fee ($65) and the Global Care Exam ($45), saving you $15.",
    featured: true,
    buttonText: "Enroll in Elite Bundle",
    features: [
      "Background Check & Identity Verification",
      "2-Week Global Standards Training",
      "Professional 'Global Care' Badge",
    ],
  },
  {
    id: "standards_program",
    icon: "school",
    title: "Global Care Standards Exam",
    price: "$45",
    priceRaw: 45,
    description: "Validate your expertise in premium childcare and safety. Required for the 'Global Care' professional profile badge.",
    featured: false,
    buttonText: "Enroll in Exam",
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
        className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
      >
        {processing ? "Processing..." : "Complete Payment"}
      </button>
    </form>
  );
}

export default function CertificationsPage() {
  const [isPending, startTransition] = useTransition();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{ clientSecret: string } | null>(null);
  const [enrolledTypes, setEnrolledTypes] = useState<string[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, string>>({});
  const [lastSubmissionMap, setLastSubmissionMap] = useState<Record<string, string>>({});
  const router = useRouter();
  const searchParams = useSearchParams();
  const successParam = searchParams.get("success");
  const redirectStatus = searchParams.get("redirect_status");
  const success = successParam === "true" && (!redirectStatus || redirectStatus === "succeeded");

  useEffect(() => {
    getMyCertifications().then((certs: any[]) => {
      // Ignore cancelled/pending carts so UI doesn't falsely mark as 'Enrolled'
      const activeCerts = certs.filter(c => c.status !== "pending_payment");
      setEnrolledTypes(activeCerts.map((c) => c.type));
      
      const sm: Record<string, string> = {};
      const lsm: Record<string, string> = {};
      certs.forEach((c) => {
          sm[c.type!] = c.status;
          if (c.lastSubmissionId) lsm[c.type!] = c.lastSubmissionId;
      });
      setStatusMap(sm);
      setLastSubmissionMap(lsm);
    });
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
    <>
      {/* Success Banner */}
      {success && (
        <div className="mb-10 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/60 rounded-[2rem] p-8 shadow-sm relative overflow-hidden group">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-green-100 shrink-0">
                <MaterialIcon name="verified" className="text-4xl text-green-600" fill />
              </div>
              <div>
                <h3 className="font-headline font-black text-2xl text-green-900 tracking-tight mb-1">Payment Successful!</h3>
                <p className="text-green-800/80 font-medium">Your account is fully activated. You can now start securing jobs on the platform!</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
               {statusMap["standards_program"] === "completed" || statusMap["elite_bundle"] === "completed" ? (
                  <button 
                    onClick={() => {
                        const subId = lastSubmissionMap["standards_program"] || lastSubmissionMap["elite_bundle"];
                        if (subId) router.push(`/dashboard/nanny/certifications/${subId}/certificate`);
                    }}
                    className="px-6 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    View Official Certificate <MaterialIcon name="military_tech" className="text-[18px]" />
                  </button>
               ) : (enrolledTypes.includes("elite_bundle") || enrolledTypes.includes("standards_program")) ? (
                  <button 
                    onClick={() => router.push('/dashboard/nanny/certifications/global-care')}
                    className="px-6 py-3.5 bg-green-600 text-white font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Start Exam Now <MaterialIcon name="arrow_forward" className="text-[18px]" />
                  </button>
               ) : null}
               <button 
                  onClick={() => router.push('/jobs')}
                  className="px-6 py-3.5 bg-white text-green-700 font-bold rounded-xl shadow-sm hover:-translate-y-0.5 transition-all text-sm uppercase tracking-widest border border-green-200 flex items-center justify-center gap-2"
                >
                  Browse Jobs
               </button>
            </div>
          </div>
          <MaterialIcon name="celebration" className="absolute -top-10 -right-10 text-[12rem] text-green-500 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
        </div>
      )}

      {/* Persistent Exam Reminder */}
      {!success && (enrolledTypes.includes("elite_bundle") || enrolledTypes.includes("standards_program")) && statusMap["standards_program"] !== "completed" && statusMap["elite_bundle"] !== "completed" && (
         <div className="mb-10 bg-secondary/5 border border-secondary/20 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <MaterialIcon name="school" className="text-secondary text-3xl" fill />
              <div>
                <h4 className="font-headline font-bold text-primary">You're enrolled in the Global Care Exam!</h4>
                <p className="text-sm text-on-surface-variant font-medium">Complete your exam to earn your badge.</p>
              </div>
            </div>
            <button onClick={() => router.push('/dashboard/nanny/certifications/global-care')} className="px-6 py-2.5 bg-secondary text-white font-bold rounded-xl shadow-sm hover:shadow-md transition-all text-sm w-full sm:w-auto">
              Start Exam
            </button>
         </div>
      )}

      {/* Hero Section */}
      <section className="relative mb-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-3/5 z-10">
            <nav className="flex gap-2 items-center mb-6 text-sm font-medium text-on-surface-variant">
              <span>Certifications</span>
              <MaterialIcon name="chevron_right" className="text-sm" />
              <span className="text-primary">Global Standards</span>
            </nav>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight mb-6">
              Elevate Your Care to <span className="text-secondary italic">Global Standards</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
              Join our elite intensive program designed to refine your professional practice. Transition from a local caregiver to an internationally certified household management expert.
            </p>
          </div>
          <div className="lg:w-2/5 relative">
            <div className="relative w-full aspect-[4/5] overflow-hidden shadow-2xl z-0 rounded-3xl">
              <img
                alt="Professional caregiver smiling"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIhxOyq2kkWWMCOhnVJHAMIDv0X3eCxYlNX5tA2wfW9pSP6PFLm5O5HBy79QR8JoUdhRE1mCRkaqk4a9FATVZtSf8UFsMhxZtmH7fDxYez6dKR_kN6DEJjdSwF17RnESBCW-6TYAhFlYEizVisWImZD1xokwpCIdKp2hOeycz4E4rz2dDj39i6QmDbFwR8iptnlo9qGz4vMueAkPnincSGwnssKXNcs08XNtsQhHIH3SpAnJ6M-z1wUtvOlJLG6rsrbkl_38E-rdw"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-tertiary-fixed rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl border-4 border-white">
              <MaterialIcon name="workspace_premium" className="text-5xl text-on-tertiary-fixed mb-2" fill />
              <span className="text-xs font-bold uppercase tracking-widest text-on-tertiary-fixed leading-tight">Global Care Badge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {selectedPlan && paymentData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline text-xl font-bold text-primary">
                {PLANS.find((p) => p.id === selectedPlan)?.title}
              </h3>
              <button
                onClick={() => {
                  setSelectedPlan(null);
                  setPaymentData(null);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg"
              >
                <MaterialIcon name="close" />
              </button>
            </div>
            <StripeProvider clientSecret={paymentData.clientSecret}>
              <CertPaymentForm
                clientSecret={paymentData.clientSecret}
                onSuccess={handlePaymentSuccess}
              />
            </StripeProvider>
          </div>
        </div>
      )}

      {/* Enrollment Options */}
      <section className="mb-20" id="enrollment-options">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Professional Pathways</h2>
          <p className="text-on-surface-variant">Choose the enrollment level that fits your career goals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const hasEliteBundle = enrolledTypes.includes("elite_bundle");
            const hasRegistration = enrolledTypes.includes("registration");
            const hasExam = enrolledTypes.includes("standards_program");
            
            let isEnrolled = enrolledTypes.includes(plan.id);
            let isCompleted = statusMap[plan.id] === 'completed';
            let isDisabled = isPending || isEnrolled || isCompleted;
            let btnBg = plan.featured 
                ? "bg-primary text-white hover:shadow-primary/20" 
                : "bg-surface-container text-primary hover:bg-surface-container-high";

            // Logic overlaps
            if (plan.id === "registration" && hasEliteBundle) {
              isDisabled = true;
              isEnrolled = true;
            }
            if (plan.id === "standards_program" && hasEliteBundle) {
              isDisabled = true;
              isEnrolled = true;
              if (statusMap["elite_bundle"] === "completed") isCompleted = true;
            }
            if (plan.id === "elite_bundle" && (hasRegistration || hasExam) && !isEnrolled) {
              isDisabled = true;
              btnBg = "bg-slate-100 text-slate-400";
            }

            if (isEnrolled || isCompleted) {
               btnBg = "bg-green-50 text-green-700 border border-green-100";
            }

            return (
              <div
                key={plan.id}
                className={
                  plan.featured
                    ? "bg-primary text-on-primary p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden md:scale-105 z-10"
                    : "bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col justify-between hover:border-outline transition-colors"
                }
              >
                {plan.featured && (
                  <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    Best Value
                  </div>
                )}
                <div>
                  <div className={`w-12 h-12 ${plan.featured ? "bg-white/10" : "bg-surface-container"} rounded-xl flex items-center justify-center mb-6`}>
                    <MaterialIcon name={plan.icon} className={plan.featured ? "text-white" : "text-primary"} fill={plan.featured} />
                  </div>
                  <h3 className={`font-headline text-xl font-bold mb-2 ${plan.featured ? "" : "text-primary"}`}>{plan.title}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className={`text-4xl font-extrabold font-headline ${plan.featured ? "" : "text-primary"}`}>{plan.price}</span>
                    {plan.originalPrice && (
                      <span className="text-on-primary/60 line-through text-sm font-bold">{plan.originalPrice}</span>
                    )}
                  </div>
                  <p className={`${plan.featured ? "text-on-primary/80" : "text-on-surface-variant"} text-sm leading-relaxed mb-6`}>
                    {plan.description}
                  </p>
                  {plan.features && (
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs font-medium">
                          <MaterialIcon name="check_circle" className="text-secondary text-sm" fill />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  onClick={() => handleEnroll(plan.id)}
                  disabled={isDisabled}
                  className={`w-full py-4 font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${btnBg}`}
                >
                  {isCompleted ? (
                    <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          const subId = lastSubmissionMap[plan.id];
                          if (subId) router.push(`/dashboard/nanny/certifications/${subId}/certificate`);
                      }}
                      className="w-full h-full flex items-center justify-center gap-2"
                    >
                      <MaterialIcon name="verified" fill /> View Certificate
                    </button>
                  ) : isEnrolled ? (
                    <>
                      <MaterialIcon name="check_circle" fill className="text-secondary" /> {statusMap[plan.id] === 'marking' ? 'Under Review' : 'Enrolled'}
                    </>
                  ) : plan.id === "elite_bundle" && isDisabled ? (
                    "Purchased Separately"
                  ) : isPending && selectedPlan === plan.id ? (
                    "Setting up..."
                  ) : (
                    <>
                      {plan.buttonText}
                      {(plan.featured || plan.id === 'standards_program') && !isDisabled && <MaterialIcon name="arrow_forward" className="text-sm" />}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-3xl shadow-sm flex flex-col md:flex-row gap-8 items-center border border-outline-variant/5">
          <div className="w-32 h-32 flex-shrink-0 bg-primary/5 rounded-full flex items-center justify-center border-2 border-dashed border-primary/20">
            <MaterialIcon name="verified" className="text-6xl text-primary" fill />
          </div>
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary mb-3">The Professional Advantage</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Instantly build trust with a permanent certification badge displayed on your public profile. Certified caregivers receive 3x more inquiries from high-net-worth families.
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl">
          <MaterialIcon name="visibility" className="text-secondary text-4xl mb-4" />
          <h4 className="font-headline text-xl font-bold text-primary mb-2">Visibility</h4>
          <p className="text-on-surface-variant text-sm">Priority placement in search results for families filtering by &apos;Expert&apos;.</p>
        </div>
      </div>
    </>
  );
}
