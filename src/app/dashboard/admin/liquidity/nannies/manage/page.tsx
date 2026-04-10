"use client";

import { useState, useEffect, useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { getGhostNannies, toggleGhostVisibility, toggleGhostVisibilityBatch, deleteGhostsBatch } from "./actions";

export default function ManageGhostsPage() {
  const [ghosts, setGhosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  
  const [sortBy, setSortBy] = useState<"recent" | "bookings" | "messages">("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterHasMessages, setFilterHasMessages] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const LIMIT = 30;

  useEffect(() => {
    fetchGhosts();
  }, [page, sortBy, filterHasMessages]);

  const fetchGhosts = async () => {
    setLoading(true);
    try {
      const { ghosts: data, totalCount: total } = await getGhostNannies({
        page,
        limit: LIMIT,
        search: searchQuery,
        sortBy,
        filterHasMessages
      });
      setGhosts(data);
      setTotalCount(total);
    } catch (err: any) {
      showToast("Failed to fetch ghosts", "error");
    } finally {
      setLoading(false);
    }
  };

  // Reset page when search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchGhosts();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggle = (id: string, currentOnline: boolean) => {
    startTransition(async () => {
      try {
        await toggleGhostVisibility(id, !currentOnline);
        showToast(`Ghost ${!currentOnline ? 'Online' : 'Offline'}`, "success");
        await fetchGhosts(); // Reload
      } catch (err) {
        showToast("Action failed", "error");
      }
    });
  };

  const handleBatchToggle = (isOnline: boolean) => {
    if (selectedIds.length === 0) return;
    startTransition(async () => {
      try {
        await toggleGhostVisibilityBatch(selectedIds, isOnline);
        showToast(`Batch updated to ${isOnline ? 'Online' : 'Offline'}`, "success");
        setSelectedIds([]);
        await fetchGhosts();
      } catch (err) {
        showToast("Batch action failed", "error");
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm("Permanently destroy selected Ghost accounts? This will wipe Firebase Auth and Database records.")) return;
    
    startTransition(async () => {
      try {
        const res = await deleteGhostsBatch(selectedIds);
        if (res.skippedCount > 0) {
          showToast(`Deleted ${res.deletedCount}. Skipped ${res.skippedCount} (Active Bookings detected)`, "info");
        } else {
          showToast(`Successfully wiped ${res.deletedCount} ghosts`, "success");
        }
        setSelectedIds([]);
        await fetchGhosts();
      } catch (err) {
        showToast("Batch deletion crashed", "error");
      }
    });
  };

  const filteredGhosts = ghosts.filter(g => {
    let matches = true;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      matches = g.fullName.toLowerCase().includes(q) || g.id.toLowerCase().includes(q) || g.email.toLowerCase().includes(q);
    }
    if (filterHasMessages && matches) {
      matches = (g.messageCount || 0) > 0;
    }
    return matches;
  });

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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-32 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Ghost Command Roster</h2>
          <p className="text-on-surface-variant font-medium mt-1">
            Monitor and mass-control the synthetic liquidity fleet.
          </p>
        </div>
        
        <div className="flex gap-2">
          {/* Search Input */}
          <div className="relative">
            <MaterialIcon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search Name or UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-slate-400"
            />
          </div>

          <div className="flex gap-1 bg-surface-container-lowest p-1.5 rounded-xl shadow-sm border border-outline-variant/5">
            <button 
              onClick={() => setSortBy("recent")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === "recent" ? "bg-primary text-white" : "text-slate-400 hover:text-primary"}`}
            >
              Recent
            </button>
            <button 
              onClick={() => setSortBy("bookings")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === "bookings" ? "bg-primary text-white" : "text-slate-400 hover:text-primary"}`}
            >
              Bookings
            </button>
            <button 
              onClick={() => setSortBy("messages")}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === "messages" ? "bg-primary text-white" : "text-slate-400 hover:text-primary"}`}
            >
              Messages
            </button>
            
            <div className="w-px h-4 bg-slate-200 self-center mx-1" />

            <button 
              onClick={() => setFilterHasMessages(!filterHasMessages)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${filterHasMessages ? "bg-emerald-500 text-white shadow-emerald-200" : "text-slate-400 hover:text-emerald-500"}`}
            >
              <MaterialIcon name={filterHasMessages ? "chat_bubble" : "chat_bubble_outline"} className="text-sm" />
              Engagement Only
            </button>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/5 overflow-hidden relative">
        {loading ? (
          <div className="p-12 flex justify-center">
            <MaterialIcon name="refresh" className="animate-spin text-primary text-3xl" />
          </div>
        ) : ghosts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <MaterialIcon name="group_off" className="text-4xl text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No synthetic accounts found matching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-outline-variant/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <th className="p-4 pl-6 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      checked={selectedIds.length === ghosts.length && ghosts.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="p-4">Identity</th>
                  <th className="p-4">Telemetry</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Command</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {ghosts.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <input 
                        type="checkbox" 
                        className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                        checked={selectedIds.includes(g.id)}
                        onChange={() => toggleSelectOne(g.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={g.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${g.fullName}`} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                        <div>
                          <p className="font-bold text-primary font-headline tracking-tighter">{g.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-medium font-mono">{g.id.substring(0,8)}...{g.id.slice(-4)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-primary">{g.bookingsCount}</p>
                          <p className="text-[8px] uppercase tracking-widest text-slate-400">Books</p>
                        </div>
                        <div className="text-center">
                          <p className={`text-[10px] font-bold ${g.messageCount > 0 ? "text-emerald-600" : "text-slate-400"}`}>{g.messageCount || 0}</p>
                          <p className="text-[8px] uppercase tracking-widest text-slate-400">Msgs</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => handleToggle(g.id, g.availability?.isOnline)}
                        disabled={isPending}
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${g.availability?.isOnline ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'}`}
                      >
                        {g.availability?.isOnline ? 'Active' : 'Offline'}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link 
                        href={`/dashboard/admin/liquidity/nannies/manage/${g.id}`}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <MaterialIcon name="chevron_right" className="text-sm" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50 border-t border-outline-variant/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Page <span className="text-primary">{page}</span> of <span className="text-primary">{totalPages || 1}</span>
                </p>
                <div className="w-1 h-1 rounded-full bg-slate-300" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Total <span className="text-primary">{totalCount}</span> Profiles
                </p>
              </div>

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

      {/* Floating Execution Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-[#000716]/90 backdrop-blur-xl border border-white/10 shadow-2xl p-3 pr-6 rounded-3xl flex items-center gap-6">
            <div className="flex items-center gap-3 pl-4 pr-6 border-r border-white/10">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-sm">
                {selectedIds.length}
              </div>
              <span className="text-white/70 font-black text-[10px] uppercase tracking-[0.2em] w-12 leading-tight">Ghosts Sel.</span>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleBatchToggle(true)}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all font-bold text-xs"
              >
                <MaterialIcon name="cloud_upload" className="text-[16px]" />
                Go Active
              </button>
              
              <button 
                onClick={() => handleBatchToggle(false)}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-white transition-all font-bold text-xs"
              >
                <MaterialIcon name="cloud_off" className="text-[16px]" />
                Go Dark
              </button>

              <div className="w-px h-6 bg-white/10 mx-1 border-r border-black/50 shadow-inner"></div>

              <button 
                onClick={handleBatchDelete}
                disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-bold text-xs"
              >
                <MaterialIcon name="delete_forever" className="text-[16px]" />
                Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
