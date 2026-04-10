"use client";

import { useState, useEffect, useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { getGhostFamilies, deleteFamiliesBatch } from "./actions";

export default function ManageFamiliesPage() {
  const [ghosts, setGhosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  
  const [sortBy, setSortBy] = useState<"recent" | "bookings" | "children">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const LIMIT = 30;

  useEffect(() => {
    fetchFamilies();
  }, [page, sortBy]);

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const { ghosts: data, totalCount: total } = await getGhostFamilies({
        page,
        limit: LIMIT,
        search: searchQuery,
        sortBy
      });
      setGhosts(data);
      setTotalCount(total);
    } catch (err: any) {
      showToast("Failed to fetch families", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchFamilies();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Permanently destroy selected Family accounts? This will wipe Firebase Auth, Children, and Profile records.")) return;
    
    startTransition(async () => {
      try {
        const res = await deleteFamiliesBatch(selectedIds);
        if (res.skippedCount > 0) {
          showToast(`Deleted ${res.deletedCount}. Skipped ${res.skippedCount} (Dependencies detected)`, "info");
        } else {
          showToast(`Successfully wiped ${res.deletedCount} families`, "success");
        }
        setSelectedIds([]);
        await fetchFamilies();
      } catch (err) {
        showToast("Batch deletion failed", "error");
      }
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === ghosts.length && ghosts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ghosts.map(g => g.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const totalPages = Math.ceil(totalCount / LIMIT);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Family Command Roster</h2>
          <p className="text-on-surface-variant font-medium mt-1 text-sm">
            Monitor and mass-control the synthetic family liquidity fleet.
          </p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Name or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>

          <div className="flex gap-1 bg-surface-container-lowest p-1.5 rounded-xl shadow-sm border border-outline-variant/5 text-[10px] font-black uppercase tracking-widest">
            {["recent", "bookings", "children"].map((option: any) => (
              <button 
                key={option}
                onClick={() => setSortBy(option)}
                className={`px-3 py-1.5 rounded-lg transition-all ${sortBy === option ? "bg-primary text-white" : "text-slate-400 hover:text-primary"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/5 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <MaterialIcon name="refresh" className="animate-spin text-primary text-3xl" />
          </div>
        ) : ghosts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <MaterialIcon name="house" className="text-4xl text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No synthetic families found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-outline-variant/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="p-4 pl-6 w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      checked={selectedIds.length === ghosts.length && ghosts.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4">Household Identity</th>
                  <th className="p-4">Telemetry</th>
                  <th className="p-4">Tier</th>
                  <th className="p-4 text-right pr-6">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {ghosts.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6 text-center">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                        checked={selectedIds.includes(g.id)}
                        onChange={() => toggleSelectOne(g.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={g.profileImageUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                          <p className="font-bold text-primary font-headline tracking-tighter">{g.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono italic">{g.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-[11px] font-bold text-primary">{g.childCount}</p>
                          <p className="text-[8px] uppercase tracking-widest text-slate-400">Children</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] font-bold text-slate-400">{g.bookingsCount}</p>
                          <p className="text-[8px] uppercase tracking-widest text-slate-400">Bookings</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${g.tier === 'elite' ? 'bg-amber-100 text-amber-600' : g.tier === 'plus' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                        {g.tier || 'Free'}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        href={`/dashboard/admin/liquidity/families/manage/${g.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <MaterialIcon name="chevron_right" className="text-sm" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="p-4 bg-slate-50 border-t border-outline-variant/10 flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Page <span className="text-primary">{page}</span> of {totalPages || 1}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="px-4 py-2 border border-outline-variant/20 rounded-xl text-[10px] font-black uppercase tracking-widest enabled:hover:bg-primary enabled:hover:text-white transition-all disabled:opacity-30"
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  className="px-4 py-2 border border-outline-variant/20 rounded-xl text-[10px] font-black uppercase tracking-widest enabled:hover:bg-primary enabled:hover:text-white transition-all disabled:opacity-30"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#000716]/90 backdrop-blur-xl border border-white/10 shadow-2xl p-3 pr-6 rounded-3xl flex items-center gap-6">
            <div className="flex items-center gap-3 pl-4 pr-6 border-r border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                {selectedIds.length}
              </div>
              <span className="text-white/70 font-black text-[10px] uppercase tracking-[0.2em] w-12 leading-tight">Families Sel.</span>
            </div>
            <button 
                onClick={handleBatchDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold text-xs"
            >
                <MaterialIcon name="delete_forever" className="text-[16px]" />
                Erase Synthetic Records
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
