import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, nannyProfiles, bookings } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import InfiltrateButton from "./InfiltrateButton";

export default async function GhostControlCenter({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const profile = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      profileImageUrl: users.profileImageUrl,
      isGhost: users.isGhost,
      isPremium: users.isPremium,
      hourlyRate: nannyProfiles.hourlyRate,
      weeklyRate: nannyProfiles.weeklyRate,
      bio: nannyProfiles.bio,
      availability: nannyProfiles.availability,
      bookingsCount: sql<number>`CAST(COUNT(${bookings.id}) AS INTEGER)`
    })
    .from(users)
    .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
    .leftJoin(bookings, eq(bookings.caregiverId, users.id))
    .where(eq(users.id, id))
    .groupBy(users.id, nannyProfiles.id)
    .limit(1);

  if (profile.length === 0 || !profile[0].isGhost) {
    notFound();
  }

  const p = profile[0];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center gap-3">
        <Link href="/dashboard/admin/liquidity/nannies/manage" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary transition-all">
          <MaterialIcon name="arrow_back" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Ghost Control Center</h2>
          <p className="text-on-surface-variant font-medium mt-1 uppercase tracking-widest text-[10px]">ID: {p.id}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column: Identity Card */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/5 text-center flex flex-col items-center relative overflow-hidden">
             {/* Glow */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl opacity-50 pointer-events-none" />

             <img src={p.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.fullName}`} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl mb-6 relative z-10" />
             <h3 className="text-2xl font-black text-primary font-headline tracking-tighter relative z-10">{p.fullName}</h3>
             <p className="text-[11px] font-bold text-slate-400 mt-1 mb-6 relative z-10">{p.email}</p>

             <InfiltrateButton uid={p.id} />
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/5">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Marketplace Metrics</h4>
             <div className="flex items-center justify-between py-3 border-b border-slate-100">
               <span className="text-sm font-bold text-slate-600">Active Bookings</span>
               <span className="text-sm font-black text-primary">{p.bookingsCount}</span>
             </div>
             <div className="flex items-center justify-between py-3">
               <span className="text-sm font-bold text-slate-600">Unread Messages</span>
               <span className="text-sm font-black text-rose-500 animate-pulse">0</span>
             </div>
          </div>
        </div>

        {/* Right Column: Profile Specs */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/5">
           <h4 className="text-[10px] font-black uppercase tracking-widest text-primary/40 mb-6">Synthetic Profile Loadout</h4>
           
           <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hourly Rate</p>
                 <p className="text-2xl font-black text-primary font-headline">${p.hourlyRate}/hr</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Retainer</p>
                 <p className="text-2xl font-black text-primary font-headline">${p.weeklyRate}/wk</p>
              </div>
           </div>

           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Biography</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl border border-slate-100">{p.bio}</p>
           </div>
        </div>

      </div>
    </div>
  );
}
