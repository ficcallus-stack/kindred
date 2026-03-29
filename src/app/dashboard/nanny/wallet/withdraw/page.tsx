"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getWalletData, getPayoutMethod, withdrawFunds } from "../actions";
import Link from "next/link";

const FEE_CENTS = 50;
const MIN_WITHDRAWAL_CENTS = 5000; // $50.00 min

export default function WithdrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [payoutMethod, setPayoutMethod] = useState<any>(null);
  const [amountStr, setAmountStr] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [wData, pMethod] = await Promise.all([
          getWalletData(),
          getPayoutMethod(),
        ]);
        setWallet(wData);
        setPayoutMethod(pMethod);
        if (!pMethod) {
          setError("No payout method linked. Please connect your bank account first.");
        }
      } catch (err) {
        console.error("Init failed", err);
        setError("Failed to load wallet data.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const totalCents = Math.round(parseFloat(amountStr || "0") * 100);
  const balanceCents = wallet?.balance || 0;
  const netCents = Math.max(0, totalCents - FEE_CENTS);

  const handleWithdraw = async () => {
    if (totalCents < MIN_WITHDRAWAL_CENTS) {
      return setError("Minimum withdrawal is $50.00");
    }
    if (totalCents > balanceCents) {
      return setError("Insufficient balance");
    }

    setSubmitting(true);
    setError(null);
    try {
      await withdrawFunds(totalCents);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Withdrawal failed");
    } finally {
      setSubmitting(false);
    }
  };

  const setQuickAmount = (val: number) => {
    setAmountStr(val.toFixed(2));
    setError(null);
  };

  const setMaxAmount = () => {
    setAmountStr((balanceCents / 100).toFixed(2));
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-32 h-32 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-2xl rotate-3">
          <MaterialIcon name="check_circle" className="text-6xl text-green-600" fill />
        </div>
        <h1 className="text-4xl md:text-5xl font-headline font-black text-primary mb-6 italic tracking-tight">Request Received!</h1>
        <p className="text-on-surface-variant font-medium leading-relaxed mb-12 italic opacity-70">
          We've received your withdrawal request for <span className="text-primary font-black">${(totalCents / 100).toFixed(2)}</span>. 
          Your payout is now <span className="text-primary font-bold">Pending Administrative Approval</span> and will be processed within 24 hours.
        </p>
        <div className="flex flex-col gap-4">
            <Link href="/dashboard/nanny/wallet" className="bg-primary text-white py-5 rounded-2xl font-headline font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all italic">
                Back to Wallet
            </Link>
            <button onClick={() => window.location.reload()} className="text-on-surface-variant font-black uppercase tracking-widest text-[9px] italic opacity-40 hover:opacity-100 transition-opacity">
                Process another withdrawal
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="mb-16">
         <Link href="/dashboard/nanny/wallet" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-primary transition-all mb-6">
            <MaterialIcon name="arrow_back" className="text-sm" />
            Wallet Home
         </Link>
         <h1 className="text-5xl md:text-7xl font-headline font-black text-primary tracking-tighter italic leading-none">
            Withdrawal <br/><span className="text-secondary italic">Terminal.</span>
         </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-12 rounded-[3rem] shadow-2xl border border-outline-variant/10 relative overflow-hidden group">
            <div className="relative z-10">
               <label className="block text-[10px] font-black text-on-surface-variant mb-4 uppercase tracking-[0.2em] opacity-40 italic">Input Amount (USD)</label>
               <div className="relative flex items-end">
                  <span className="text-4xl font-headline font-black text-primary/20 mb-3 mr-4 italic tracking-tighter">$</span>
                  <input 
                    type="number" 
                    value={amountStr}
                    onChange={(e) => setAmountStr(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent border-none p-0 text-7xl md:text-8xl font-headline font-black text-primary placeholder:text-primary/5 focus:ring-0 italic tracking-tighter"
                  />
               </div>
               
               <div className="flex flex-wrap gap-3 mt-12">
                  {[20, 50, 100].map(val => (
                    <button 
                      key={val}
                      onClick={() => setQuickAmount(val)}
                      className="px-6 py-3 bg-surface-container-low hover:bg-primary/5 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest transition-all italic border border-outline-variant/10 active:scale-95 shadow-sm"
                    >
                      ${val}
                    </button>
                  ))}
                  <button 
                    onClick={setMaxAmount}
                    className="px-6 py-3 bg-secondary-fixed/30 hover:bg-secondary-fixed/50 rounded-xl text-[10px] font-black text-on-secondary-fixed uppercase tracking-widest transition-all italic active:scale-95 shadow-sm"
                  >
                    Max (${(balanceCents / 100).toFixed(2)})
                  </button>
               </div>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12 group-hover:rotate-6 transition-transform duration-1000">
               <MaterialIcon name="payments" className="text-[12rem]" fill />
            </div>
          </div>

          <div className="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant/10">
            <h3 className="text-sm font-black text-primary italic tracking-tight mb-8 flex items-center gap-3">
               <MaterialIcon name="receipt" className="text-secondary" />
               Calculation Audit
            </h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center opacity-60">
                  <span className="text-xs font-medium italic">Withdrawal Subtotal</span>
                  <span className="font-bold text-sm">${(totalCents / 100).toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center text-error border-b border-outline-variant/20 pb-4">
                  <span className="text-xs font-medium italic">Service Fee (Standard Payout)</span>
                  <span className="font-bold text-sm">-${(FEE_CENTS / 100).toFixed(2)}</span>
               </div>
               <div className="flex justify-between items-center pt-2">
                  <span className="font-black text-primary italic uppercase text-[10px] tracking-widest">Net Payout Amount</span>
                  <span className="font-headline font-black text-2xl text-primary tracking-tighter">${(netCents / 100).toFixed(2)}</span>
               </div>
            </div>
          </div>

          <button 
            disabled={submitting || totalCents < MIN_WITHDRAWAL_CENTS || totalCents > balanceCents || !payoutMethod}
            onClick={handleWithdraw}
            className="w-full py-6 bg-gradient-to-br from-primary to-primary-container disabled:opacity-30 text-white rounded-[2rem] font-headline font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all italic"
          >
            {submitting ? "Processing Transfer..." : "Confirm & Dispatch Funds"}
          </button>

          {error && (
            <div className="p-6 bg-error/5 border border-error/10 text-error rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2">
                <MaterialIcon name="warning" className="text-xl" fill />
                <p className="text-xs font-bold italic tracking-tight">{error}</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 space-y-8">
           <div className="p-10 bg-primary/5 border border-primary/10 rounded-[3rem] shadow-xl shadow-black/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-black/5">
                    <MaterialIcon name="account_balance" className="text-primary text-xl" />
                 </div>
                 <div>
                    <h4 className="font-headline font-black text-primary tracking-tight leading-none italic">Target Destination</h4>
                    <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-1">Stripe Connected Express</p>
                 </div>
              </div>
              
              {payoutMethod ? (
                <div className="space-y-4">
                   <div className="p-6 bg-white rounded-2xl shadow-sm border border-outline-variant/10 flex items-center justify-between">
                      <span className="text-xs font-black text-primary italic">{payoutMethod.bankName}</span>
                      <span className="font-mono text-xs opacity-40 uppercase tracking-widest">••••{payoutMethod.last4}</span>
                   </div>
                   <div className="flex gap-3 items-center px-2">
                       <MaterialIcon name="verified" className="text-green-600 text-sm" fill />
                       <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] italic">Instant Verification Passed</span>
                   </div>
                </div>
              ) : (
                <Link href="/dashboard/nanny/wallet" className="block p-6 bg-white rounded-2xl border-2 border-dashed border-outline-variant/20 text-center hover:border-primary transition-all group">
                   <MaterialIcon name="link" className="text-3xl text-primary/10 mb-2 group-hover:scale-110 transition-transform" />
                   <p className="text-[10px] font-black text-primary uppercase tracking-widest italic">Link Payout Method</p>
                </Link>
              )}
           </div>

           <div className="p-10 bg-secondary-fixed/10 border border-secondary/10 rounded-[3rem] relative overflow-hidden">
              <h4 className="font-headline font-black text-on-secondary-fixed tracking-tight italic mb-4">Financial Protocol</h4>
              <ul className="space-y-6">
                 {[
                   { icon: "schedule", text: "Standard payout: 1-3 business days" },
                   { icon: "security", text: "Bank-grade encrypted transfers" },
                   { icon: "info", text: "Max withdrawal per 24hrs: $10,000" }
                 ].map((item, i) => (
                   <li key={i} className="flex gap-4 items-start">
                     <MaterialIcon name={item.icon} className="text-secondary text-sm" />
                     <p className="text-xs font-medium text-on-surface-variant italic opacity-80">{item.text}</p>
                   </li>
                 ))}
              </ul>
              <MaterialIcon name="layers" className="absolute -bottom-10 -right-10 text-[10rem] opacity-[0.03] rotate-12" fill />
           </div>
        </div>
      </div>
    </div>
  );
}
