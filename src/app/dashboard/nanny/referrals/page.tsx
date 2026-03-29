import { getReferralStats } from "@/lib/actions/referrals";
import ReferralDashboard from "@/components/ReferralDashboard";

export default async function ReferralsPage() {
  const data = await getReferralStats();
  
  return (
    <div className="p-8">
      <ReferralDashboard stats={data.stats} recentReferrals={data.recentReferrals} />
    </div>
  );
}
