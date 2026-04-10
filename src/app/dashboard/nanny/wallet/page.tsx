"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { getWalletData, getPayoutMethod, getStripeConnectOnboarding } from "./actions";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<any>(null);
  const [payoutMethod, setPayoutMethod] = useState<any>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"earnings" | "payouts">("earnings");
  const [earningsLimit, setEarningsLimit] = useState(6);
  const [payoutsLimit, setPayoutsLimit] = useState(6);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawSuccessAmount, setWithdrawSuccessAmount] = useState<number | null>(null);

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40 animate-pulse font-headline">Securing Vault...</p>
      </div>
    );
  }

  const balance = (wallet?.balance || 0) / 100;
  const processing = (wallet?.processingBalance || 0) / 100;
  const tax = (wallet?.taxReserve || 0) / 100;
  const locked = (wallet?.pendingBalance || 0) / 100;
  const stats = wallet?.stats || {};

  const isFriday = new Date().getDay() === 5;


  const handleWithdraw = async () => {
    const amountCents = Math.round(parseFloat(withdrawAmount) * 100);
    if (isNaN(amountCents) || amountCents < 5000) return;

    setWithdrawLoading(true);
    try {
      const { withdrawFunds } = (await import("./actions"));
      const result = await withdrawFunds(amountCents);
      if (result.success) {
        setShowWithdrawModal(false);
        setWithdrawAmount("");
        setWithdrawSuccessAmount(amountCents / 100);
        
        // Trigger celebratory confetti
        const confetti = (await import("canvas-confetti")).default;
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#6f3800", "#ffb870", "#ffffff"]
        });

        // Refresh data
        const wData = await (await import("./actions")).getWalletData();
        setWallet(wData);
      }
    } catch (error: any) {
      alert(error.message || "Withdrawal failed");
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <main className="pt-12 pb-24 px-6 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      
      {/* Dashboard Header Context */}
      <header className="text-center space-y-6">
        <div className="space-y-2">
            <h1 className="text-4xl font-extrabold font-headline tracking-tighter text-primary-container">Financial Hub</h1>
            <p className="text-on-surface-variant font-medium">Your wallet is healthy. You're currently serving {stats.activeRetainers} families.</p>
        </div>

        {/* TOP: Stripe Connection Status (Always visible) */}
        <div className="flex justify-center">
            {payoutMethod ? (
                <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm animate-in zoom-in duration-500">
                    <MaterialIcon name="verified" className="text-emerald-600" fill />
                    <div className="text-left">
                        <p className="text-[9px] font-black text-emerald-800 uppercase tracking-[0.2em] italic leading-none mb-1">Stripe Connected</p>
                        <p className="text-[11px] font-bold text-emerald-600/60 uppercase">{payoutMethod.bankName} •••• {payoutMethod.last4}</p>
                    </div>
                    <div className="h-6 w-px bg-emerald-200/50 mx-2"></div>
                    <button onClick={handleConnectBank} className="text-[8px] font-black uppercase tracking-widest text-emerald-600/40 hover:text-emerald-600 transition-colors">Edit</button>
                </div>
            ) : (
                <button 
                    onClick={handleConnectBank}
                    disabled={onboardingLoading}
                    className="px-8 py-4 bg-surface-container-high text-primary-container rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-primary-container hover:text-white transition-all italic flex items-center gap-3 shadow-sm active:scale-95 group"
                >
                    <MaterialIcon name="account_balance" className="group-hover:animate-bounce" fill />
                    Link Bank via Stripe Express
                </button>
            )}
        </div>
      </header>

      {/* Credit Card Section */}
      <section className="relative flex flex-col items-center">
        {/* Premium Card Layout */}
        <div className="w-full max-w-md aspect-[1.6/1] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl mesh-gradient ring-1 ring-white/10 group">
          <div className="absolute top-0 right-0 p-10 opacity-20 group-hover:scale-110 transition-transform duration-700">
            <MaterialIcon name="account_balance_wallet" className="text-7xl" fill />
          </div>
          
          <div className="h-full flex flex-col justify-between relative z-10">
            <div>
              <p className="text-on-primary-container font-label uppercase tracking-[0.2em] text-[10px] font-bold mb-1 opacity-70 italic">Available Balance</p>
              <h2 className="text-6xl font-extrabold tracking-tight font-headline italic">
                ${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-on-primary-container text-[10px] uppercase tracking-[0.25em] font-black italic mb-1 opacity-60">Elite Caregiver</p>
                <p className="text-sm font-bold tracking-[0.15em] uppercase italic">{wallet?.fullName || "Caregiver"}</p>
              </div>
              <div className="flex gap-2">
                <div className="w-12 h-8 bg-white/20 rounded-lg backdrop-blur-md border border-white/10 flex items-center justify-center">
                   <div className="w-3 h-3 rounded-full bg-secondary-container/40"></div>
                </div>
                <div className="w-12 h-8 bg-white/10 rounded-lg backdrop-blur-md border border-white/5"></div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-secondary-container/10 blur-[80px] rounded-full"></div>
        </div>

        {/* Triple Breakdown Modules */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm flex items-center gap-5 border border-outline-variant/10 hover:shadow-md transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-secondary-fixed/30 flex items-center justify-center text-on-secondary-container group-hover:scale-110 transition-transform">
              <MaterialIcon name="sync" className="text-3xl" fill />
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] italic">In Settlement (Processing)</p>
              <p className="text-2xl font-black text-on-surface font-headline italic tracking-tight">${processing.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm flex items-center gap-5 border border-outline-variant/10 hover:shadow-md transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-tertiary-fixed/30 flex items-center justify-center text-on-tertiary-fixed-variant group-hover:scale-110 transition-transform">
              <MaterialIcon name="lock" className="text-3xl" fill />
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.1em] italic">Locked in Escrow</p>
              <p className="text-2xl font-black text-on-surface font-headline italic tracking-tight">${locked.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm flex items-center gap-5 border border-outline-variant/10 hover:shadow-md transition-all group border-secondary/20">
            <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform">
              <MaterialIcon name="savings" className="text-3xl" fill />
            </div>
            <div>
              <p className="text-[10px] font-black text-secondary uppercase tracking-[0.1em] italic">Tax Reserve</p>
              <p className="text-2xl font-black text-on-surface font-headline italic tracking-tight">${tax.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <button 
            onClick={() => setShowWithdrawModal(true)}
            disabled={balance < 50}
            className={cn(
                "mt-12 px-12 py-5 bg-primary text-on-primary rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs hover:shadow-2xl hover:scale-105 transition-all active:scale-95 flex items-center gap-3 italic",
                balance < 50 && "opacity-30 grayscale cursor-not-allowed"
            )}
        >
            <span>Withdraw Funds</span>
            <MaterialIcon name="payments" className="text-lg" fill />
        </button>
      </section>

      {/* Yearly Performance Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-black font-headline text-primary-container italic tracking-tight leading-none">Yearly Performance</h3>
          <div className="px-5 py-2 bg-surface-container-high rounded-full text-[10px] font-black text-on-surface-variant uppercase tracking-widest italic">{new Date().getFullYear()} REPORT</div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-surface-container-low p-10 rounded-[2.5rem] relative overflow-hidden group border border-outline-variant/5">
            <div className="relative z-10 space-y-4">
              <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs italic">Retainer Income (YTD)</p>
              <h4 className="text-5xl font-black text-primary-container font-headline italic tracking-tighter">${stats.ytdRetainer?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[11px] uppercase tracking-wider italic">
                <MaterialIcon name="verified_user" className="text-sm" fill />
                <span>Steady Stream Performance</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
              <MaterialIcon name="calendar_today" className="text-[160px]" fill />
            </div>
          </div>

          <div className="bg-secondary-fixed/20 p-10 rounded-[2.5rem] relative overflow-hidden group border border-secondary/10">
            <div className="relative z-10 space-y-4">
              <p className="text-on-secondary-container font-bold uppercase tracking-widest text-xs italic">Hourly Yield (YTD)</p>
              <h4 className="text-5xl font-black text-on-secondary-container font-headline italic tracking-tighter">${stats.ytdHourly?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h4>
              <div className="flex items-center gap-2 text-on-secondary-fixed-variant font-black text-[11px] uppercase tracking-wider italic">
                <MaterialIcon name="bolt" className="text-sm" fill />
                <span>Productivity Peak</span>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-6 transition-all duration-700">
              <MaterialIcon name="payments" className="text-[160px]" fill />
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Ledger Section */}
      <section className="bg-surface-container-lowest rounded-[3rem] p-10 md:p-14 shadow-sm border border-outline-variant/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <h3 className="text-3xl font-black font-headline text-primary-container italic tracking-tight leading-none">Transaction Ledger</h3>
            <p className="text-on-surface-variant mt-3 font-medium italic">Showing {activeTab === "earnings" ? "Completed Earnings" : "Successful Payouts"} only.</p>
          </div>
          
          <div className="inline-flex bg-surface-container p-2 rounded-[1.5rem] ring-1 ring-outline-variant/10">
            <button 
                onClick={() => setActiveTab("earnings")}
                className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all",
                    activeTab === "earnings" ? "bg-white text-primary-container shadow-md" : "text-on-surface-variant hover:text-primary-container"
                )}
            >
                Earnings
            </button>
            <button 
                onClick={() => setActiveTab("payouts")}
                className={cn(
                    "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all",
                    activeTab === "payouts" ? "bg-white text-primary-container shadow-md" : "text-on-surface-variant hover:text-primary-container"
                )}
            >
                Payouts
            </button>
          </div>
        </div>

        <div className="space-y-4">
            <AnimatePresence mode="wait">
                {activeTab === "earnings" ? (
                    <motion.div key="ledger-earnings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {wallet?.inboundPayments?.length > 0 ? (
                          <>
                            {wallet.inboundPayments.slice(0, earningsLimit).map((p: any) => (
                              <div key={p.id} className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant/5 transition-all">
                                <button 
                                  onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                                  className="w-full flex items-center justify-between p-6 text-left active:bg-surface-container transition-colors group"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 asymmetric-clip overflow-hidden shadow-xl ring-4 ring-primary/5 group-hover:scale-105 transition-transform">
                                            {p.familyPhoto ? (
                                                <img src={p.familyPhoto} alt="Family" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-primary/5 flex items-center justify-center text-primary font-black text-2xl">
                                                    {p.family.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-xl text-primary-container font-headline italic tracking-tight">{p.family}</p>
                                            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest italic">{p.hiringMode} • {format(new Date(p.date), "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div className="text-right">
                                          <p className="text-2xl font-black text-primary-container font-headline italic tracking-tighter">+${p.amount.toFixed(2)}</p>
                                          <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Settled</p>
                                      </div>
                                      <MaterialIcon name={expandedId === p.id ? "expand_less" : "expand_more"} className="text-primary/20" />
                                    </div>
                                </button>
                                
                                <AnimatePresence>
                                  {expandedId === p.id && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="border-t border-dashed border-outline-variant/20 bg-emerald-50/20 px-10 py-8"
                                    >
                                      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                        <div className="space-y-1">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant italic">Work Session</p>
                                          <p className="text-sm font-bold text-primary-container">{p.hours} Hours Recorded</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant italic">Gross Invoice</p>
                                          <p className="text-sm font-bold text-primary-container">${p.totalPaidByParent.toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant italic">Tax Set-aside (25%)</p>
                                          <p className="text-sm font-bold text-secondary italic">-${(p.amount * 0.25).toFixed(2)}</p>
                                        </div>
                                        <div className="space-y-1">
                                          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant italic">Platform Fee</p>
                                          <p className="text-sm font-bold text-on-surface-variant">Insurance Included</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                            {wallet.inboundPayments.length > earningsLimit && (
                              <button 
                                onClick={() => setEarningsLimit(l => l + 6)}
                                className="w-full py-5 bg-surface-container-high/50 rounded-3xl border-2 border-dashed border-outline-variant/10 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant hover:bg-surface-container transition-all italic mt-4"
                              >
                                Load more earnings
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-20 opacity-20 italic font-black uppercase tracking-widest text-[10px]">No completed earnings found</div>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="ledger-payouts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                        {wallet?.transactions?.filter((t: any) => t.type === "withdrawal")?.length > 0 ? (
                           <>
                            {wallet.transactions.filter((t: any) => t.type === "withdrawal").slice(0, payoutsLimit).map((t: any) => (
                              <div key={t.id} className="bg-surface-container-low rounded-[2rem] overflow-hidden border border-outline-variant/5 transition-all">
                                <button 
                                  onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                                  className="w-full flex items-center justify-between p-6 text-left active:bg-surface-container transition-colors group"
                                >
                                    <div className="flex items-center gap-8">
                                        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-primary-container/40 group-hover:scale-105 transition-transform">
                                            <MaterialIcon name="account_balance" className="text-3xl" fill />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-black text-xl text-primary-container font-headline italic tracking-tight">External Transfer</p>
                                            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest italic">{format(new Date(t.createdAt), "MMM d, yyyy")}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                      <div className="text-right">
                                          <p className="text-2xl font-black text-primary-container font-headline italic tracking-tighter">-${(t.amount / 100).toFixed(2)}</p>
                                          <p className={cn(
                                              "text-[9px] font-black uppercase tracking-widest italic",
                                              t.status === "completed" ? "text-emerald-600" : "text-secondary"
                                          )}>
                                              {t.status === "completed" ? "Success" : t.status === "pending" ? "Processing" : t.status}
                                          </p>
                                      </div>
                                      <MaterialIcon name={expandedId === t.id ? "expand_less" : "expand_more"} className="text-primary/20" />
                                    </div>
                                </button>

                                <AnimatePresence>
                                  {expandedId === t.id && (
                                    <motion.div 
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="border-t border-dashed border-outline-variant/20 bg-secondary/5 px-10 py-8"
                                    >
                                      <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="font-black uppercase tracking-widest text-on-surface-variant italic">Reference ID</span>
                                          <span className="font-mono text-primary/60">{t.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                          <span className="font-black uppercase tracking-widest text-on-surface-variant italic">Settlement Log</span>
                                          <span className="font-bold text-primary-container italic">{t.description}</span>
                                        </div>
                                        {t.stripeTransferId && (
                                          <div className="flex justify-between items-center text-xs">
                                            <span className="font-black uppercase tracking-widest text-on-surface-variant italic">Stripe Ref</span>
                                            <span className="font-mono text-secondary">{t.stripeTransferId}</span>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                            {wallet.transactions.filter((t: any) => t.type === "withdrawal").length > payoutsLimit && (
                              <button 
                                onClick={() => setPayoutsLimit(l => l + 6)}
                                className="w-full py-5 bg-surface-container-high/50 rounded-3xl border-2 border-dashed border-outline-variant/10 text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant hover:bg-surface-container transition-all italic mt-4"
                              >
                                Load more payouts
                              </button>
                            )}
                          </>
                        ) : (
                          <div className="text-center py-20 opacity-20 italic font-black uppercase tracking-widest text-[10px]">No payout history found</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </section>

      {/* WITHDRAWAL MODAL */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdrawModal(false)}
              className="absolute inset-0 bg-primary/40 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-surface rounded-[3rem] shadow-2xl overflow-hidden border border-outline-variant/10"
            >
              <div className="p-10 space-y-8">
                <header className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black font-headline text-primary-container italic tracking-tight">Withdraw Funds</h3>
                    <p className="text-xs font-medium text-on-surface-variant/60">Minimum withdrawal: $50.00</p>
                  </div>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                    <MaterialIcon name="close" />
                  </button>
                </header>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 italic ml-2">Request Amount (USD)</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl font-black text-primary font-headline italic">$</span>
                      <input 
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full bg-surface-container-low border-none rounded-2xl py-6 pl-12 pr-6 text-3xl font-black text-primary font-headline italic focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-primary/10"
                      />
                    </div>
                  </div>

                  {/* Smart Fee Intelligence */}
                  <div className="bg-surface-container-high/50 rounded-2xl p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Platform Policy</p>
                      <div className="flex items-center gap-2">
                         <span className={cn("w-1.5 h-1.5 rounded-full", isFriday ? "bg-emerald-500" : "bg-secondary")}></span>
                         <p className={cn("text-[9px] font-black uppercase tracking-widest italic", isFriday ? "text-emerald-600" : "text-secondary")}>
                            {isFriday ? "Free Payday Friday" : "Standard 1.5% Fee"}
                         </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 border-t border-outline-variant/10 pt-4">
                       <div className="flex justify-between text-xs font-bold text-on-surface-variant">
                         <span>Requested Amount</span>
                         <span>${parseFloat(withdrawAmount || "0").toFixed(2)}</span>
                       </div>
                       {!isFriday && (
                         <div className="flex justify-between text-xs font-bold text-secondary italic">
                           <span>Instant Transfer Fee (1.5%)</span>
                           <span>-${(parseFloat(withdrawAmount || "0") * 0.015).toFixed(2)}</span>
                         </div>
                       )}
                       <div className="flex justify-between text-lg font-black text-primary-container italic pt-2 border-t border-outline-variant/10">
                         <span>Approx. to Bank</span>
                         <span>${(parseFloat(withdrawAmount || "0") * (isFriday ? 1 : 0.985)).toFixed(2)}</span>
                       </div>
                    </div>

                    {!isFriday && (
                      <div className="mt-4 flex gap-3 p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                        <MaterialIcon name="info" className="text-secondary text-sm" fill />
                        <p className="text-[10px] font-medium text-secondary/80 leading-tight italic">
                          Wait until Friday to avoid the 1.5% fee. Standard transfers are processed instantly today for the convenience fee.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < 50 || parseFloat(withdrawAmount) > balance}
                  className={cn(
                    "w-full py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-2xl transition-all shadow-xl shadow-primary/20 active:scale-95 flex items-center justify-center gap-3 italic",
                    (withdrawLoading || !withdrawAmount || parseFloat(withdrawAmount) < 50 || parseFloat(withdrawAmount) > balance) && "opacity-30 grayscale cursor-not-allowed"
                  )}
                >
                  {withdrawLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Confirm & Transfer</span>
                      <MaterialIcon name="rocket_launch" className="text-lg" fill />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WITHDRAWAL SUCCESS MODAL */}
      <AnimatePresence>
        {withdrawSuccessAmount !== null && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setWithdrawSuccessAmount(null)}
              className="absolute inset-0 bg-emerald-900/40 backdrop-blur-xl"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              className="relative w-full max-w-md bg-white rounded-[3.5rem] shadow-2xl overflow-hidden text-center p-12 space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <MaterialIcon name="check_circle" className="text-5xl text-emerald-600" fill />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-4xl font-black font-headline text-primary-container italic tracking-tighter">Funds Sent!</h3>
                <p className="text-on-surface-variant font-medium italic">Your transfer is being processed by the bank.</p>
              </div>

              <div className="bg-surface-container-low rounded-3xl p-8 border border-emerald-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-800/40 italic mb-2">Net Transfer Value</p>
                <p className="text-5xl font-black text-emerald-600 font-headline italic tracking-tighter">
                  ${withdrawSuccessAmount.toFixed(2)}
                </p>
              </div>

              <button 
                onClick={() => setWithdrawSuccessAmount(null)}
                className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:shadow-xl hover:bg-emerald-700 transition-all active:scale-95 italic"
              >
                Return to Wallet
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="text-center pb-12 opacity-40">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant italic">Nanny Wallet Portfolio © {new Date().getFullYear()} • Securely Managed for {stats.activeRetainers} Families</p>
      </section>
    </main>
  );
}

