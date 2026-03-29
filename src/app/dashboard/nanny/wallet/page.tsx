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
  const [expandedPaymentId, setExpandedPaymentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"inbound" | "withdrawals">("inbound");

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
    <div className="max-w-7xl mx-auto px-2 py-8">
      <style jsx global>{`
        .asymmetric-clip {
          border-top-left-radius: 1.5rem;
          border-bottom-right-radius: 1.5rem;
          border-top-right-radius: 0.75rem;
          border-bottom-left-radius: 0.75rem;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Content Column */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Wallet Header Section */}
          <section className="relative overflow-hidden bg-primary p-10 rounded-3xl shadow-2xl text-white">
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <span className="text-blue-300 font-label uppercase tracking-widest text-[10px] font-black italic">Available Capital</span>
                <h1 className="text-6xl font-black font-headline tracking-tighter italic">Total Wallet</h1>
                <div className="flex items-baseline gap-2 mt-4">
                  <span className="text-7xl font-black text-secondary tracking-tighter italic">
                    ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-blue-200 font-black uppercase tracking-widest text-[10px] italic">USD Liquid</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link 
                  href="/dashboard/nanny/wallet/withdraw"
                  className={cn(
                    "bg-gradient-to-r from-secondary-container to-secondary py-5 px-10 rounded-2xl font-headline font-black uppercase tracking-widest text-[11px] text-on-secondary shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 italic",
                    balance <= 0 && "opacity-50 pointer-events-none"
                  )}
                >
                  <MaterialIcon name="account_balance_wallet" fill />
                  Initiate Withdrawal
                </Link>
                <p className="text-[9px] font-black uppercase tracking-widest text-center opacity-40 italic">Min. Withdrawal $50.00</p>
              </div>
            </div>
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          </section>

          {/* Action Required Banner if bank not linked */}
          {!payoutMethod && (
            <div className="bg-orange-50 border-2 border-orange-200 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-1000">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <MaterialIcon name="account_balance" className="text-4xl" fill />
                </div>
                <div>
                  <h3 className="font-extrabold text-orange-900 text-xl font-headline italic leading-tight">Payout Target Missing</h3>
                  <p className="text-sm text-orange-700/70 font-medium italic">You must link a validated bank account before initiating transfers.</p>
                </div>
              </div>
              <button 
                onClick={handleConnectBank}
                disabled={onboardingLoading}
                className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-orange-700 transition-all flex items-center gap-3 whitespace-nowrap italic shadow-xl shadow-orange-600/20"
              >
                {onboardingLoading ? "Redirecting to Stripe..." : "Link Bank Now"}
                <MaterialIcon name="arrow_forward" className="text-sm" />
              </button>
            </div>
          )}

          {/* Tab Navigation Area */}
          <section className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex space-x-10 border-b border-outline-variant/10">
              <button 
                onClick={() => setActiveTab("inbound")}
                className={cn(
                  "pb-6 font-headline font-black text-xl italic relative transition-all",
                  activeTab === "inbound" ? "text-primary px-2" : "text-on-surface-variant/40 hover:text-primary"
                )}
              >
                Inbound Earnings
                {activeTab === "inbound" && <span className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(var(--primary-rgb),0.2)]"></span>}
              </button>
              <button 
                onClick={() => setActiveTab("withdrawals")}
                className={cn(
                  "pb-6 font-headline font-black text-xl italic relative transition-all",
                  activeTab === "withdrawals" ? "text-primary px-2" : "text-on-surface-variant/40 hover:text-primary"
                )}
              >
                Withdrawal History
                {activeTab === "withdrawals" && <span className="absolute bottom-0 left-0 w-full h-1.5 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(var(--primary-rgb),0.2)]"></span>}
              </button>
            </div>

            {/* Tabbed Content Area */}
            {activeTab === "inbound" ? (
              <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
                {wallet?.inboundPayments?.length > 0 ? (
                  wallet.inboundPayments.map((p: any) => (
                    <div key={p.id} className="space-y-4">
                      <div 
                        className={cn(
                          "bg-white p-8 rounded-[2.5rem] flex flex-col md:flex-row md:items-center justify-between gap-8 transition-all hover:shadow-xl border border-outline-variant/5 relative group overflow-hidden",
                          p.status === "Pending" && "bg-surface-container-low/30"
                        )}
                      >
                        <div className="flex items-center gap-6 relative z-10">
                          {p.familyPhoto ? (
                            <img src={p.familyPhoto} alt={p.family} className="w-20 h-20 asymmetric-clip object-cover bg-slate-100 shadow-lg border-2 border-white" />
                          ) : (
                            <div className="w-20 h-20 asymmetric-clip bg-primary/5 flex items-center justify-center text-primary font-black text-2xl shadow-inner border border-primary/10">
                              {p.family.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h3 className="font-black text-primary text-2xl font-headline italic tracking-tighter leading-none">{p.family}</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-3">
                              {format(new Date(p.date), "MMM d, yyyy")} • {p.hours}h Shift
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 relative z-10">
                          <div className="text-right">
                            <p className="text-3xl font-black text-primary font-headline italic tracking-tighter">${p.amount.toFixed(2)}</p>
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg mt-2 inline-block shadow-sm italic",
                              p.status === "Paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-primary/5 text-primary border border-primary/10"
                            )}>
                              {p.status}
                            </span>
                          </div>
                          <button 
                            onClick={() => setExpandedPaymentId(expandedPaymentId === p.id ? null : p.id)}
                            className="w-12 h-12 rounded-2xl bg-surface-container-low hover:bg-primary/5 flex items-center justify-center transition-all text-on-surface-variant group-hover:scale-110 active:scale-95 shadow-sm"
                          >
                            <MaterialIcon name={expandedPaymentId === p.id ? "expand_less" : "expand_more"} />
                          </button>
                        </div>
                        <MaterialIcon name="account_balance_wallet" className="absolute -bottom-6 -right-6 text-9xl opacity-[0.02] rotate-12" fill />
                      </div>

                      {/* Details Expanded */}
                      {expandedPaymentId === p.id && (
                        <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10 animate-in slide-in-from-top-4 duration-500">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                            <div>
                              <p className="text-[9px] uppercase font-black text-primary tracking-widest mb-3 opacity-40">Contract Rate</p>
                              <p className="font-black text-primary text-lg italic tracking-tight">${p.rate.toFixed(2)} / hr</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-black text-primary tracking-widest mb-3 opacity-40">Duration</p>
                              <p className="font-black text-primary text-lg italic tracking-tight">{p.hours}h Shift</p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-black text-secondary-fixed-variant tracking-widest mb-3 opacity-40">Overtime Surge</p>
                              <p className="font-black text-secondary italic tracking-tight">
                                {p.overtime > 0 ? `+$${p.overtime.toFixed(2)}` : "$0.00"}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] uppercase font-black text-primary tracking-widest mb-3 opacity-40">Total Settled</p>
                              <p className="font-black text-primary text-2xl font-headline italic underline underline-offset-8 decoration-secondary decoration-4 tracking-tighter">
                                ${(p.amount + p.overtime).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-outline-variant/20 italic opacity-40">
                    <MaterialIcon name="payments" className="text-6xl text-outline-variant mb-6" />
                    <p className="font-headline font-black text-2xl text-primary">Genesis Stage</p>
                    <p className="text-sm font-medium">Your financial history starts once your first booking concludes.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                {wallet?.transactions?.filter((t: any) => t.type === "withdrawal").length > 0 ? (
                  wallet.transactions.filter((t: any) => t.type === "withdrawal").map((t: any) => (
                    <div key={t.id} className="bg-white p-8 rounded-[2.5rem] flex items-center justify-between border border-outline-variant/10 shadow-sm relative overflow-hidden group">
                       <div className="flex items-center gap-6 relative z-10">
                          <div className={cn(
                            "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner",
                            t.status === "completed" ? "bg-emerald-50 text-emerald-600" :
                            t.status === "pending" ? "bg-orange-50 text-orange-600" :
                            "bg-error/5 text-error"
                          )}>
                             <MaterialIcon name={t.status === "completed" ? "done_all" : t.status === "pending" ? "hourglass_top" : "block"} className="text-3xl" />
                          </div>
                          <div>
                             <h4 className="font-black text-xl text-primary font-headline italic leading-none tracking-tight">Withdrawal Dispatch</h4>
                             <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-3 italic">
                               Ref: {t.id} • {format(new Date(t.createdAt), "MMM d, yyyy")}
                             </p>
                          </div>
                       </div>
                       <div className="text-right relative z-10">
                          <p className="text-2xl font-black text-primary font-headline italic tracking-tighter">-${(t.amount / 100).toFixed(2)}</p>
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] italic shadow-sm mt-3 inline-block",
                            t.status === "completed" ? "bg-emerald-700 text-white" :
                            t.status === "pending" ? "bg-orange-50 text-orange-700 border border-orange-100" :
                            "bg-error/5 text-error border border-error/10"
                          )}>
                            {t.status === "pending" ? "Awaiting Admin Approval" : t.status}
                          </span>
                       </div>
                       <MaterialIcon name="account_balance" className="absolute -bottom-6 -right-6 text-9xl opacity-[0.01] -rotate-12" fill />
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-outline-variant/20 italic opacity-40">
                    <MaterialIcon name="account_balance" className="text-6xl text-outline-variant mb-6" />
                    <p className="font-headline font-black text-2xl text-primary">No Transfers Yet</p>
                    <p className="text-sm font-medium">Initiate a withdrawal to see your transfer requests here.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Column */}
        <aside className="lg:col-span-4 space-y-8">
          
          {/* Payout Settings Card */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-outline-variant/10">
            <h2 className="text-2xl font-bold text-primary mb-6 font-headline">Payout Settings</h2>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 opacity-60">Linked Bank Account</label>
                {payoutMethod ? (
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 group">
                    <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
                      <MaterialIcon name="account_balance" className="text-xl" fill />
                    </div>
                    <div>
                      <p className="font-bold text-primary leading-tight">{payoutMethod.bankName}</p>
                      <p className="text-xs text-on-surface-variant tracking-widest opacity-60">•••• {payoutMethod.last4}</p>
                    </div>
                    <button 
                      onClick={handleConnectBank}
                      disabled={onboardingLoading}
                      className="ml-auto text-primary opacity-40 group-hover:opacity-100 transition-opacity"
                    >
                      <MaterialIcon name="edit" className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-center">
                    <p className="text-[10px] font-bold text-orange-800 uppercase tracking-widest mb-2">Not Connected</p>
                    <button 
                      onClick={handleConnectBank}
                      disabled={onboardingLoading}
                      className="text-xs font-black text-orange-600 underline"
                    >
                      Connect Stripe Express
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3 opacity-60">Payout Frequency</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-primary bg-primary/5 cursor-pointer border-2">
                    <div className="w-5 h-5 rounded-full border-4 border-primary bg-white"></div>
                    <span className="font-bold text-primary text-sm">Instant (Manual)</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-xl border border-outline-variant/20 hover:bg-surface-container-low cursor-pointer transition-colors opacity-50 grayscale">
                    <div className="w-5 h-5 rounded-full border-2 border-outline-variant bg-white"></div>
                    <span className="font-medium text-on-surface-variant text-sm">Weekly Auto-Pay</span>
                  </label>
                </div>
              </div>

              <button 
                onClick={handleConnectBank}
                disabled={onboardingLoading}
                className="w-full py-4 rounded-xl border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all text-xs uppercase tracking-widest"
              >
                {onboardingLoading ? "Loading..." : "Manage All Methods"}
              </button>
            </div>
          </div>

          {/* Fast-Track Payouts Info */}
          <div className="bg-tertiary-container text-on-tertiary-container p-8 rounded-3xl relative overflow-hidden group">
            <div className="relative z-10">
              <MaterialIcon name="verified_user" className="text-4xl mb-4 text-secondary-container" fill />
              <h3 className="text-xl font-bold mb-2 font-headline">Fast-Track Payouts</h3>
              <p className="text-sm opacity-90 leading-relaxed font-medium">
                Identity verification is 100% complete. You are eligible for instant withdrawals 24/7 with zero hold times.
              </p>
            </div>
            {/* Abstract background icon */}
            <div className="absolute -bottom-4 -right-4 text-on-tertiary-container opacity-5 group-hover:scale-110 transition-transform">
              <MaterialIcon name="savings" className="text-9xl" />
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}
