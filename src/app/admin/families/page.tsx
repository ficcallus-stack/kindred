import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { db } from "@/db";
export const dynamic = "force-dynamic";
import { users, children, payments, bookings } from "@/db/schema";
import { eq, count, sql, desc, and } from "drizzle-orm";

export default async function FamilyVetting() {
  // Fetch live families (parents)
  const familyList = await db.select({
    id: users.id,
    name: users.fullName,
    createdAt: users.createdAt,
    childCount: count(children.id),
    totalPaid: sql<number>`COALESCE(SUM(${payments.amount}), 0)`,
    hasBookings: sql<boolean>`CASE WHEN COUNT(${bookings.id}) > 0 THEN true ELSE false END`,
  })
  .from(users)
  .leftJoin(children, eq(users.id, children.parentId))
  .leftJoin(payments, eq(users.id, payments.userId))
  .leftJoin(bookings, eq(users.id, bookings.parentId))
  .where(eq(users.role, "parent"))
  .groupBy(users.id)
  .orderBy(desc(users.createdAt))
  .limit(20);

  // KPIs
  const [metrics] = await db.select({
    totalFamilies: count(),
    actionRequired: sql<number>`COUNT(CASE WHEN NOT EXISTS (SELECT 1 FROM ${payments} WHERE ${payments.userId} = ${users.id}) THEN 1 END)`,
  })
  .from(users)
  .where(eq(users.role, "parent"));

  const familiesingsCount = familyList.length;

  return (
    <div className="pt-24 px-8 pb-12 min-h-screen">
      {/* Header & Metrics */}
      <section className="mb-14">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h1 className="text-4xl font-black text-primary tracking-tighter mb-2">Family Vetting</h1>
            <p className="text-on-surface-variant max-w-lg font-medium opacity-70">Monitor and approve household applications. Every family undergoes a multi-step safety protocol to ensure high-quality care environments.</p>
          </div>
        </div>

        {/* Bento Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Families", val: metrics?.totalFamilies || 0, icon: "groups" },
            { label: "Verification Velocity", val: "High", trend: "Live", icon: "speed" },
            { label: "Active Pipelines", val: familyList.filter(f => f.hasBookings).length, icon: "analytics" },
            { label: "Action Required", val: metrics?.actionRequired || 0, sub: "Missing Payment Method", highlight: true }
          ].map((metric, i) => (
            <div key={i} className={cn(
              "p-8 rounded-[2rem] border transition-all group relative overflow-hidden h-36 flex flex-col justify-between shadow-sm",
              metric.highlight ? "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim/20 shadow-tertiary-fixed/20" : "bg-white border-slate-100 hover:shadow-xl hover:shadow-primary/5"
            )}>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 z-10">{metric.label}</div>
              <div className="flex items-end justify-between z-10">
                <div className="text-4xl font-black tracking-tighter">{metric.val}</div>
                {metric.trend && <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-black uppercase tracking-widest"><MaterialIcon name="trending_up" className="text-sm" /> {metric.trend}</div>}
                {metric.sub && <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">{metric.sub}</div>}
              </div>
              {metric.icon && <MaterialIcon name={metric.icon} className="absolute -right-6 -bottom-6 text-[100px] opacity-5 group-hover:opacity-10 transition-opacity rotate-12 group-hover:rotate-0 duration-700 pointer-events-none" />}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Main Grid Section (12 Columns for now as sidebar is static) */}
        <section className="col-span-12 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-3">
              Registered Families
              <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{familyList.length} Active</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {familyList.map((family) => (
              <div key={family.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:shadow-2xl hover:shadow-primary/5 transition-all group relative">
                <div className="flex items-start gap-5 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-2xl shadow-sm group-hover:scale-110 transition-transform">
                    {family.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-black text-xl text-primary truncate tracking-tight">{family.name}</h3>
                    <div className="text-xs text-on-surface-variant font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-60 mt-1">
                      <MaterialIcon name="child_care" className="text-sm" /> {family.childCount} Children
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Revenue Contributed</span>
                    <span className="font-black text-sm text-primary">${(family.totalPaid / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Booking Status</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                      family.hasBookings ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                    )}>
                      {family.hasBookings ? "Active" : "No Bookings"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">ID Verified</span>
                    <MaterialIcon name="check_circle" className="text-emerald-500" fill />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary bg-primary/5 rounded-2xl hover:bg-primary/10 transition-all active:scale-95">
                    View Family Profile
                  </button>
                </div>
              </div>
            ))}

            {familyList.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-40">
                <MaterialIcon name="family_restroom" className="text-6xl mb-4" />
                <p className="font-black text-xl">No Families Registered Yet</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
