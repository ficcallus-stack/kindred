import { MaterialIcon } from "@/components/MaterialIcon";
import { db } from "@/db";
export const dynamic = "force-dynamic";
import { payments, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const metadata = {
  title: "Payments | Kindred Core Admin",
};

export default async function AdminPaymentsPage() {
  const allPayments = await db.select({
    id: payments.id,
    amount: payments.amount,
    status: payments.status,
    description: payments.description,
    stripePaymentIntentId: payments.stripePaymentIntentId,
    createdAt: payments.createdAt,
    userName: users.fullName,
    userEmail: users.email,
  })
  .from(payments)
  .innerJoin(users, eq(payments.userId, users.id))
  .orderBy(desc(payments.createdAt))
  .limit(50);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-50 text-yellow-700",
    authorized: "bg-blue-50 text-blue-700",
    captured: "bg-emerald-50 text-emerald-700",
    refunded: "bg-slate-50 text-slate-500",
    failed: "bg-red-50 text-red-600",
  };

  return (
    <div className="p-10 space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-[#002B5B] tracking-tight">Payments</h1>
          <p className="text-slate-400 text-sm font-bold mt-1">{allPayments.length} transactions</p>
        </div>
      </header>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User</th>
              <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
              <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Description</th>
              <th className="text-left px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
            </tr>
          </thead>
          <tbody>
            {allPayments.length > 0 ? allPayments.map((p: any) => (
              <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-5">
                  <p className="font-bold text-[#002B5B] text-sm">{p.userName}</p>
                  <p className="text-xs text-slate-400">{p.userEmail}</p>
                </td>
                <td className="px-8 py-5 font-black text-[#002B5B] text-lg">${(p.amount / 100).toFixed(2)}</td>
                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${statusColors[p.status] || "bg-slate-50 text-slate-400"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-8 py-5 text-sm text-slate-500">{p.description || "-"}</td>
                <td className="px-8 py-5 text-xs text-slate-400 font-bold">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-300 italic">
                  No payments yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
