"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { StripeProvider } from "@/components/StripeProvider";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { enrollCertification, getMyCertifications } from "../actions";
import { useToast } from "@/components/Toast";

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
        className="w-full bg-primary text-white font-headline font-bold py-5 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 group disabled:opacity-50"
      >
        {processing ? "Starting Exam..." : "Start Exam"}
        <MaterialIcon name="arrow_forward" className="text-xl group-hover:translate-x-1 transition-transform" />
      </button>
      <div className="flex items-center justify-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-default">
            <MaterialIcon name="lock" className="text-sm" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Secure Payment Processing</span>
        </div>
    </form>
  );
}

export default function GlobalCareOverviewPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isFailed, setIsFailed] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [examStatus, setExamStatus] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{ clientSecret: string } | null>(null);

  useEffect(() => {
    // Check if user is already enrolled or failed
    getMyCertifications().then(certs => {
      const globalCert = certs.find(c => c.type === 'standards_program');
      if (globalCert) {
        setExamStatus(globalCert.status);
        if (globalCert.status === 'enrolled' || globalCert.status === 'completed' || globalCert.status === 'in_progress') {
          setIsEnrolled(true);
        } else if (globalCert.status === 'failed') {
          setIsFailed(true);
        }
      }
    });
  }, []);

  const handleStartExam = () => {
    if (isEnrolled) {
      router.push("/dashboard/nanny/certifications/global-care/exam");
      return;
    }

    startTransition(async () => {
      try {
        const type = isFailed ? "standards_retake" : "standards_program";
        const result = await enrollCertification({ type });
        setPaymentData({ clientSecret: result.clientSecret! });
      } catch (err: any) {
        showToast(err.message || "Enrollment failed", "error");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      {/* Hero Section */}
      <header className="relative mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-secondary font-headline font-bold tracking-widest text-xs uppercase mb-4 block">Final Milestone</span>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-tight mb-8 tracking-tighter italic">
              Global Caregiver <br /> Standards Exam
            </h1>
            <p className="text-on-surface-variant text-xl leading-relaxed mb-10 max-w-lg opacity-80">
              Elevate your professional standing. This certification validates your expertise in premium childcare, safety protocols, and developmental support. Join the top 5% of caregivers worldwide.
            </p>
          </div>
          <div className="relative group">
            <div className="absolute -inset-4 bg-secondary-fixed opacity-20 rounded-[3rem] -rotate-2 group-hover:rotate-0 transition-transform duration-700"></div>
            <img
              alt="Professional Caregiver"
              className="relative rounded-[2.5rem] w-full h-[500px] object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBxu6r5f624cPL4rM6_D8tHLU5_bJ3w89rDiext5pWn5XFr9mGPJknkLyyIa4SvTTMToJz-Oe_8j95DGQWMwSnAhDweuRJpNg1FI2n8lIUWtyOAGpcJknj8v0kMRHJrRQvQ1gknpsC3ADhONFH-TCeAa7M6NfAMHB6nFubWMa1Pu0cWwtp0HEIZ73fK7WlEgsIL13iGvH8xva6Dndll2JnMNsjtUcKIzgXOf8qJos5VZyUutH2toEPiNNQ0-wzFgXdt-6XL8BRn2Ck"
            />
            <div className="absolute bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl max-w-[280px] animate-in zoom-in slide-in-from-left-4 duration-1000 delay-300">
              <p className="text-secondary font-headline font-black text-3xl mb-1">$45.00</p>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">One-time certification fee</p>
            </div>
          </div>
        </div>
      </header>

      {/* Benefits Bento Grid */}
      <section className="mb-24 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: "quiz", title: "50 Questions", subtitle: "Typed scenario-based answers", color: "bg-primary/5 text-primary" },
          { icon: "timer", title: "60 Minutes", subtitle: "Focused, timed environment", color: "bg-secondary/5 text-secondary" },
          { icon: "grade", title: "75% Passing", subtitle: "Required for 'Global Care' badge", color: "bg-emerald-50 text-emerald-600" }
        ].map((stat, i) => (
          <div key={i} className={`p-10 rounded-[2.5rem] flex flex-col justify-between transition-all hover:shadow-2xl hover:-translate-y-1 ${stat.color}`}>
            <MaterialIcon name={stat.icon} className="text-5xl mb-6 opacity-80" fill />
            <div>
              <h4 className="font-headline font-black text-2xl tracking-tight">{stat.title}</h4>
              <p className="text-sm font-medium opacity-70 mt-1">{stat.subtitle}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content & Registration */}
      <section className="grid lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-12 xl:col-span-7 space-y-16">
          <div className="space-y-10">
            <h2 className="font-headline text-4xl font-black text-primary tracking-tight italic border-b-4 border-secondary w-fit pb-2">Why get certified?</h2>
            <div className="space-y-10">
              {[
                { icon: "verified", title: "Global Recognition", text: "Industry-standard credential recognized by premium agencies and high-net-worth families worldwide." },
                { icon: "trending_up", title: "Higher Earning Potential", text: "Certified caregivers on our platform earn an average of 22% more per hour than non-certified peers." },
                { icon: "badge", title: "Digital Trust Badge", text: "Feature the 'Global Care Professional' badge prominently on your profile to build instant trust with parents." }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-6 items-start group">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-low flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110">
                    <MaterialIcon name={benefit.icon} className="text-secondary text-2xl" fill />
                  </div>
                  <div>
                    <h5 className="font-headline font-bold text-xl text-primary mb-2">{benefit.title}</h5>
                    <p className="text-on-surface-variant leading-relaxed opacity-80">{benefit.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-secondary/5 p-10 rounded-[2.5rem] border-l-8 border-secondary relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="flex gap-3 items-center text-secondary">
                <MaterialIcon name="info" className="text-2xl" fill />
                <span className="font-headline font-black text-sm uppercase tracking-[0.2em]">Proctoring Notice</span>
              </div>
              <p className="text-secondary/80 font-medium leading-relaxed">
                The exam uses internal integrity monitoring. Please ensure you are in a quiet, undisturbed environment. **You cannot leave the browser tab once the exam starts.**
              </p>
            </div>
            <MaterialIcon name="verified_user" className="absolute -bottom-10 -right-10 text-[12rem] text-secondary opacity-[0.03] group-hover:scale-110 transition-transform duration-1000" />
          </div>
        </div>

        {/* Payment Summary Sidebar */}
        <div className="lg:col-span-12 xl:col-span-5 sticky top-24">
          <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-outline-variant/10">
            <div className="bg-primary p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-headline font-black text-2xl mb-1 italic">Registration Summary</h3>
                <p className="text-on-primary-container text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Global Professional Track</p>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary opacity-10 rounded-full blur-3xl"></div>
            </div>
            
            <div className="p-12 space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-on-surface-variant opacity-60">{isFailed ? "Exam Retake Fee" : "Exam Enrollment"}</span>
                  <span className="text-primary">${isFailed ? "5.00" : "45.00"}</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-on-surface-variant opacity-60">Digital Certificate</span>
                  <span className="text-emerald-500 italic">Included</span>
                </div>
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-on-surface-variant opacity-60">Platform Handling</span>
                  <span className="text-emerald-500 italic">Included</span>
                </div>
                <div className="pt-8 border-t border-outline-variant/10 flex justify-between items-center">
                  <span className="font-headline font-black text-primary text-xl uppercase tracking-tighter">Total Due</span>
                  <span className="font-headline font-black text-4xl text-primary tracking-tighter">${isFailed ? "5.00" : "45.00"}</span>
                </div>
              </div>

              {!paymentData ? (
                <button
                  onClick={handleStartExam}
                  disabled={isPending}
                  className="w-full bg-primary text-white font-headline font-black py-6 rounded-2xl shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4"
                >
                  {isEnrolled ? (
                    <>
                      Go to Exam
                      <MaterialIcon name="arrow_forward" fill />
                    </>
                  ) : isPending ? (
                    "Preparing enrollment..."
                  ) : isFailed ? (
                    <>
                      Pay $5 & Retake
                      <MaterialIcon name="refresh" fill />
                    </>
                  ) : (
                    <>
                      Enroll & Start
                      <MaterialIcon name="arrow_forward" fill />
                    </>
                  )}
                </button>
              ) : (
                <StripeProvider clientSecret={paymentData.clientSecret}>
                  <ExamPaymentForm
                    clientSecret={paymentData.clientSecret}
                    onSuccess={() => {
                        setIsEnrolled(true);
                        setPaymentData(null);
                        showToast("Successfully enrolled! You can now start the exam.", "success");
                    }}
                  />
                </StripeProvider>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
