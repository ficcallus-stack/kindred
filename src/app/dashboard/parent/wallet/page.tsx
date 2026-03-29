"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { Button } from "@/components/form/Button";
import { useToast } from "@/components/Toast";
import { getWalletData, getPayoutMethod, getStripeConnectOnboarding, withdrawFunds } from "./actions";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Link from "next/link";

export default function ParentWalletPage() {
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [data, setData] = useState<any>(null);
  const [payoutMethod, setPayoutMethod] = useState<any>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletData, method] = await Promise.all([
        getWalletData(),
        getPayoutMethod()
      ]);
      setData(walletData);
      setPayoutMethod(method);
    } catch (error) {
      console.error(error);
      showToast("Failed to load wallet data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectBank = async () => {
    setOnboardingLoading(true);
    try {
      const url = await getStripeConnectOnboarding();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      showToast("Failed to start onboarding", "error");
    } finally {
      setOnboardingLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!data?.balance || data.balance <= 0) return;
    setWithdrawing(true);
    try {
      // For now, withdraw everything
      await withdrawFunds(data.balance);
      showToast("Withdrawal initiated successfully!", "success");
      fetchData();
    } catch (error: any) {
      showToast(error.message || "Withdrawal failed", "error");
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black font-headline text-primary tracking-tighter italic">Family Wallet</h1>
          <p className="text-on-surface-variant font-medium opacity-70">Manage your referral rewards and payouts.</p>
        </div>
        
        {payoutMethod ? (
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <MaterialIcon name="account_balance" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Linked Bank</p>
              <p className="font-bold text-primary font-headline italic">{payoutMethod.bankName} •••• {payoutMethod.last4}</p>
            </div>
            <button 
              onClick={handleConnectBank}
              disabled={onboardingLoading}
              className="ml-4 text-xs font-bold text-primary hover:underline"
            >
              Change
            </button>
          </div>
        ) : (
          <Button 
            onClick={handleConnectBank}
            loading={onboardingLoading}
            className="rounded-2xl bg-secondary text-white font-headline font-black italic shadow-xl shadow-secondary/20"
          >
            Connect Bank Account
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Balance Card */}
        <div className="lg:col-span-2 bg-primary rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-primary-fixed-dim text-sm font-black uppercase tracking-[0.2em] opacity-60 mb-2">Available Balance</p>
                <h2 className="text-7xl font-black font-headline tracking-tighter italic">${(data?.balance / 100).toFixed(2)}</h2>
              </div>
              <MaterialIcon name="account_balance_wallet" className="text-5xl opacity-20" />
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
              <div>
                <p className="text-primary-fixed-dim text-xs font-black uppercase tracking-widest opacity-40 mb-1">Total Redeemed</p>
                <p className="text-2xl font-bold font-headline italic">${data?.stats?.totalRedeemed?.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-primary-fixed-dim text-xs font-black uppercase tracking-widest opacity-40 mb-1">Referral Milestones</p>
                <div className="flex items-center gap-2">
                   <p className="text-2xl font-bold font-headline italic">Level 2</p>
                   <MaterialIcon name="trending_up" className="text-secondary text-sm" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <Button 
                onClick={handleWithdraw}
                loading={withdrawing}
                disabled={!payoutMethod || !data?.balance || data.balance <= 0}
                className="bg-white text-primary rounded-2xl px-12 py-4 h-auto font-headline font-black italic text-lg shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all w-full md:w-auto disabled:opacity-50"
              >
                Withdraw to Bank
              </Button>
              <Link href="/dashboard/parent/referrals" className="w-full md:w-auto">
                <Button className="bg-primary-container text-white px-8 h-full rounded-2xl font-bold border border-white/10">
                  Refer Friends
                </Button>
              </Link>
            </div>
            
            {!payoutMethod && (
               <p className="text-xs text-primary-fixed-dim opacity-50 flex items-center gap-2">
                 <MaterialIcon name="info" className="text-sm" />
                 Please link a bank account to enable manual withdrawals.
               </p>
            )}
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-8">
          {/* Chart Placeholder / Activity */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50">
            <h3 className="text-lg font-black font-headline text-primary italic mb-6">Reward Activity</h3>
            <div className="flex items-end justify-between h-40 gap-2 mb-4">
              {data?.stats?.chart?.map((month: any, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative bg-slate-50 rounded-lg overflow-hidden h-full">
                    <div 
                      className={`absolute bottom-0 w-full transition-all duration-1000 ${month.curr ? 'bg-secondary' : 'bg-primary/20 group-hover:bg-primary/40'}`}
                      style={{ height: month.h }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-400">{month.m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <h3 className="text-primary-fixed-dim text-[10px] font-black uppercase tracking-[0.2em] mb-4">Pro Tip</h3>
            <p className="font-bold leading-relaxed mb-6 italic opacity-80">
              "Redeeming credits to your wallet is required before you can withdraw to your bank account."
            </p>
            <Link href="/dashboard/parent/referrals" className="text-xs font-black text-secondary uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
              Go to Referrals
              <MaterialIcon name="arrow_forward" />
            </Link>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-50">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-2xl font-black font-headline text-primary tracking-tighter italic">Recent Transactions</h3>
          <Button variant="outline" className="text-xs font-black uppercase tracking-widest border-slate-200">View All</Button>
        </div>

        <div className="space-y-1">
          {data?.transactions?.length > 0 ? data.transactions.map((txn: any) => (
            <div key={txn.id} className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
              <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                  txn.type === 'earning' ? 'bg-green-50 text-green-600' : 'bg-primary/5 text-primary'
                }`}>
                  <MaterialIcon name={txn.type === 'earning' ? 'add_circle' : 'payouts'} />
                </div>
                <div>
                  <p className="font-headline font-extrabold text-primary italic leading-none mb-1">{txn.description}</p>
                  <p className="text-xs text-slate-400 font-bold">{new Date(txn.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-xl font-black font-headline italic ${txn.type === 'earning' ? 'text-green-600' : 'text-primary'}`}>
                  {txn.type === 'earning' ? '+' : '-'}${(txn.amount / 100).toFixed(2)}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    txn.status === 'completed' ? 'bg-green-500' : txn.status === 'failed' ? 'bg-red-500' : 'bg-amber-500'
                  }`}></div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{txn.status}</span>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center space-y-4">
              <MaterialIcon name="history" className="text-6xl text-slate-100" />
              <p className="text-slate-400 font-bold italic tracking-tight">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
