import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { db } from "@/db";
export const dynamic = "force-dynamic";
import { users, nannyProfiles, certifications } from "@/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import Link from "next/link";
import { approveCaregiver, requireReverification } from "./actions";

export default async function CaregiverVetting({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: selectedId } = await searchParams;

  // Fetch real caregivers from DB
  const dbCaregivers = await db.select({
    id: users.id,
    name: users.fullName,
    email: users.email,
    createdAt: users.createdAt,
    location: nannyProfiles.location,
    isVerified: nannyProfiles.isVerified,
    hourlyRate: nannyProfiles.hourlyRate,
  })
  .from(users)
  .leftJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(eq(users.role, "caregiver"))
  .orderBy(desc(users.createdAt))
  .limit(20);

  const caregivers = dbCaregivers.map((cg) => ({
    id: cg.id,
    name: cg.name,
    location: cg.location || "Not specified",
    regDate: new Date(cg.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    idStatus: cg.isVerified ? "VERIFIED" : "PENDING",
    bgStatus: cg.isVerified ? "Clear" : "Not Started",
    isVerified: cg.isVerified || false,
    references: "0/3",
    badge: cg.isVerified || false,
    image: "",
  }));

  // Find the selected caregiver for the sidebar
  const activeCg = caregivers.find(c => c.id === selectedId) || caregivers[0];

  return (
    <div className="pt-24 px-8 pb-12 flex flex-col gap-8 max-w-[1600px]">
      <div className="flex gap-8">
        {/* Left Side: Table View (Primary) */}
        <div className="flex-1 space-y-8">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-primary">Caregiver Vetting</h2>
              <p className="text-on-surface-variant mt-1 font-medium">Manage and verify the professional integrity of your care network.</p>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-xl shadow-inner border border-slate-200/50">
              {["Pending ID", "Awaiting Background", "Flagged", "Verified"].map(filter => (
                <button 
                  key={filter} 
                  className={cn(
                    "px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all duration-200",
                    filter === "Awaiting Background" ? "bg-white shadow-sm text-primary" : "text-on-surface-variant hover:text-primary"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Caregiver Name</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Reg. Date</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">ID Status</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Background Check</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">References</th>
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Badge</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {caregivers.map((cg) => (
                  <tr 
                    key={cg.id} 
                    className={cn(
                        "hover:bg-slate-50/50 transition-colors group cursor-pointer",
                        selectedId === cg.id && "bg-primary/5"
                    )}
                  >
                    <td className="px-6 py-5">
                      <Link href={`/admin/caregivers?id=${cg.id}`} className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-xl overflow-hidden relative border-2 border-transparent transition-all bg-primary/10 flex items-center justify-center")}>
                          {cg.image ? (
                            <img src={cg.image} className="w-full h-full object-cover" alt={cg.name} />
                          ) : (
                            <span className="font-black text-lg text-primary">{cg.name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-primary tracking-tight">{cg.name}</p>
                          <p className="text-xs text-on-surface-variant font-medium">{cg.location}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">{cg.regDate}</td>
                    <td className="px-6 py-5 text-left">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full",
                        cg.idStatus === "VERIFIED" && "bg-tertiary-fixed text-on-tertiary-fixed-variant",
                        cg.idStatus === "FLAGGED" && "bg-error-container text-on-error-container",
                        cg.idStatus === "PENDING" && "bg-surface-container-highest text-on-surface-variant"
                      )}>
                        <MaterialIcon name={cg.idStatus === "PENDING" ? "pending" : cg.idStatus === "FLAGGED" ? "error" : "check_circle"} className="text-[14px]" fill />
                        {cg.idStatus}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                          cg.bgStatus === "Clear" && "text-on-tertiary-fixed-variant",
                          cg.bgStatus === "In Progress" && "text-secondary",
                          cg.bgStatus === "Review Required" && "text-error",
                          cg.bgStatus === "Not Started" && "text-on-surface-variant opacity-60"
                        )}>
                          <MaterialIcon name={cg.bgStatus.includes("Review") ? "warning" : cg.bgStatus.includes("Clear") ? "check_circle" : cg.bgStatus.includes("Progress") ? "hourglass_empty" : "schedule"} className="text-[16px]" />
                          {cg.bgStatus}
                        </span>
                        {cg.bgStatus !== "Not Started" && (
                          <a href="#" className="text-[9px] font-black uppercase tracking-widest text-blue-600 hover:underline mt-1 flex items-center gap-0.5">
                            View on Checkr <MaterialIcon name="open_in_new" className="text-[10px]" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-base font-black text-primary font-headline">{cg.references}</td>
                    <td className="px-6 py-5">
                      <MaterialIcon name="verified" className={cn("text-2xl", cg.badge ? "text-tertiary-fixed-dim" : "text-slate-200")} fill={cg.badge} />
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-slate-300 hover:text-primary transition-colors">
                        <MaterialIcon name="more_vert" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 flex justify-between items-center bg-slate-50/30 border-t border-slate-50">
              <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60">Showing {caregivers.length} of {caregivers.length} caregivers</p>
              <div className="flex gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white transition-all border border-slate-200/50 text-slate-400">
                  <MaterialIcon name="chevron_left" className="text-lg" />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white text-xs font-black shadow-lg shadow-primary/20">1</button>
                <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white transition-all text-xs font-black text-on-surface-variant">2</button>
                <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white transition-all border border-slate-200/50 text-slate-400">
                  <MaterialIcon name="chevron_right" className="text-lg" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Vetting Progress", val: "84.2%", trend: "+5.4%", icon: "task_alt", color: "bg-primary text-white", subColor: "text-primary-fixed-dim" },
              { label: "Flagged Cases", val: "12", trend: "Requires attention", icon: "emergency_home", color: "bg-secondary-fixed text-on-secondary-fixed", subColor: "text-on-secondary-fixed-variant" },
              { label: "Avg. Turnaround", val: "4.2 Days", trend: "Kindred Engine", icon: "timer", color: "bg-tertiary-fixed text-on-tertiary-fixed", subColor: "text-on-tertiary-fixed-variant" }
            ].map(card => (
              <div key={card.label} className={cn("p-6 rounded-[2rem] relative overflow-hidden group shadow-sm", card.color)}>
                <div className="relative z-10">
                  <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em] mb-2", card.subColor)}>{card.label}</h3>
                  <p className="text-4xl font-black tracking-tighter">{card.val}</p>
                  <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-2", card.subColor, "opacity-60 italic")}>{card.trend}</p>
                </div>
                <MaterialIcon name={card.icon} className="absolute -bottom-6 -right-6 text-[120px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Quick Profile Review */}
        {activeCg && (
          <aside className="w-[420px] flex flex-col gap-6">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 sticky top-24">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h3 className="text-2xl font-black text-primary tracking-tight">Quick Review</h3>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-60">ID: {activeCg.name}</p>
                </div>
                {activeCg.idStatus === "PENDING" && (
                    <span className="px-3 py-1.5 bg-error-container text-on-error-container text-[9px] font-black rounded-full tracking-widest uppercase border border-error/10">Action Req.</span>
                )}
              </div>

              <div className="space-y-10">
                <div className="relative">
                  <div className="w-full h-48 rounded-[2rem] overflow-hidden mb-4 bg-slate-100 shadow-inner">
                    <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop" alt="Context" />
                  </div>
                  <div className="absolute -bottom-6 left-8 flex items-end gap-5">
                    <div className="w-28 h-28 rounded-3xl border-[6px] border-white shadow-2xl bg-primary/10 flex items-center justify-center">
                        <span className="text-3xl font-black text-primary">{activeCg.name.charAt(0)}</span>
                    </div>
                    <div className="mb-6">
                      <h4 className="font-black text-xl text-primary leading-none tracking-tight">{activeCg.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">Joined {activeCg.regDate}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-8 space-y-5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-60">Uploaded Documents</h4>
                  {[
                    { title: "State ID / Passport", sub: "Exp: Jan 2028 • 1.2 MB", icon: "badge", iconColor: "text-error", check: activeCg.isVerified, view: true },
                    { title: "CPR/First Aid Cert.", sub: "Blurry: Needs Re-upload", icon: "badge", iconColor: "text-blue-500", warn: !activeCg.isVerified, edit: true },
                    { title: "Immunization Record", sub: "Validated by System", icon: "verified_user", iconColor: "text-tertiary-fixed-dim", check: activeCg.isVerified }
                  ].map((doc, i) => (
                    <div key={i} className={cn("group cursor-pointer bg-slate-50 p-4 rounded-2xl flex items-center justify-between border-2 border-transparent hover:border-primary/10 transition-all", doc.warn && "border-error/20 bg-error/5")}>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                          <MaterialIcon name={doc.icon} className={doc.iconColor} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-primary">{doc.title}</p>
                          <p className={cn("text-[10px] font-bold uppercase tracking-tight", doc.warn ? "text-error" : "text-on-surface-variant opacity-60")}>
                            {doc.sub}
                          </p>
                        </div>
                      </div>
                      <MaterialIcon name={doc.check ? "check_circle" : doc.view ? "visibility" : "edit"} className={cn("transition-colors", doc.check ? "text-on-tertiary-fixed-variant" : "text-slate-300 group-hover:text-primary")} />
                    </div>
                  ))}
                </div>

                <form className="pt-6 grid grid-cols-2 gap-4">
                  <input type="hidden" name="id" value={activeCg.id} />
                  <button 
                    formAction={async (formData) => {
                        'use server';
                        const id = formData.get('id') as string;
                        await requireReverification(id);
                    }}
                    className="py-4 rounded-2xl border-2 border-slate-100 font-black text-xs uppercase tracking-widest text-on-surface-variant hover:bg-slate-50 transition-all active:scale-95"
                  >
                    Flag / Re-verify
                  </button>
                  <button 
                    formAction={async (formData) => {
                        'use server';
                        const id = formData.get('id') as string;
                        await approveCaregiver(id);
                    }}
                    className="py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                    disabled={activeCg.isVerified}
                  >
                    Approve Profile
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-error-container/20 p-6 rounded-[2rem] flex gap-5 border border-error/10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                 <MaterialIcon name="campaign" className="text-error text-2xl" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-on-error-container">Compliance Warning</p>
                <p className="text-sm font-medium text-on-error-container/80 mt-1 leading-relaxed">{activeCg.name}'s check returned a non-critical traffic violation flag. Review Checkr report page 4.</p>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
