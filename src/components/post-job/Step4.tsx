import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { StripeProvider } from "@/components/StripeProvider";

interface Step4Props {
  data: any;
  onNext: () => void;
  onBack: () => void;
}

function Step4Inner({ data, onNext, total }: { data: any, onNext: () => void, total: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/parent`,
      },
      redirect: "if_required", // redirect only on 3DS authorization triggers
    });

    if (error) {
      setErrorMessage(error.message || "Something went wrong with your payment.");
      setIsProcessing(false);
    } else {
      onNext(); // Advance step count securely Node
    }
  };

  const minRate = data.minRate || 25;
  const hours = 4;
  const subtotal = minRate * hours;
  const fee = 5.0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Left Column: Payment & Escrow Info */}
      <div className="lg:col-span-7 space-y-10">
        <section>
          <h1 className="text-4xl font-extrabold text-primary font-headline tracking-tight mb-4 leading-tight">
            Secure your booking with Kindred Escrow
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl">
            We hold your funds securely and only release them to your caregiver once the job is completed to your satisfaction.
          </p>
        </section>

        {/* Escrow Features Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed flex items-center justify-center">
              <MaterialIcon name="verified_user" className="text-on-tertiary-fixed-variant" fill />
            </div>
            <h3 className="font-headline font-bold text-primary">Funds held securely</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Payments are kept in a protected escrow account until you approve the hours worked.
            </p>
          </div>
          <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 flex flex-col gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-fixed flex items-center justify-center">
              <MaterialIcon name="speed" className="text-on-secondary-fixed-variant" fill />
            </div>
            <h3 className="font-headline font-bold text-primary">Immediate hire enabled</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Pre-paying allows top-tier caregivers to accept your job instantly without waiting for wire transfers.
            </p>
          </div>
          <div className="p-6 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/15 flex flex-col gap-3 md:col-span-2">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center shrink-0">
                <MaterialIcon name="undo" className="text-on-primary-fixed-variant" fill />
              </div>
              <div>
                <h3 className="font-headline font-bold text-primary">100% Refund Guarantee</h3>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                  If you don't find a match or need to cancel before the job starts, your entire deposit is returned immediately. No fees, no fuss.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Card Form */}
        <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/15">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-headline text-primary uppercase tracking-tighter">Payment Details</h2>
            <div className="flex gap-2">
              <MaterialIcon name="credit_card" className="text-outline-variant" />
            </div>
          </div>
          <form className="space-y-6" onSubmit={handlePay}>
            <PaymentElement />
            {errorMessage && <p className="text-sm text-error font-medium">{errorMessage}</p>}
          </form>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="lg:col-span-5">
        <div className="sticky top-32 space-y-6">
          <div className="bg-primary text-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary-container/20 overflow-hidden relative group">
            {/* Decorative Gradient Element */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-container/30 rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000"></div>
            
            <h2 className="text-2xl font-bold font-headline mb-8 relative z-10 italic">Job Summary</h2>
            
            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-on-primary-container text-[10px] uppercase tracking-[0.2em] font-black font-label opacity-60">Duration</p>
                  <p className="text-lg font-bold tracking-tight">Saturday, Oct 14 • 4 Hours</p>
                </div>
                <MaterialIcon name="calendar_today" className="text-primary-fixed-dim" />
              </div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-on-primary-container text-[10px] uppercase tracking-[0.2em] font-black font-label opacity-60">Service</p>
                  <p className="text-lg font-bold tracking-tight">Standard Daytime Care</p>
                </div>
                <MaterialIcon name="child_care" className="text-primary-fixed-dim" />
              </div>
              
              <div className="pt-8 mt-8 border-t border-white/10 space-y-4">
                <div className="flex justify-between text-on-primary-container font-medium">
                  <span className="text-sm">Estimated Total ({hours}hrs × ${minRate})</span>
                  <span className="font-bold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-on-primary-container font-medium">
                  <span className="text-sm">Escrow Service Fee</span>
                  <span className="font-bold">${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-3xl font-black pt-4 border-t border-white/5">
                  <span className="font-headline tracking-tighter">Deposit Due</span>
                  <span className="font-headline tracking-tighter">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handlePay}
              disabled={isProcessing || !stripe || !elements}
              className="w-full mt-10 bg-secondary-container hover:bg-secondary text-on-secondary-container hover:text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl transition-all scale-100 active:scale-95 shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : "Authorize Escrow Deposit"}
              <MaterialIcon name="chevron_right" />
            </button>
            
            <div className="mt-8 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-on-primary-container/60">
              <MaterialIcon name="lock" className="text-sm" />
              <span>Secure Bank-grade Encryption</span>
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-tertiary-fixed p-8 rounded-[2rem] flex gap-5 items-start border border-outline-variant/10 shadow-sm">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border-2 border-white shadow-md rotate-3">
              <img 
                className="w-full h-full object-cover" 
                alt="Elena R." 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyGVAePrYMTZ7XtnWeGLkd2-Zv1ADxQnpzqoNvWhTGI1bye6X63Fh6s6MfWz-ByDTd-FwOihEsbp69jDbc6G8AxZYv15qQe3JK1tZtqL3imh9SbZs68tR27KhwpAnW9Io0AlfZPcZCYRRYWlGA7Z7CqY546UtFrHuuEziAigUbHhXYuIa-02CUgNyUjFwLuws12hvdJeKidAEodoYWVbkTCaCx-xnDLRezQMrCRW-nQKeKUwvYwfFTPqmB0_uFUvoFW4IcsdZ2_GQ" 
              />
            </div>
            <div>
              <p className="text-sm text-on-tertiary-fixed-variant italic leading-relaxed font-medium">
                "The escrow system gave me such peace of mind. Knowing the funds are ready actually helped me attract a better caregiver faster!"
              </p>
              <p className="text-[10px] font-black text-on-tertiary-fixed uppercase tracking-widest mt-3">
                — Elena R., Kindred Parent
              </p>
            </div>
          </div>

          {/* Trust Footer Signals */}
          <div className="flex flex-wrap items-center justify-center gap-6 px-4">
            <div className="flex items-center gap-2 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
              <MaterialIcon name="security" className="text-xl" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">PCI Compliant</span>
            </div>
            <div className="flex items-center gap-2 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
              <MaterialIcon name="shield" className="text-xl" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">SSL Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Step4({ data, onNext, onBack }: Step4Props) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const minRate = data.minRate || 25;
  const hours = 4;
  const subtotal = minRate * hours;
  const fee = 5.0;
  const total = subtotal + fee;

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Math.round(total * 100),
        description: "KindredCare Booking Escrow",
      }),
    })
      .then((res) => res.json())
      .then((resData) => setClientSecret(resData.clientSecret))
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [total]);

  if (isLoading) {
    return <div className="py-20 text-center font-bold text-primary">Loading secure payment portal...</div>;
  }

  return (
    <StripeProvider clientSecret={clientSecret}>
      <Step4Inner data={data} onNext={onNext} total={total} />
    </StripeProvider>
  );
}
