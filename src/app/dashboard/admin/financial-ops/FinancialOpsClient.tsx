"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import { approvePayoutRequest, flagPayoutRequest } from "../actions";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface FinancialOpsClientProps {
  pending: any[];
  ledger: any[];
  summary: any;
}

export default function FinancialOpsClient({ pending, ledger, summary }: FinancialOpsClientProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (txId: string) => {
    if (!confirm("Confirm immediate fund release to caregiver?")) return;
    setProcessing(txId);
    try {
      await approvePayoutRequest(txId);
      showToast("Payout successfully authorized.", "success");
      router.refresh();
    } catch (e: any) {
      showToast(e.message || "Failed to approve payout", "error");
    } finally {
      setProcessing(null);
    }
  };

  const handleFlag = async (txId: string) => {
    const reason = prompt("Enter flagging reason for audit trail:");
    if (!reason) return;
    setProcessing(txId);
    try {
      await flagPayoutRequest(txId, reason);
      showToast("Transaction marked for manual review.", "warning");
      router.refresh();
    } catch (e: any) {
      showToast(e.message || "Failed to flag payout", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Bento Grid Command Rows */}
      <div className="grid grid-cols-12 gap-8">
        {/* Main Escrow Card */}
        <div className="col-span-12 lg:col-span-5 bg-gradient-to-br from-[#031f41] to-[#1d3557] p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl shadow-primary/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-12">
              <div>
                <p className="text-white/40 font-black uppercase tracking-[0.2em] text-[9px] italic">Total Funds in Escrow</p>
                <h2 className="text-5xl font-black font-headline mt-2 tracking-tighter italic">
                  ${summary.escrowTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>
              <div className="bg-white/10 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/10 shadow-inner">
                <MaterialIcon name="account_balance_wallet" className="text-3xl text-white/80" />
              </div>
            </div>
            
            <div className="flex items-center gap-10">
              <div>
                <p className="text-white/30 text-[9px] uppercase font-black tracking-widest italic leading-none">Global Holds</p>
                <p className="text-lg font-black mt-2 italic">Active Epoch</p>
              </div>
              <div className="h-10 w-px bg-white/10"></div>
              <div>
                <p className="text-white/30 text-[9px] uppercase font-black tracking-widest italic leading-none">Velocity</p>
                <p className="text-lg font-black mt-2 text-emerald-400 italic font-headline">+12.4%</p>
              </div>
            </div>
          </div>
          
          <div className="mt-14 flex gap-4 relative z-10">
            <button className="flex-1 bg-white text-primary py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg">Download Audit Report</button>
            <button className="w-14 bg-white/10 rounded-2xl hover:bg-white/20 border border-white/5 transition-all flex items-center justify-center">
              <MaterialIcon name="more_horiz" />
            </button>
          </div>
        </div>

        {/* Trends Mini Dashboard */}
        <div className="col-span-12 lg:col-span-7 grid grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="p-3 bg-amber-50 text-amber-600 rounded-2xl material-symbols-outlined shadow-inner">trending_up</span>
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest italic">WEEKLY TREND</span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Withdrawal Volume</p>
              <h3 className="text-4xl font-black mt-2 text-primary italic tracking-tight">$42.8k</h3>
            </div>
            <div className="mt-8 h-20 w-full bg-slate-50 rounded-2xl flex items-end gap-1.5 px-3 pb-3 group-hover:bg-slate-100 transition-colors">
              {[30, 50, 40, 70, 60, 90, 75].map((h, i) => (
                <div key={i} className="bg-primary/10 h-full w-full rounded-md relative flex items-end">
                   <div 
                      className="bg-primary group-hover:bg-secondary w-full rounded-md transition-all duration-700" 
                      style={{ height: `${h}%` }}
                    />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl material-symbols-outlined shadow-inner">hub</span>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest italic">STRIPE CONNECT</span>
              </div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Connected Balance</p>
              <h3 className="text-4xl font-black mt-2 text-primary italic tracking-tight">${summary.revenueTotal.toLocaleString()}</h3>
            </div>
            <div className="mt-8 space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest italic">
                <span className="text-slate-400">Processing</span>
                <span className="text-primary">$12,400</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div className="bg-secondary h-full rounded-full transition-all duration-1000" style={{ width: '65%' }}></div>
              </div>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic text-right opacity-60">Estimated: 24h cycle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Payout Queue */}
      <section className="space-y-6">
        <div className="flex justify-between items-center px-4">
          <h2 className="text-2xl font-black text-primary italic tracking-tight uppercase">Pending Payout Requests</h2>
          <div className="flex gap-3">
            <button className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all italic">Sort by Urgency</button>
            <button className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:bg-white transition-all italic">Bulk Action</button>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Caregiver Entity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Request Sync</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Withdrawal Sum</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Transmission</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest italic text-right">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {pending.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 italic uppercase font-black text-[10px] tracking-widest">No pending disbursement requests found in the current epoch.</td>
                </tr>
              ) : pending.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <img 
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${tx.wallet?.user?.fullName}`} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-primary/5"
                      />
                      <div>
                        <p className="text-sm font-black text-primary italic leading-none">{tx.wallet?.user?.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mt-2 italic">Elite Verified</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-black text-primary uppercase tracking-tight">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5 italic opacity-60">
                      {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xl font-black font-headline text-primary tracking-tighter italic">
                      ${(tx.amount / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <MaterialIcon name="account_balance" className="text-slate-300 text-lg" />
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Stripe Connect</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        disabled={!!processing}
                        onClick={() => handleFlag(tx.id)}
                        className="px-4 py-2 bg-error-container text-on-error-container rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:scale-[1.05] active:scale-95 transition-all shadow-sm flex items-center gap-2"
                      >
                        <MaterialIcon name="flag" className="text-sm" />
                        Flag
                      </button>
                      <button 
                        disabled={!!processing}
                        onClick={() => handleApprove(tx.id)}
                        className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest italic hover:scale-[1.05] active:scale-95 transition-all shadow-lg flex items-center gap-2"
                      >
                        <MaterialIcon name="check_circle" className="text-sm" fill />
                        Authorize
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-8 py-5 bg-slate-50/50 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest italic border-t border-slate-100">
            <p>Vault Snapshot: {pending.length} Requests Pending Approval</p>
            <button className="text-primary hover:translate-x-1 transition-all">Audit Global Queue →</button>
          </div>
        </div>
      </section>

      {/* Payout Ledger */}
      <section className="grid grid-cols-12 gap-10">
        <div className="col-span-12 xl:col-span-8">
          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-black text-primary italic tracking-tight uppercase">Payout Ledger</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic mt-1">Disbursement history of settled epoch cycles</p>
              </div>
              <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                <button className="px-6 py-2 bg-white shadow-sm rounded-xl text-[10px] font-black text-primary uppercase tracking-widest italic">Weekly</button>
                <button className="px-6 py-2 text-[10px] font-black text-slate-400 hover:text-primary uppercase tracking-widest italic transition-all">Monthly</button>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              {ledger.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group cursor-default shadow-sm hover:shadow-md">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner ring-4 ring-white">
                      <MaterialIcon name="payments" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-primary italic leading-none">{tx.wallet?.user?.fullName || 'Batch Release'}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">{tx.id.slice(0, 12)}... • Stripe Connect</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-8">
                    <div>
                      <p className="text-lg font-black text-primary italic tracking-tighter">-${(tx.amount/100).toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm">
                      Settled
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button className="w-full mt-10 py-5 border-t border-slate-50 text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:text-secondary hover:translate-x-1 transition-all text-left italic">Full Ledger History Audit Trail →</button>
          </div>
        </div>

        {/* Security Sidebar */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 shadow-inner flex flex-col h-full relative overflow-hidden">
            <h3 className="text-lg font-black text-primary italic tracking-tight uppercase mb-8">Security Intelligence</h3>
            
            <div className="space-y-8 relative z-10">
              <div className="p-6 bg-white rounded-3xl shadow-sm border-l-4 border-amber-400 group hover:shadow-xl transition-all duration-500">
                <div className="flex items-center gap-3 mb-3">
                  <span className="material-symbols-outlined text-amber-500 text-xl">radar</span>
                  <span className="text-[9px] font-black uppercase text-amber-600 tracking-[0.2em] italic">Fraud Heuristic</span>
                </div>
                <p className="text-xs font-black text-primary italic leading-tight">Geographic Velocity Alert</p>
                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest italic leading-relaxed opacity-60">
                  Multiple account access attempts from inconsistent IP nodes detected within 12h cycle.
                </p>
                <button className="mt-4 text-[9px] font-black text-amber-600 uppercase tracking-widest italic hover:underline">Investigate Nodes →</button>
              </div>

              <div className="p-6 bg-white rounded-3xl shadow-sm">
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 italic">Trust Node Distribution</p>
                 <div className="space-y-5">
                    {[
                      { l: 'ID Verified', p: 98.2, c: 'bg-primary' },
                      { l: 'Identity Linked', p: 84.5, c: 'bg-secondary' },
                      { l: 'KYC Protocol', p: 100, c: 'bg-emerald-500' }
                    ].map((n, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic">
                           <span className="text-slate-500">{n.l}</span>
                           <span className="text-primary">{n.p}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden shadow-inner">
                           <div className={cn(n.c, "h-full rounded-full")} style={{ width: `${n.p}%` }}></div>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>

              <div className="relative group cursor-pointer overflow-hidden rounded-[2rem] h-56 shadow-2xl ring-1 ring-white/10 mt-4">
                <img 
                  src="https://images.unsplash.com/photo-1554224155-169641357599?auto=format&fit=crop&q=80&w=600" 
                  alt="Analytics" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary to-transparent p-8 flex flex-col justify-end ring-1 ring-inset ring-white/10">
                  <p className="text-white font-black text-sm italic tracking-tight uppercase">Quarterly Revenue Forecast</p>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-2 italic">New commission schema logic applied</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Global Filter */}
      <div className="fixed bottom-10 right-10 z-50">
        <button className="bg-primary text-white w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-all duration-300 active:scale-95 border border-white/20">
          <MaterialIcon name="tune" className="text-3xl" />
        </button>
      </div>
    </div>
  );
}
