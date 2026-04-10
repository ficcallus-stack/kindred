import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { users, nannyProfiles, parentProfiles, jobs, bookings } from "@/db/schema";
import { eq, sql, desc, and } from "drizzle-orm";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";

export const dynamic = 'force-dynamic';

export default async function LiquidityCommandCenter() {
  await requireAdmin();

  // 1. Global Telemetry Gathering
  const [
    nanniesCount,
    parentsCount,
    jobsCount,
    bookingsData
  ] = await Promise.all([
    db.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(users).where(and(eq(users.isGhost, true), eq(users.role, "caregiver"))),
    db.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(users).where(and(eq(users.isGhost, true), eq(users.role, "parent"))),
    db.select({ count: sql<number>`CAST(COUNT(*) AS INTEGER)` }).from(jobs).where(eq(jobs.isSynthetic, true)),
    db.select({ 
      count: sql<number>`CAST(COUNT(${bookings.id}) AS INTEGER)`,
      revenue: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)`
    }).from(bookings).innerJoin(users, eq(bookings.caregiverId, users.id)).where(eq(users.isGhost, true))
  ]);

  const nanniesTotal = nanniesCount[0]?.count || 0;
  const parentsTotal = parentsCount[0]?.count || 0;
  const activeJobs = jobsCount[0]?.count || 0;
  const bookingsTotal = bookingsData[0]?.count || 0;
  const revenueTotal = (bookingsData[0]?.revenue || 0) / 100;

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-primary font-black text-[10px] tracking-[0.3em] uppercase mb-2 block animate-pulse">Root Access</span>
          <h2 className="text-4xl font-extrabold text-primary font-headline tracking-tighter leading-none mb-2">Liquidity Command Center</h2>
          <p className="text-on-surface-variant font-medium max-w-xl">
            Orchestrate the synthetic marketplace. Control the Ghost Fleet, monitor demand stimulation, and engage the Ghost Protocol.
          </p>
        </div>
      </div>

      {/* Global Telemetry Navbar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Fleet Deployment</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-primary font-headline">{nanniesTotal}</span>
            <span className="text-xs font-bold text-slate-400 mb-1">Synthetics</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Stimulated Demand</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-primary font-headline">{parentsTotal}</span>
            <span className="text-xs font-bold text-slate-400 mb-1">Families</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-sm border border-outline-variant/5 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Decoys</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-primary font-headline">{activeJobs}</span>
            <span className="text-xs font-bold text-slate-400 mb-1">Jobs Postings</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-primary-fixed p-6 rounded-3xl shadow-lg shadow-primary/20 relative overflow-hidden">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">Synthetic Conversion</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white font-headline">{bookingsTotal}</span>
            <span className="text-xs font-bold text-white/80 mb-1 italic">/ ${revenueTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Deployment Engines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Nanny Supply Engine */}
        <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/5 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="p-10 border-b border-outline-variant/5 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center">
                <MaterialIcon name="child_care" className="text-secondary text-2xl" />
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Live</span>
            </div>
            <h3 className="text-2xl font-black text-primary font-headline tracking-tighter mb-2">Supply Engine (Nannies)</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              Generate fully-verified synthetic care professionals to populate marketplace searches and absorb early family demand.
            </p>
          </div>

          <div className="p-8 bg-slate-50/50 flex gap-4">
            <Link 
              href="/dashboard/admin/liquidity/nannies/seed" 
              className="flex-1 bg-white border border-slate-200 hover:border-secondary/50 p-4 rounded-2xl flex items-center justify-between group/btn transition-all hover:shadow-md"
            >
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Synthesize Roster</p>
                <p className="text-[10px] text-slate-400 font-medium">JSON Ingestion Protocol</p>
              </div>
              <MaterialIcon name="arrow_forward" className="text-slate-300 group-hover/btn:text-secondary group-hover/btn:translate-x-1 transition-all" />
            </Link>
            
            <Link 
              href="/dashboard/admin/liquidity/nannies/manage" 
              className="flex-1 bg-primary text-white p-4 rounded-2xl flex items-center justify-between group/btn transition-all hover:bg-secondary hover:shadow-lg hover:shadow-secondary/20"
            >
              <div>
                <p className="text-xs font-black text-white uppercase tracking-widest mb-0.5 flex flex-col">Manage Fleet</p>
                <p className="text-[10px] text-white/70 font-medium whitespace-nowrap overflow-x-hidden">Engage Ghost Protocol</p>
              </div>
              <MaterialIcon name="settings_ethernet" className="text-white/70 group-hover/btn:text-white group-hover/btn:rotate-90 transition-all" />
            </Link>
          </div>
        </div>

        {/* Family Demand Engine */}
        <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/5 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="p-10 border-b border-outline-variant/5 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <MaterialIcon name="family_restroom" className="text-indigo-600 text-2xl" />
              </div>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">Active</span>
            </div>
            <h3 className="text-2xl font-black text-primary font-headline tracking-tighter mb-2">Demand Engine (Families)</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              Bulk-initialize high-fidelity family profiles with specific subscription tiers (Plus/Elite) to stimulate platform growth.
            </p>
          </div>

          <div className="p-8 bg-slate-50/50 flex gap-4">
            <Link 
              href="/dashboard/admin/liquidity/families/seed" 
              className="flex-1 bg-white border border-slate-200 hover:border-indigo-400 p-4 rounded-2xl flex items-center justify-between group/btn transition-all hover:shadow-md"
            >
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Synthesize families</p>
                <p className="text-[10px] text-slate-400 font-medium">JSON Synthesis Protocol</p>
              </div>
              <MaterialIcon name="arrow_forward" className="text-slate-300 group-hover/btn:text-indigo-500 group-hover/btn:translate-x-1 transition-all" />
            </Link>
            
            <Link 
              href="/dashboard/admin/liquidity/families/manage" 
              className="flex-1 bg-white border border-slate-200 hover:border-indigo-400 p-4 rounded-2xl flex items-center justify-between group/btn transition-all hover:shadow-md"
            >
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Manage Families</p>
                <p className="text-[10px] text-slate-400 font-medium">Bulk Tier Control</p>
              </div>
              <MaterialIcon name="settings_ethernet" className="text-slate-300 group-hover/btn:text-indigo-500 group-hover/btn:rotate-90 transition-all" />
            </Link>
          </div>
        </div>

        {/* Job Synthesis Engine */}
        <div className="bg-surface-container-lowest rounded-[2.5rem] border border-outline-variant/5 shadow-xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="p-10 border-b border-outline-variant/5 relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center">
                <MaterialIcon name="work_history" className="text-rose-600 text-2xl" />
              </div>
              <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-100">Priority</span>
            </div>
            <h3 className="text-2xl font-black text-primary font-headline tracking-tighter mb-2">Job Synthesis Engine</h3>
            <p className="text-sm font-medium text-slate-500 max-w-sm">
              Deploy synthetic marketplace opportunities. Jobs automatically inherit Featured/Boosted status based on parent tier.
            </p>
          </div>

          <div className="p-8 bg-slate-50/50 flex gap-4">
            <Link 
              href="/dashboard/admin/liquidity/jobs/seed" 
              className="flex-1 bg-white border border-slate-200 hover:border-rose-400 p-4 rounded-2xl flex items-center justify-between group/btn transition-all hover:shadow-md"
            >
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Deploy Job Pool</p>
                <p className="text-[10px] text-slate-400 font-medium">Marketplace Stimulation</p>
              </div>
              <MaterialIcon name="bolt" className="text-slate-300 group-hover/btn:text-rose-500 group-hover/btn:scale-125 transition-all" />
            </Link>
            
            <Link 
              href="/dashboard/admin/liquidity/jobs/manage" 
              className="flex-1 bg-white border border-slate-200 hover:border-rose-400 p-4 rounded-2xl flex items-center justify-between group/btn transition-all hover:shadow-md"
            >
              <div>
                <p className="text-xs font-black text-primary uppercase tracking-widest mb-0.5">Audit Decoys</p>
                <p className="text-[10px] text-slate-400 font-medium">Open Role Oversight</p>
              </div>
              <MaterialIcon name="settings_ethernet" className="text-slate-300 group-hover/btn:text-rose-500 group-hover/btn:rotate-90 transition-all" />
            </Link>
          </div>
        </div>

      </div>

      {/* Radar */}
      <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] shadow-sm border border-outline-variant/5">
        <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/10 pb-6">
          <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
            <MaterialIcon name="radar" className="text-rose-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-black text-primary font-headline tracking-tight">Ghost Activity Radar</h3>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Monitoring real-world interactions</p>
          </div>
        </div>

        <div className="text-center py-12">
           <MaterialIcon name="mark_email_read" className="text-4xl text-slate-200 mb-3" />
           <p className="text-sm font-bold text-slate-400">No urgent messages requiring impersonation.</p>
           <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-1">Illusion heavily sustained.</p>
        </div>
      </div>

    </div>
  );
}
