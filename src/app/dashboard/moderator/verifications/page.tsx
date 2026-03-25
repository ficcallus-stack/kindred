"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

const QUEUE_ITEMS = [
  {
    id: "KC-4921",
    name: "Elena Rodriguez",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAaS54rdXSVvH0Oz7_eCrA4BImx65aq_RS3oo26h5xu2G18GPnh8YStXmQwgJ1709Hvu6BhW0KIzap1_L-rzUVmsMeslmeW5fMM_e1WLsfnFX1FUZCsuKXX-Mn9wcM590BzUyYCuS4KY-AWr8iWnTlW9QeNARZ1DfggRmoOu-JAkk3pzmvzuhVu6uCDsmlm4NWRBtevEh0UpUzIJvHUtlvA7vQcbKUslHlNTTcmkXKm1XfaxSwCl254LAgBUwp_8ZgPv5JrHGy-l0M",
    date: "Oct 24, 2023",
    time: "2 hours ago",
    identity: "Approved",
    background: "In Review",
    references: "Pending",
    priority: "High",
    premium: true,
  },
  {
    id: "KC-5012",
    name: "Marcus Chen",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCuqJn7DISAb0qMVMKUVoqs_rY3oVwi-3u0Vhz_R_O6o5R2dVtAVn15P4ZCsvU-aphT8YpwsFLnr8a9fYWNBifETns0r0IjubNqqO_cPRgkmujIoU6pNjLuWn_IIwgFkYeI4YbosymA43n8-VprnX15Nx0v7DzqKisw01tJfkZ0scXjkCRtSb7oUAjsFBHYdQMoLO0vPpubdoTLdY9UFabfYwiPm5Otgl7xJ4ZouOQXPuFJbST_aOFzSLPOCuDVAEzo_xUHE-bih0w",
    date: "Oct 23, 2023",
    time: "1 day ago",
    identity: "Action Required",
    background: "Pending",
    references: "Pending",
    priority: "Normal",
    premium: false,
  },
  {
    id: "KC-4890",
    name: "Sarah Thompson",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDohCeUKpHvuGqCl2dd8WuZc3rbS6TebM1WpJjvD2T0OEHvReX_-P0dlc1NjMCW5qUvRPgxKT5nmayzDeK1xmRl2uH6RwUFV7tqR8svDzPAQGm3ilgJx_s9cWCBechGHC38aBajP0D90nzrEnScG-SdNrHGNF7oD1lx5QwPjI2xJyVL0S0D5sGyg3J7PTu3pDITj5ndFlo5OvH3e0HtRffoRBJBJRGm3S5SozRGiZftueZYv81fr9z3dG8PAc_17HXakZ_-lihER5g",
    date: "Oct 23, 2023",
    time: "1 day ago",
    identity: "In Review",
    background: "In Review",
    references: "Approved",
    priority: "Normal",
    premium: false,
  },
];

export default function VerificationsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-extrabold text-primary font-headline tracking-tight">Verification Queue</h2>
          <p className="text-on-surface-variant mt-1 max-w-lg">Manage and review pending safety certifications for Kindred Care caregivers and families.</p>
        </div>

        {/* Priority Stats Bento */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-primary/5 border border-outline-variant/10 p-4 rounded-xl flex flex-col justify-between shadow-sm min-w-[140px]">
            <span className="text-primary text-xs font-bold uppercase tracking-wider">Critical</span>
            <span className="text-primary text-3xl font-black mt-1 font-headline">12</span>
          </div>
          <div className="bg-amber-50 border border-outline-variant/10 p-4 rounded-xl flex flex-col justify-between shadow-sm min-w-[140px]">
            <span className="text-amber-800 text-xs font-bold uppercase tracking-wider">In Review</span>
            <span className="text-amber-600 text-3xl font-black mt-1 font-headline">48</span>
          </div>
          <div className="bg-slate-50 border border-outline-variant/10 p-4 rounded-xl flex flex-col justify-between shadow-sm min-w-[140px] hidden sm:flex">
            <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Pending</span>
            <span className="text-slate-800 text-3xl font-black mt-1 font-headline">124</span>
          </div>
        </div>
      </div>

      {/* Main Queue Layout */}
      <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/5">
        {/* Filter & Tab Bar */}
        <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-surface-container">
          <div className="flex p-1 bg-surface-container-low rounded-xl">
            <button className="px-6 py-2 text-sm font-semibold rounded-lg bg-white shadow-sm text-primary transition-all">Nanny Verifications</button>
            <button className="px-6 py-2 text-sm font-medium text-on-surface-variant hover:text-primary transition-all">Family Verifications</button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-all">
              <MaterialIcon name="filter_list" className="text-lg" />
              Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-low text-on-surface-variant text-sm font-medium hover:bg-surface-container transition-all">
              <MaterialIcon name="sort" className="text-lg" />
              Sort: Newest
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low/30 border-b border-surface-container">
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">User Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Applied Date</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Identity</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">Background</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-center">References</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">Priority</th>
                <th className="px-6 py-4 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low font-medium">
              {QUEUE_ITEMS.map((item) => (
                <tr key={item.id} className="hover:bg-surface-container-low/30 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img 
                          src={item.avatar} 
                          alt={item.name} 
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all shadow-sm"
                        />
                        {item.premium && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white">
                            <MaterialIcon name="stars" className="text-[10px] font-fill" fill />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-blue-950 text-sm">{item.name}</p>
                        <p className="text-[11px] text-on-surface-variant">ID: #{item.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-on-surface">{item.date}</p>
                    <p className="text-[11px] text-on-surface-variant">{item.time}</p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.identity === "Approved" && "bg-green-50 text-green-700 border border-green-200",
                      item.identity === "In Review" && "bg-blue-50 text-blue-700 border border-blue-200",
                      item.identity === "Action Required" && "bg-red-50 text-red-700 border border-red-200"
                    )}>
                      {item.identity}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.background === "Approved" && "bg-green-50 text-green-700 border border-green-200",
                      item.background === "In Review" && "bg-blue-50 text-blue-700 border border-blue-200",
                      item.background === "Pending" && "bg-slate-50 text-slate-600 border border-slate-200"
                    )}>
                      {item.background}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      item.references === "Approved" && "bg-green-50 text-green-700 border border-green-200",
                      item.references === "In Review" && "bg-blue-50 text-blue-700 border border-blue-200",
                      item.references === "Pending" && "bg-slate-50 text-slate-600 border border-slate-200"
                    )}>
                      {item.references}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.priority === "High" ? "bg-red-500" : "bg-amber-500"
                      )}></div>
                      <span className="text-xs font-bold text-primary">{item.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all shadow-sm">
                      Quick View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
