"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { approveReferralPayout, rejectReferral } from "@/lib/actions/referrals";

interface PendingReferral {
  id: string;
  referrer: { fullName: string; role: string; email: string };
  referee: { fullName: string; role: string; email: string };
  rewardAmount: number;
  createdAt: Date;
}

export default function ReferralReviewQueue({ pending }: { pending: any[] }) {
  const { showToast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    try {
      await approveReferralPayout(id);
      showToast("Referral approved and funds released!", "success");
    } catch (err: any) {
      showToast(err.message || "Approval failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Are you sure you want to reject this referral?")) return;
    setLoadingId(id);
    try {
      await rejectReferral(id);
      showToast("Referral rejected", "info");
    } catch (err: any) {
      showToast(err.message || "Rejection failed", "error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 overflow-hidden relative">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-2xl font-black font-headline text-primary italic flex items-center gap-3">
          <MaterialIcon name="verified" className="text-secondary" fill />
          Payout Approval Queue
        </h3>
        <span className="bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
          {pending.length} Pending Actions
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-primary/30 text-[10px] font-black uppercase tracking-widest border-b border-slate-50">
              <th className="pb-6">Participants (Referrer → Referee)</th>
              <th className="pb-6">Calculated Reward</th>
              <th className="pb-6">Submitted At</th>
              <th className="pb-6 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pending.length > 0 ? pending.map((ref) => (
              <tr key={ref.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-8">
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-secondary text-white border-4 border-white flex items-center justify-center font-black italic shadow-lg z-20">
                            {ref.referrer.fullName[0]}
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-primary text-white border-4 border-white flex items-center justify-center font-black italic shadow-lg z-10">
                            {ref.referee.fullName[0]}
                        </div>
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm leading-tight flex items-center gap-2">
                         {ref.referrer.fullName} <MaterialIcon name="arrow_forward" className="text-xs text-slate-300" /> {ref.referee.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {ref.referrer.role} invited {ref.referee.role}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="py-8">
                  <span className="font-headline font-black text-xl italic text-primary">
                    ${(ref.rewardAmount / 100).toFixed(2)}
                  </span>
                  <p className="text-[10px] font-bold text-slate-400 italic">Pre-verified by system</p>
                </td>
                <td className="py-8 text-sm font-medium text-slate-500">
                  {new Date(ref.createdAt).toLocaleDateString()}
                  <p className="text-[10px] opacity-40">{new Date(ref.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </td>
                <td className="py-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => handleReject(ref.id)}
                      disabled={loadingId === ref.id}
                      className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                      title="Reject Referral"
                    >
                      <MaterialIcon name="close" className="text-lg" />
                    </button>
                    <button
                      onClick={() => handleApprove(ref.id)}
                      disabled={loadingId === ref.id}
                      className="flex items-center gap-3 px-6 py-3 bg-primary text-white rounded-xl font-headline font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/10 hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loadingId === ref.id ? "Processing..." : "Release Funds"}
                      <MaterialIcon name="payments" className="text-sm" fill />
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <MaterialIcon name="verified" className="text-6xl" />
                    <p className="font-headline font-black text-2xl italic">The review queue is empty.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
