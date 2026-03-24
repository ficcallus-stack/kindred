"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { getWalletData, getPayoutMethod, getStripeConnectOnboarding } from "./actions";
import { format } from "date-fns";

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [payoutMethod, setPayoutMethod] = useState<any>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [wData, pMethod] = await Promise.all([
          getWalletData(),
          getPayoutMethod(),
        ]);
        setWallet(wData);
        setPayoutMethod(pMethod);
      } catch (error) {
        console.error("Failed to load wallet data", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleConnectBank = async () => {
    setOnboardingLoading(true);
    try {
      const url = await getStripeConnectOnboarding();
      window.location.href = url;
    } catch (error) {
      console.error("Failed to get onboarding link", error);
    } finally {
      setOnboardingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-navy border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const balance = (wallet?.balance || 0) / 100;

  return (
    <div className="space-y-12 pb-20">
      {/* Wallet Hero Section (Asymmetric Bento) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Balance Card */}
        <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-primary to-primary-container p-8 md:p-12 rounded-[1.5rem_0.75rem_1.5rem_0.75rem] shadow-2xl flex flex-col justify-between text-white border border-white/5">
          <div className="relative z-10">
            <p className="font-label text-blue-200 uppercase tracking-widest text-[10px] font-bold mb-4 bg-white/10 w-fit px-3 py-1 rounded-full">Available Balance</p>
            <h2 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter mb-10 leading-none">
              ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex flex-wrap gap-6 items-center">
              <Link 
                href="/dashboard/nanny/wallet/withdraw"
                className={cn(
                  "bg-secondary-fixed-dim text-on-secondary-fixed px-10 py-5 rounded-2xl font-headline font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-3 uppercase tracking-widest",
                   balance <= 0 && "opacity-50 pointer-events-none"
                )}
              >
                <span>Withdraw Now</span>
                <MaterialIcon name="paid" className="text-2xl" />
              </Link>
              <p className="flex items-center text-blue-100/60 text-xs font-medium max-w-[220px] leading-relaxed">
                <MaterialIcon name="info" className="text-sm mr-2 opacity-50" />
                Transfers typically complete in 1-2 business days via Stripe Secure.
              </p>
            </div>
          </div>
          {/* Abstract Accent */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
          <MaterialIcon name="currency_exchange" className="absolute -right-8 -bottom-8 text-[12rem] opacity-[0.03] rotate-12" />
        </div>

        {/* Bank Configuration Card */}
        <div className="bg-surface-container-lowest p-8 md:p-10 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-headline font-bold text-navy text-lg">Payout Method</h3>
              <div className="p-2 bg-secondary-fixed/20 rounded-xl">
                <MaterialIcon name="account_balance" className="text-secondary" />
              </div>
            </div>

            {payoutMethod ? (
              <div className="space-y-6">
                <div className="p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20 shadow-inner group">
                  <p className="text-[10px] font-black text-on-surface-variant mb-2 uppercase tracking-widest opacity-60">Connected Account</p>
                  <p className="font-headline font-bold text-navy flex items-center justify-between">
                    <span>{payoutMethod.bankName}</span>
                    <span className="text-xs opacity-40 font-mono tracking-[0.2em]">••••{payoutMethod.last4}</span>
                  </p>
                </div>
                <button 
                  onClick={handleConnectBank}
                  disabled={onboardingLoading}
                  className="w-full py-4 text-xs font-black text-navy border-2 border-navy/10 rounded-2xl hover:bg-navy/5 active:scale-[0.98] transition-all uppercase tracking-widest"
                >
                  {onboardingLoading ? "Updating..." : "Change Bank Account"}
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-6">
                 <div className="w-14 h-14 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MaterialIcon name="link" className="text-navy/40 text-2xl" />
                </div>
                <p className="text-xs font-medium text-on-surface-variant leading-relaxed">Securely link your bank account via Stripe to enable instant payouts.</p>
                <button 
                  onClick={handleConnectBank}
                  disabled={onboardingLoading}
                  className="w-full py-5 bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-navy/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  {onboardingLoading ? "Redirecting..." : "Connect Stripe Express"}
                </button>
              </div>
            )}
          </div>
          <div className="mt-8 p-5 bg-tertiary-fixed/30 rounded-2xl border border-tertiary/10">
            <p className="text-[10px] leading-relaxed text-on-tertiary-fixed-variant font-bold uppercase tracking-wide opacity-80">
              <span className="text-terracotta mr-1">●</span> Fee Transparency:
            </p>
            <p className="text-[10px] leading-relaxed text-on-tertiary-fixed-variant/70 font-medium mt-1">
              A $0.50 processing fee applies to each manual withdrawal. Scheduled payouts remain free.
            </p>
          </div>
        </div>
      </section>

      {/* Insights & Transaction History */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Earnings Chart (Custom CSS) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="font-headline text-3xl font-black text-navy tracking-tight italic">Earnings Growth</h3>
              <p className="text-on-surface-variant text-sm font-medium opacity-60">Visualizing your success over the last 6 months</p>
            </div>
          </div>
          <div className="bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-sm h-[320px] flex items-end justify-between gap-6 relative border border-outline-variant/5">
             {/* Simple Bar Chart Mockup - Scaling based on design heights */}
             {[
               { m: "Jan", val: 1200, h: "40%" },
               { m: "Feb", val: 1450, h: "55%" },
               { m: "Mar", val: 1800, h: "70%" },
               { m: "Apr", val: 1650, h: "65%" },
               { m: "May", val: 2100, h: "85%", curr: true },
               { m: "Jun", val: 2400, h: "95%", proj: true },
             ].map((item, i) => (
               <div key={i} className="flex-1 flex flex-col justify-end items-center gap-4 h-full group">
                 <div 
                   className={cn(
                     "w-full rounded-t-2xl transition-all duration-700 ease-in-out relative",
                     item.curr ? "bg-terracotta shadow-[0_0_30px_rgba(var(--color-terracotta),0.3)]" : "bg-surface-container group-hover:bg-navy/10",
                     item.proj && "opacity-40 border-2 border-dashed border-navy/20 bg-transparent"
                   )}
                   style={{ height: item.h }}
                 >
                   {item.curr && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-navy text-white text-[10px] px-3 py-1.5 rounded-full font-black shadow-lg">
                        ${item.val}
                      </div>
                   )}
                 </div>
                 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">{item.m}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Quick Stats list */}
        <div className="space-y-6">
          <div className="p-8 bg-surface-container-high rounded-[2rem] border border-outline-variant/10 shadow-sm group hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-on-surface-variant mb-3 uppercase tracking-widest opacity-50">Total Earnings (YTD)</p>
            <p className="text-4xl font-headline font-black text-navy tracking-tighter italic leading-none">$12,480.00</p>
          </div>
          <div className="p-8 bg-tertiary-fixed rounded-[2rem] border border-tertiary/10 shadow-sm hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-on-tertiary-fixed-variant mb-3 uppercase tracking-widest opacity-50">Most Frequent Client</p>
            <p className="text-xl font-headline font-black text-on-tertiary-fixed tracking-tight">The Thompson Family</p>
          </div>
          <div className="p-8 bg-white border border-outline-variant/20 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-all">
            <p className="text-[10px] font-black text-on-surface-variant mb-3 uppercase tracking-widest opacity-50">Avg. Weekly Pay</p>
            <p className="text-2xl font-headline font-black text-navy tracking-tighter italic leading-none">$520.00</p>
          </div>
        </div>
      </section>

      {/* Transaction History Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline text-3xl font-black text-navy tracking-tight italic">Transaction History</h3>
            <p className="text-on-surface-variant text-sm font-medium opacity-60">Full audit trail of your earnings and payouts</p>
          </div>
          <button className="text-[10px] font-black text-navy flex items-center gap-2 hover:bg-navy/5 px-4 py-2 rounded-xl border border-navy/10 uppercase tracking-widest transition-all">
            Download CSV <MaterialIcon name="download" className="text-sm" />
          </button>
        </div>

        <div className="bg-white border border-outline-variant/40 rounded-[2.5rem] overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/20">
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Date</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Description</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {wallet?.transactions?.length > 0 ? (
                wallet.transactions.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-surface-container-low/30 transition-all group">
                    <td className="px-10 py-6 text-sm font-bold text-navy whitespace-nowrap">
                      {format(new Date(txn.createdAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm shadow-black/5",
                          txn.type === "earning" ? "bg-green-50 text-green-700" : "bg-navy text-white"
                        )}>
                          {txn.type === "earning" ? <MaterialIcon name="arrow_downward" /> : <MaterialIcon name="paid" />}
                        </div>
                        <div>
                          <p className="text-sm font-black text-navy leading-tight mb-1">{txn.description}</p>
                          <p className="text-[10px] text-on-surface-variant/50 font-bold uppercase tracking-widest">Account Transfer</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={cn(
                        "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm",
                        txn.status === "completed" ? "bg-green-100/50 text-green-700" 
                        : txn.status === "pending" ? "bg-orange-100/50 text-orange-700" 
                        : "bg-red-50 text-red-500"
                      )}>
                        {txn.status}
                      </span>
                    </td>
                    <td className={cn(
                      "px-10 py-6 text-right font-headline font-black text-lg tracking-tighter",
                      txn.type === "earning" ? "text-green-600" : "text-navy opacity-60"
                    )}>
                      {txn.type === "earning" ? "+" : "-"}${ (txn.amount / 100).toFixed(2) }
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan={4} className="py-24 text-center">
                      <div className="w-16 h-16 bg-navy/5 rounded-full flex items-center justify-center mx-auto mb-6 opacity-40">
                        <MaterialIcon name="receipt_long" className="text-3xl text-navy" />
                      </div>
                      <p className="font-headline font-black text-navy italic text-xl opacity-40">No transactions recorded yet</p>
                      <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest opacity-20 mt-2">Financial records will appear here as you earn</p>
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
