import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, parentProfiles, children, bookings, parentVerifications } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import InfiltrateButton from "./InfiltrateButton";

export default async function FamilyControlCenter({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const familyRes = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      profileImageUrl: users.profileImageUrl,
      isGhost: users.isGhost,
      tier: users.subscriptionTier,
      isPremium: users.isPremium,
      platformCredits: users.platformCredits,
      familyName: parentProfiles.familyName,
      location: parentProfiles.location,
      bio: parentProfiles.bio,
      philosophy: parentProfiles.philosophy,
      householdManual: parentProfiles.householdManual,
      familyPhoto: parentProfiles.familyPhoto,
      bookingsCount: sql<number>`(SELECT CAST(COUNT(*) AS INTEGER) FROM ${bookings} WHERE parent_id = ${users.id})`
    })
    .from(users)
    .innerJoin(parentProfiles, eq(users.id, parentProfiles.id))
    .where(eq(users.id, id))
    .limit(1);

  if (familyRes.length === 0 || !familyRes[0].isGhost) {
    notFound();
  }

  const f = familyRes[0];

  const householdChildren = await db.query.children.findMany({
    where: eq(children.parentId, id),
    orderBy: [sql`age DESC`]
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin/liquidity/families/manage" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
          <MaterialIcon name="arrow_back" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Family Control Center</h2>
          <p className="text-on-surface-variant font-medium mt-1 uppercase tracking-widest text-[10px]">Household UID: {f.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Column: Identity & Metadata */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="bg-surface-container-lowest p-8 rounded-[3rem] shadow-sm border border-outline-variant/10 text-center flex flex-col items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/5 to-transparent" />
             <img src={f.profileImageUrl || ""} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-2xl mb-6 relative z-10" />
             <h3 className="text-2xl font-black text-primary font-headline tracking-tighter relative z-10">{f.fullName}</h3>
             <p className="text-[11px] font-bold text-slate-400 mb-8 relative z-10">{f.email}</p>

             <InfiltrateButton uid={f.id} />
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-outline-variant/5">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Marketplace Intelligence</h4>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <div className="flex items-center gap-3">
                      <MaterialIcon name="payments" className="text-primary text-lg" />
                      <span className="text-xs font-bold text-slate-600">Credits</span>
                   </div>
                   <span className="text-sm font-black text-primary">{f.platformCredits || 0}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <div className="flex items-center gap-3">
                      <MaterialIcon name="verified" className="text-emerald-500 text-lg" />
                      <span className="text-xs font-bold text-slate-600">Tier</span>
                   </div>
                   <span className={`text-[10px] font-black uppercase tracking-widest ${f.tier === 'elite' ? 'text-amber-500' : 'text-primary'}`}>{f.tier || 'Free'}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                   <div className="flex items-center gap-3">
                      <MaterialIcon name="history_edu" className="text-slate-400 text-lg" />
                      <span className="text-xs font-bold text-slate-600">Bookings</span>
                   </div>
                   <span className="text-sm font-black text-slate-600">{f.bookingsCount}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: House Specs & Children */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-start mb-8">
                 <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-1">Household Vision</h4>
                    <h3 className="text-2xl font-black text-primary font-headline tracking-tighter">{f.familyName}</h3>
                 </div>
                 <div className="px-4 py-2 bg-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MaterialIcon name="location_on" className="text-sm" />
                    {f.location}
                 </div>
              </div>

              <div className="space-y-8">
                 <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1 flex items-center gap-2">
                       <MaterialIcon name="auto_awesome" className="text-sm text-primary" />
                       Parenting Philosophy
                    </h5>
                    <div className="p-6 rounded-3xl bg-primary/5 text-primary text-sm font-medium leading-relaxed border border-primary/10 italic">
                       &ldquo;{f.philosophy}&rdquo;
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Household Manual</h5>
                       <div className="p-6 rounded-3xl bg-slate-50 text-slate-600 text-[13px] font-medium leading-relaxed border border-slate-100 whitespace-pre-line">
                          {f.householdManual}
                       </div>
                    </div>
                    <div>
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 ml-1">Family Biography</h5>
                        <div className="p-6 rounded-3xl bg-slate-50 text-slate-600 text-[13px] font-medium leading-relaxed border border-slate-100">
                          {f.bio}
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div>
              <div className="flex items-center justify-between mb-6 px-4">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Child Roster ({householdChildren.length})</h4>
                 <div className="h-px bg-slate-100 flex-1 mx-6" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {householdChildren.map(child => (
                    <div key={child.id} className="bg-surface-container-lowest p-6 rounded-[2.5rem] shadow-sm border border-outline-variant/10 flex items-center gap-5 hover:border-primary/20 transition-all group">
                       <div className="relative">
                          <img src={child.photoUrl || ""} className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-white group-hover:scale-105 transition-transform" />
                          <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-white shadow-md rounded-lg text-[9px] font-black text-primary border border-slate-100">
                             {child.age}Y
                          </div>
                       </div>
                       <div className="space-y-1">
                          <p className="font-black text-primary font-headline text-lg tracking-tighter">{child.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{child.type}</p>
                          {child.medicalNotes && (
                             <div className="mt-2 flex items-center gap-1.5 text-rose-500 font-bold text-[10px]">
                                <MaterialIcon name="error_outline" className="text-xs" />
                                <span className="uppercase tracking-widest">Medical Alert</span>
                             </div>
                          )}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
