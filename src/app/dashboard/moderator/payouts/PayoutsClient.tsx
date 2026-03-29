"use client";

import { useState } from "react";
import { approveWithdrawal, rejectWithdrawal, fundPlatformSandbox } from "@/lib/actions/stripe-payouts";
import { format } from "date-fns";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";

interface PayoutsClientProps {
  initialPayouts: any[];
  platformBalance: { availableCents: number; pendingCents: number };
}

export default function PayoutsClient({ initialPayouts, platformBalance }: PayoutsClientProps) {
  const [payouts, setPayouts] = useState(initialPayouts);
  const [balance, setBalance] = useState(platformBalance);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [funding, setFunding] = useState(false);
  const { showToast } = useToast();

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await approveWithdrawal(id);
      showToast("Payout successfully authorized and transferred", "success");
      setPayouts(prev => prev.filter(p => p.id !== id));
      // Refresh balance after successful transfer
      setBalance(prev => ({ ...prev, availableCents: prev.availableCents - (payouts.find(p => p.id === id)?.amount || 0) }));
    } catch (e: any) {
      showToast(e.message || "Failed to approve payout", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const handleFundSandbox = async () => {
    setFunding(true);
    try {
      await fundPlatformSandbox(100000); // Add $1000
      showToast("Sandbox funds dispatched to Platform. Refreshing...", "success");
      // Local state update for immediate feedback
      setBalance(prev => ({ ...prev, availableCents: prev.availableCents + 100000 }));
    } catch (e: any) {
      showToast(e.message || "Funding failed", "error");
    } finally {
      setFunding(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection:");
    if (!reason) return;

    setProcessingId(id);
    try {
      await rejectWithdrawal(id, reason);
      showToast("Withdrawal rejected and funds reverted", "success");
      setPayouts(prev => prev.filter(p => p.id !== id));
    } catch (e: any) {
      showToast(e.message || "Failed to reject payout", "error");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-12">
      {/* Real Stripe Balance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-200 mb-2 italic">Stripe Platform Available</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-black italic tracking-tighter decoration-secondary decoration-4 underline-offset-8">
              ${(balance.availableCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">USD</span>
          </div>
          <MaterialIcon name="account_balance" className="absolute -bottom-6 -right-6 text-9xl opacity-5 group-hover:rotate-12 transition-transform duration-1000" fill />
        </div>

        <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/10 group">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mb-2 italic group-hover:text-primary transition-colors">Pending Clearances</h4>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-headline font-black text-primary italic tracking-tighter">
              ${(balance.pendingCents / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
            <MaterialIcon name="schedule" className="text-xl text-primary animate-pulse" />
          </div>
        </div>

        <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-dashed border-outline-variant/30 flex flex-col justify-center items-center gap-4 group">
          <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest italic text-center">Development Utilities</p>
          <button 
            onClick={handleFundSandbox}
            disabled={funding}
            className="w-full flex items-center justify-center gap-3 bg-secondary-fixed text-on-secondary-fixed py-4 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-secondary-fixed/20 disabled:opacity-50 italic"
          >
            {funding ? "Dispatching Funds..." : "Fund Sandbox Platform (+$1000)"}
            <MaterialIcon name="add_to_photos" className="text-sm" />
          </button>
        </div>
      </div>

      {payouts.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-[3rem] border border-outline-variant/10 p-24 text-center italic opacity-30 animate-in fade-in duration-700">
          <MaterialIcon name="done_all" className="text-6xl mb-4 text-primary" />
          <p className="font-headline font-black text-2xl text-primary">Queue is empty</p>
          <p className="text-sm">All caregiver withdrawals have been processed.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-[3.5rem] border border-outline-variant/10 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/10 italic">
                <th className="px-8 py-6 text-[10px] font-black text-primary/40 uppercase tracking-widest">Caregiver</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary/40 uppercase tracking-widest text-center">Amount Requested</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary/40 uppercase tracking-widest text-center">Submission Date</th>
                <th className="px-8 py-6 text-[10px] font-black text-primary/40 uppercase tracking-widest text-right">Authorize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {payouts.map((p) => (
                <tr key={p.id} className="hover:bg-surface-container-low/20 transition-all group">
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center font-black text-primary shadow-inner">
                        {p.wallet.user.fullName.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black font-headline text-lg text-primary italic leading-none">{p.wallet.user.fullName}</h4>
                        <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest mt-1">Stripe ID: {p.wallet.user.stripeConnectId || "Missing"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-black text-lg tracking-tighter italic">
                      ${(p.amount / 100).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    {format(new Date(p.createdAt), "MMM d, yyyy")} <br/> {format(new Date(p.createdAt), "h:mm a")}
                  </td>
                  <td className="px-8 py-8 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleReject(p.id)}
                        disabled={processingId === p.id}
                        className="p-3 bg-error/10 text-error rounded-2xl hover:bg-error hover:text-white transition-all active:scale-95 disabled:opacity-30"
                        title="Reject and Revert Funds"
                      >
                        <MaterialIcon name="block" className="text-xl" />
                      </button>
                      <button 
                        onClick={() => handleApprove(p.id)}
                        disabled={processingId === p.id}
                        className={cn(
                          "flex items-center gap-3 bg-primary text-white pl-6 pr-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50",
                          processingId === p.id && "animate-pulse"
                        )}
                      >
                        {processingId === p.id ? "Authorizing..." : "Authorize Payout"}
                        <MaterialIcon name="arrow_forward" className="text-sm" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
