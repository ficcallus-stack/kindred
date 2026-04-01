"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { getWalletData } from "./actions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PlatformCreditsLedger() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const { showToast } = useToast();

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
          <button className="px-6 py-3 bg-surface-container-low text-primary rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-colors flex items-center gap-2 border border-outline-variant/10">
            <MaterialIcon name="download" className="text-sm" /> Download CSV
          </button>
        </div>

        <div className="space-y-2">
          {data?.transactions?.length > 0 ? data.transactions.map((txn: any) => (
            <div key={txn.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group gap-4">
              <div className="flex items-center gap-6">
                <div className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                  txn.type === 'earning' && 'bg-purple-50 text-purple-600',
                  txn.type === 'escrow' && 'bg-blue-50 text-blue-600',
                  txn.type === 'subscription' && 'bg-amber-50 text-amber-600',
                  txn.type === 'payout' && 'bg-slate-100 text-slate-600'
                )}>
                  <MaterialIcon name={
                    txn.type === 'earning' ? 'diamond' : 
                    txn.type === 'escrow' ? 'shield' : 
                    txn.type === 'subscription' ? 'workspace_premium' : 'account_balance'
                  } />
                </div>
                <div>
                  <p className="font-headline font-extrabold text-primary text-lg italic leading-none mb-2">{txn.description}</p>
                  <p className="text-[10px] text-on-surface-variant opacity-60 font-black uppercase tracking-widest">
                    {new Date(txn.createdAt).toLocaleDateString()} • {txn.type}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                <p className={cn(
                  "text-2xl font-black font-headline italic mb-2",
                  txn.type === 'earning' ? 'text-purple-600' : 'text-primary'
                )}>
                  {txn.type === 'earning' ? '+' : '-'}${(txn.amount / 100).toFixed(2)}
                </p>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    ['completed', 'confirmed', 'paid'].includes(txn.status.toLowerCase()) ? 'bg-green-500' : 
                    txn.status.toLowerCase() === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                  )}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{txn.status}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-24 text-center space-y-6 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <MaterialIcon name="receipt_long" className="text-4xl text-slate-300" />
              </div>
              <div>
                 <p className="text-primary font-black font-headline italic text-2xl mb-2">Clean Slate</p>
                 <p className="text-slate-400 font-bold max-w-sm mx-auto">No transaction history found. Post a job to start earning credits!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
