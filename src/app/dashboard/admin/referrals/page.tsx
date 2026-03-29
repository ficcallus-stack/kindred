import { getReferralStats, getPendingReferrals } from "@/lib/actions/referrals";
import ReferralDashboard from "@/components/ReferralDashboard";
import ReferralReviewQueue from "@/components/ReferralReviewQueue";

export default async function AdminReferralsPage() {
  const data = await getReferralStats();
  const pending = await getPendingReferrals();
  
  return (
    <div className="p-8 space-y-20">
      <header className="mb-12">
        <h2 className="font-headline text-3xl font-extrabold text-primary">Referral Payout Management</h2>
        <p className="text-on-surface-variant max-w-2xl mt-2 font-medium leading-relaxed italic">
            Audit, approve, and release rewards for verified community referrals.
        </p>
      </header>

      <div className="space-y-8">
        <h3 className="font-headline font-black text-2xl italic text-primary">Awaiting Payout Approval</h3>
        <ReferralReviewQueue pending={pending} />
      </div>

      <hr className="border-slate-100" />

      <div className="space-y-6">
        <h3 className="font-headline font-black text-2xl italic text-primary">Admin Personal Referral Performance</h3>
        <ReferralDashboard stats={data.stats} recentReferrals={data.recentReferrals} />
      </div>
    </div>
  );
}

