import { getPendingWithdrawals, getPlatformBalance } from "@/lib/actions/stripe-payouts";
import PayoutsClient from "./PayoutsClient";

export const dynamic = "force-dynamic";

export default async function PayoutsPage() {
  const [pending, balance] = await Promise.all([
    getPendingWithdrawals(),
    getPlatformBalance()
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
         <div>
            <h2 className="text-4xl font-black font-headline text-primary italic tracking-tight">Financial Dispatch</h2>
            <p className="text-sm text-on-surface-variant/60 font-medium italic">Authorize and audit caregiver platform withdrawals</p>
         </div>
      </header>
      
      <PayoutsClient initialPayouts={pending} platformBalance={balance} />
    </div>
  );
}
