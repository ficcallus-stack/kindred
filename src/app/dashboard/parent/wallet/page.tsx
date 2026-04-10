"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { getWalletData } from "./actions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PlatformCreditsLedger() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const { showToast } = useToast();
  
  const ITEMS_PER_PAGE = 7;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const walletData = await getWalletData();
      setData(walletData);
    } catch (error) {
      console.error(error);
      showToast("Failed to load financial data", "error");
    } finally {
      setLoading(false);
    }
  };

  const redeemValueStr = data ? (data.platformCredits / 100).toFixed(2) : "0.00";

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 p-6 md:p-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h1 className="text-5xl font-black font-headline text-primary tracking-tighter italic mb-4">Billing & Credits</h1>
          <p className="text-on-surface-variant font-medium opacity-70 max-w-xl leading-relaxed text-lg">
            Manage your hiring escrows, subscriptions, and platform credits all in one unified ledger.
          </p>
        </div>
        <Link href="/dashboard/parent/bookings">
          <button className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            Make a Booking
          </button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-12 gap-10">
        
        {/* 3D Platform Credits Card */}
        <div className="lg:col-span-5 relative group perspective-[1000px]">
          <div className="w-full h-full min-h-[380px] bg-gradient-to-br from-indigo-900 via-purple-900 to-primary rounded-[3rem] p-10 text-white relative shadow-2xl transition-transform duration-700 transform-gpu group-hover:[transform:rotateX(5deg)_rotateY(-5deg)] shadow-primary/40 border border-white/10 overflow-hidden">
            {/* Holographic Overlays */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700"></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 text-purple-300 font-black uppercase tracking-[0.3em] text-[10px] mb-2">
                    <MaterialIcon name="diamond" className="text-sm" fill />
                    Platform Credits
                  </div>
                  <h2 className="text-7xl font-black font-headline tracking-tighter italic drop-shadow-2xl">
                    {data?.platformCredits?.toLocaleString() || 0}
                  </h2>
                </div>
                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-inner">
                   <MaterialIcon name="layers" className="text-3xl" />
                </div>
              </div>

              <div className="space-y-6 mt-8">
                <div className="bg-black/20 p-5 rounded-[2rem] border border-white/10 backdrop-blur-md flex items-center justify-between">
                   <div>
                      <p className="text-[10px] text-white/60 font-black uppercase tracking-widest mb-1">Status</p>
                      <p className="text-xl font-black font-headline italic tracking-tight text-white/90">
                         Accumulating
                      </p>
                   </div>
                   <button disabled className="px-6 py-4 bg-white/10 text-white/50 rounded-xl font-black uppercase tracking-widest text-[10px] transition-colors shadow-inner cursor-not-allowed">
                      Redeem (Coming Soon)
                   </button>
                </div>
                
                <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest flex items-start gap-2 leading-relaxed">
                  <MaterialIcon name="info" className="text-xs shrink-0" />
                  Credits automatically accrue from escrow. 15 credits are generated for every $1 spent booking top-tier talent.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Stats */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-outline-variant/10 flex flex-col justify-between">
             <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <MaterialIcon name="verified_user" className="text-2xl" />
             </div>
             <div>
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] mb-2 opacity-50">Kindred Elite Status</p>
                <div className="flex items-end justify-between">
                  <p className="text-3xl font-black font-headline italic tracking-tighter text-primary">
                    {data?.isPremium ? "Active" : "Inactive"}
                  </p>
                  {data?.isPremium ? (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">Paid</span>
                  ) : (
                    <Link href="/pricing" className="text-[10px] font-black uppercase text-secondary tracking-widest hover:underline">Upgrade</Link>
                  )}
                </div>
             </div>
           </div>

           <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-outline-variant/10 flex flex-col justify-between relative overflow-hidden">
             <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 relative z-10">
                <MaterialIcon name="payments" className="text-2xl" />
             </div>
             <div className="relative z-10">
                <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-[0.2em] mb-2 opacity-50">Total Hiring Spend</p>
                <p className="text-4xl font-black font-headline italic tracking-tighter text-primary">
                  ${data?.stats?.totalSpent?.toFixed(2)}
                </p>
             </div>
             <MaterialIcon name="trending_up" className="absolute -bottom-10 -right-4 text-[120px] text-green-50 z-0 opacity-50" />
           </div>

           <div className="sm:col-span-2 bg-surface text-on-surface rounded-[3rem] p-8 shadow-inner border border-outline-variant/5">
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <div>
                 <h3 className="text-lg font-black font-headline italic mb-1">Help Another Family Find Care</h3>
                 <p className="text-sm font-medium opacity-60">Gift a friend 5,000 platform credits towards their first premium hire. We'll credit your account as well!</p>
               </div>
               <Link href="/dashboard/parent/referrals" className="shrink-0 w-full sm:w-auto">
                 <button className="w-full px-6 py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-105 transition-all">
                   Share Invite
                 </button>
               </Link>
             </div>
           </div>
        </div>

      </div>

      {/* Unified Transaction Ledger */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-outline-variant/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
          <div>
            <h3 className="text-3xl font-black font-headline text-primary tracking-tighter italic mb-2">Ledger Details</h3>
            <p className="text-sm font-medium text-on-surface-variant opacity-60">A unified history of your bookings, rewards, and subscriptions.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-6 py-3 bg-surface-container-low text-primary rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors flex items-center gap-2 border border-outline-variant/10">
              <MaterialIcon name="download" className="text-sm" /> CSV
            </button>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
          {["All", "Confirmed", "Pending", "Failed"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
              className={cn(
                "px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all",
                activeTab === tab 
                  ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                  : "text-slate-400 hover:text-primary hover:bg-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {(() => {
            const filteredTransactions = (data?.transactions || []).filter((txn: any) => {
              if (activeTab === "All") return true;
              if (activeTab === "Confirmed") return ["completed", "confirmed", "paid"].includes(txn.status.toLowerCase());
              if (activeTab === "Pending") return ["pending", "authorized"].includes(txn.status.toLowerCase());
              if (activeTab === "Failed") return ["failed", "cancelled"].includes(txn.status.toLowerCase());
              return true;
            });

            const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
            const paginatedTransactions = filteredTransactions.slice(
              (currentPage - 1) * ITEMS_PER_PAGE,
              currentPage * ITEMS_PER_PAGE
            );

            if (paginatedTransactions.length === 0) {
              return (
                <div className="py-24 text-center space-y-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <MaterialIcon name="receipt_long" className="text-4xl text-slate-300" />
                  </div>
                  <div>
                     <p className="text-primary font-black font-headline italic text-2xl mb-2">Clean Slate</p>
                     <p className="text-slate-400 font-bold max-w-sm mx-auto">No {activeTab.toLowerCase()} transactions found. Post a job to start earning credits!</p>
                  </div>
                </div>
              );
            }

            return (
              <div className="space-y-2">
                {paginatedTransactions.map((txn: any, idx: number) => (
                  <motion.div 
                    key={txn.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={cn(
                      "flex flex-col border border-transparent transition-all overflow-hidden",
                      expandedId === txn.id ? "bg-slate-50/80 rounded-[2.5rem] border-slate-100 shadow-sm mb-4" : "rounded-[2rem] hover:bg-slate-50/50 hover:border-slate-100 group mb-1"
                    )}
                  >
                    <button 
                      onClick={() => setExpandedId(expandedId === txn.id ? null : txn.id)}
                      className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4 text-left"
                    >
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner transition-transform group-hover:scale-110",
                          txn.type === 'earning' && 'bg-purple-50 text-purple-600',
                          txn.type === 'escrow' && 'bg-blue-50 text-blue-600',
                          txn.type === 'subscription' && 'bg-amber-50 text-amber-600',
                          txn.type === 'payout' && 'bg-slate-100 text-slate-600'
                        )}>
                          <MaterialIcon name={
                            txn.type === 'earning' ? (txn.meta?.isCredits ? 'diamond' : 'celebration') : 
                            txn.type === 'escrow' ? 'shield' : 
                            txn.type === 'subscription' ? 'workspace_premium' : 'account_balance'
                          } className="text-xl" />
                        </div>
                        <div>
                          <p className="font-headline font-extrabold text-primary text-lg italic leading-none mb-2">{txn.description}</p>
                          <p className="text-[10px] text-on-surface-variant opacity-60 font-black uppercase tracking-widest font-body">
                            {new Date(txn.createdAt).toLocaleDateString()} • {txn.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-left sm:text-right hidden sm:block">
                          <p className={cn(
                            "text-2xl font-black font-headline italic mb-1",
                            txn.type === 'earning' ? 'text-purple-600' : 'text-primary'
                          )}>
                            {txn.type === 'earning' ? '+' : '-'}{txn.meta?.isCredits ? txn.meta.creditAmount : (txn.amount / 100).toFixed(2)}
                            {txn.meta?.isCredits && <span className="text-[10px] ml-1 uppercase font-black opacity-40">credits</span>}
                          </p>
                          <div className="flex items-center justify-end gap-2">
                             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 font-body">{txn.status}</span>
                             <div className={cn(
                               "w-1.5 h-1.5 rounded-full",
                               ['completed', 'confirmed', 'paid'].includes(txn.status.toLowerCase()) ? 'bg-green-500' : 
                               txn.status.toLowerCase() === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                             )}></div>
                          </div>
                        </div>
                        <div className={cn(
                          "w-8 h-8 rounded-full border border-outline-variant/30 flex items-center justify-center transition-transform",
                          expandedId === txn.id && "rotate-180 bg-primary text-white border-primary"
                        )}>
                          <MaterialIcon name="expand_more" className="text-xl" />
                        </div>
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedId === txn.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <div className="px-8 pb-8 pt-2">
                            <div className="h-px bg-slate-200/50 mb-6" />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                              {/* Transaction Details */}
                              <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-body">Meta Integrity</p>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center text-[11px] font-body">
                                    <span className="text-slate-400">Ledger ID</span>
                                    <span className="font-mono text-primary bg-slate-100 px-2 py-0.5 rounded leading-none">{txn.id.slice(0, 12)}...</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[11px] font-body">
                                    <span className="text-slate-400">Timestamp</span>
                                    <span className="text-primary font-bold">{new Date(txn.createdAt).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Booking Context */}
                              {txn.meta && !txn.meta.isCredits && (
                                <div className="space-y-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-body">Booking Context</p>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[11px] font-body">
                                      <span className="text-slate-400">Caregiver</span>
                                      <span className="text-primary font-bold italic underline decoration-primary/20">{txn.meta.caregiverName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-body">
                                      <span className="text-slate-400">Period</span>
                                      <span className="text-primary font-bold">
                                        {new Date(txn.meta.startDate).toLocaleDateString()} - {new Date(txn.meta.endDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {txn.meta?.isCredits && (
                                <div className="space-y-4">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-body">Reward Context</p>
                                  <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[11px] font-body">
                                      <span className="text-slate-400">Credit Type</span>
                                      <span className="text-purple-600 font-bold italic uppercase tracking-widest">{txn.description.split(' ')[0]} Entry</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[11px] font-body">
                                      <span className="text-slate-400">Amount</span>
                                      <span className="text-purple-600 font-black tracking-widest">{txn.meta.creditAmount} Credits</span>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Action Portal */}
                              <div className="space-y-4">
                                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-body">Portals</p>
                                 <div className="flex gap-2">
                                    <Link 
                                      href={txn.type === 'escrow' ? `/dashboard/parent/bookings/${txn.id}` : '#'}
                                      className="flex-1 py-3 bg-white border border-outline-variant/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary text-center hover:bg-slate-50 transition-colors"
                                    >
                                      View Receipt
                                    </Link>
                                    <button className="flex-1 py-3 bg-white border border-outline-variant/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-primary text-center hover:bg-slate-50 transition-colors">
                                      Support
                                    </button>
                                 </div>
                              </div>
                            </div>

                            {/* Summary Tag */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <MaterialIcon name="verified" className="text-green-500 text-sm" fill />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-body">Cryptographically Verified Entry</span>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] font-bold text-slate-300 uppercase italic font-body">Net Settlement</p>
                                  <p className="text-xl font-black font-headline italic text-primary leading-none">
                                    {txn.meta?.isCredits ? `${txn.meta.creditAmount} Credits` : `$${(txn.amount / 100).toFixed(2)}`}
                                  </p>
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-4">
                    <button 
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => prev - 1)}
                      className="w-12 h-12 rounded-xl bg-slate-100 text-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <MaterialIcon name="chevron_left" />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mx-4">
                       Page {currentPage} of {totalPages}
                    </span>
                    <button 
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => prev + 1)}
                      className="w-12 h-12 rounded-xl bg-slate-100 text-primary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      <MaterialIcon name="chevron_right" />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
