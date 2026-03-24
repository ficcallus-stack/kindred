"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { getWalletData, getPayoutMethod, withdrawFunds } from "../actions";

export default function WithdrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [payoutMethod, setPayoutMethod] = useState<any>(null);
  const [amount, setAmount] = useState<string>("");
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
        // Default to full balance
        if (wData?.balance) {
          setAmount((wData.balance / 100).toString());
        }
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleWithdraw = async () => {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (!amountCents || amountCents <= 50) return;

    setWithdrawing(true);
    try {
      await withdrawFunds(amountCents);
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/nanny/wallet"), 3000);
    } catch (error) {
      console.error("Withdrawal failed", error);
      alert(error instanceof Error ? error.message : "Withdrawal failed");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!payoutMethod) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto text-orange-600">
           <MaterialIcon name="warning" className="text-4xl" />
        </div>
        <h1 className="text-2xl font-headline font-black text-navy">Payout Method Missing</h1>
        <p className="text-on-surface-variant font-medium">You need to connect a bank account before you can withdraw funds.</p>
        <button onClick={() => router.push("/dashboard/nanny/wallet")} className="bg-navy text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs">Return to Wallet</button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 shadow-xl shadow-green-600/10">
           <MaterialIcon name="check_circle" className="text-5xl" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-black text-navy px-4 leading-tight mb-4">Transfer Initiated!</h1>
          <p className="text-on-surface-variant font-medium text-sm max-w-xs mx-auto">Your funds are being securely processed via Stripe. Expect them in your bank in 1-2 business days.</p>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-navy/40 animate-pulse">Redirecting to history...</p>
      </div>
    );
  }

  const numericAmount = parseFloat(amount) || 0;
  const fee = 0.50;
  const netAmount = Math.max(0, numericAmount - fee);

  return (
    <section className="flex-1 p-6 md:p-12 lg:p-20 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-10 text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-60">
          <MaterialIcon name="arrow_back" className="text-sm" />
          <Link className="hover:text-navy transition-colors" href="/dashboard/nanny/wallet">Back to Payouts</Link>
        </div>

        <div className="mb-12">
          <h1 className="font-headline text-4xl font-black text-navy mb-4 tracking-tighter italic leading-none">Confirm Withdrawal</h1>
          <p className="text-on-surface-variant text-lg font-medium opacity-60 leading-relaxed max-w-md">
            Review your withdrawal details. Funds will be securely transferred to your verified bank account.
          </p>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-[2.5rem] p-10 md:p-14 shadow-2xl shadow-navy/5 relative overflow-hidden border border-outline-variant/10">
          <div className="space-y-10 relative z-10">
            {/* Amount Input Section */}
            <div className="flex flex-col gap-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Withdrawal Amount (USD)</span>
              <div className="flex items-baseline gap-4 group">
                <span className="text-5xl font-black text-navy font-headline tracking-tighter italic leading-none">$</span>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-5xl font-black text-navy font-headline tracking-tighter italic leading-none bg-transparent border-none focus:ring-0 w-full p-0"
                  max={wallet?.balance / 100}
                />
              </div>
              <p className="text-xs font-bold text-navy/40 uppercase tracking-widest">
                Max Available: ${(wallet?.balance / 100).toFixed(2)}
              </p>
            </div>

            {/* Destination & Delivery */}
            <div className="grid md:grid-cols-2 gap-10 py-10 border-y border-outline-variant/10">
              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Destination Bank</span>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-navy/5 flex items-center justify-center text-navy shadow-inner shadow-black/5">
                    <MaterialIcon name="account_balance" className="text-2xl" />
                  </div>
                  <div>
                    <p className="font-black text-navy text-sm uppercase tracking-wide leading-none mb-1">{payoutMethod.bankName}</p>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest opacity-60">Ending in ••••{payoutMethod.last4}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Est. Delivery</span>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-tertiary-fixed/40 flex items-center justify-center text-on-tertiary-fixed-variant shadow-inner shadow-black/5">
                    <MaterialIcon name="schedule" className="text-2xl" />
                  </div>
                  <div>
                    <p className="font-black text-navy text-sm uppercase tracking-wide leading-none mb-1">1-3 Business Days</p>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest opacity-60">Standard Stripe Secure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MaterialIcon name="verified" className="text-navy text-xl" />
                <span className="text-[10px] font-black uppercase tracking-widest text-navy">Secure Bank Transfer</span>
              </div>
              <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                <span className="text-[8px] font-black uppercase tracking-tighter text-on-surface-variant">Powered by</span>
                <div className="h-4 w-10 bg-navy/10 rounded-sm"></div> {/* Stripe Logo Placeholder */}
              </div>
            </div>

            {/* Fees summary */}
            <div className="bg-surface-container-low/50 p-6 rounded-2xl border border-outline-variant/10 space-y-2">
              <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                <span>Withdrawal Fee</span>
                <span>$0.50</span>
              </div>
              <div className="flex justify-between text-sm font-black text-navy pt-2 border-t border-navy/5">
                <span>Net Transfer</span>
                <span>${netAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <button 
                onClick={handleWithdraw}
                disabled={withdrawing || netAmount <= 0 || numericAmount > (wallet?.balance / 100)}
                className="w-full py-5 bg-navy text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-navy/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {withdrawing ? (
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <MaterialIcon name="check_circle" />
                    <span>Confirm Withdrawal</span>
                  </>
                )}
              </button>
              <button 
                onClick={() => router.back()}
                className="w-full py-4 text-on-surface-variant text-[10px] font-black uppercase tracking-widest hover:text-navy transition-colors"
                disabled={withdrawing}
              >
                Cancel & Return
              </button>
            </div>
          </div>
          <MaterialIcon name="payments" className="absolute -top-10 -right-10 text-[15rem] opacity-[0.02] pointer-events-none" />
        </div>

        {/* Editorial Footer */}
        <div className="mt-12 flex gap-5 items-start bg-tertiary-fixed/20 p-8 rounded-3xl border border-tertiary/10">
          <MaterialIcon name="info" className="text-on-tertiary-fixed-variant mt-1" />
          <p className="text-xs text-on-tertiary-fixed-variant/70 font-medium leading-relaxed italic">
            "Funds will be deducted from your Kindred balance immediately. For your security, withdrawals are monitored and may be subject to additional verification by your financial institution."
          </p>
        </div>
      </div>
    </section>
  );
}
