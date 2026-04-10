"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { adminForceCancelBooking, adminForceCompleteBooking } from "./actions";

interface AdminBookingsClientProps {
  initialData: any;
  currentParams: { page: number; search: string; status: string };
}

export default function AdminBookingsClient({ initialData, currentParams }: AdminBookingsClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Modal States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [adminReason, setAdminReason] = useState("");

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    router.push(`/dashboard/admin/bookings?page=1&search=${currentParams.search}&status=${newStatus}`);
  };

  const executeCancel = async () => {
    if (!selectedBooking || !adminReason) return;
    setIsProcessing(true);
    try {
      await adminForceCancelBooking(selectedBooking.id, adminReason);
      setShowCancelModal(false);
      setAdminReason("");
      router.refresh();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeComplete = async () => {
    if (!selectedBooking || !adminReason) return;
    setIsProcessing(true);
    try {
      await adminForceCompleteBooking(selectedBooking.id, adminReason);
      setShowCompleteModal(false);
      setAdminReason("");
      router.refresh();
    } catch (e: any) {
      alert("Error: " + e.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': case 'paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'cancelled': case 'failed': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-[#1D3557] tracking-tight">Booking Oversight</h1>
        <p className="text-sm text-slate-500 font-medium max-w-2xl">
          Granular control over all platform bookings. Resolve escrow disputes, trigger manual refunds, or force-complete stalled 
          care contracts between Families and Caregivers.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="relative">
          <MaterialIcon name="filter_list" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select 
            value={currentParams.status}
            onChange={handleStatusFilter}
            className="pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#1D3557]/20 appearance-none min-w-[200px]"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 uppercase text-[10px] tracking-widest text-slate-500 font-black">
              <th className="p-4 pl-6">ID & Status</th>
              <th className="p-4">Family / Nanny</th>
              <th className="p-4">Schedule</th>
              <th className="p-4">Financials</th>
              <th className="p-4 text-right pr-6">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {initialData.bookings.map((b: any) => (
              <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4 pl-6">
                  <div className="font-mono text-xs text-slate-500 mb-1">{b.id.split('-')[0]}***</div>
                  <span className={cn("px-2.5 py-1 text-[10px] uppercase tracking-wider font-black rounded-lg border", getStatusColor(b.status))}>
                    {b.status.replace("_", " ")}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-[#1D3557] flex items-center gap-1.5">
                      <MaterialIcon name="family_restroom" className="text-[14px] text-slate-400" />
                      {b.parent?.fullName || "Deleted User"}
                    </span>
                    <span className="font-bold text-slate-600 flex items-center gap-1.5 pt-1 border-t border-slate-100">
                      <MaterialIcon name="child_care" className="text-[14px] text-slate-400" />
                      {b.caregiver?.fullName || "Deleted User"}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-slate-600 font-medium">
                  <div className="flex items-center gap-1">
                    <MaterialIcon name="calendar_month" className="text-[14px]" />
                    {new Date(b.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 pl-5">
                    {b.hiringMode} • {b.hoursPerDay}h/day
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-black text-[#1D3557]">${(b.totalAmount / 100).toFixed(2)}</span>
                  {b.overtimeAmount > 0 && (
                    <div className="text-[10px] font-bold text-error mt-0.5">
                      +${(b.overtimeAmount / 100).toFixed(2)} OT
                    </div>
                  )}
                  {b.stripePaymentIntentId && (
                    <div className="text-[10px] text-slate-400 font-mono mt-1 w-32 truncate" title={b.stripePaymentIntentId}>
                      {b.stripePaymentIntentId}
                    </div>
                  )}
                </td>
                <td className="p-4 pr-6 text-right">
                  <button 
                    onClick={() => setSelectedBooking(selectedBooking?.id === b.id ? null : b)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors font-bold text-xs"
                  >
                    {selectedBooking?.id === b.id ? "Minimize" : "Inspect"}
                  </button>
                </td>
              </tr>
            ))}
            {initialData.bookings.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">No bookings found for this filter.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Overlay */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in run-in">
          <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-black text-[#1D3557]">Booking Inspector</h2>
                <span className="font-mono text-xs text-slate-500">{selectedBooking.id}</span>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <MaterialIcon name="close" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8 max-h-[60vh] bg-white">
              
              <div className="grid grid-cols-2 gap-8">
                {/* Status Column */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MaterialIcon name="flag" className="text-slate-400" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Current Status</p>
                      <p className="font-bold text-[#1D3557] capitalize">{selectedBooking.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MaterialIcon name="receipt_long" className="text-slate-400" />
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Escrow Hold</p>
                      <p className="font-bold text-[#1D3557]">${(selectedBooking.totalAmount / 100).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking Column */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Check-in</span>
                    <span className="text-xs text-slate-800">{selectedBooking.checkInTime ? new Date(selectedBooking.checkInTime).toLocaleString() : "Pending"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">Check-out</span>
                    <span className="text-xs text-slate-800">{selectedBooking.checkOutTime ? new Date(selectedBooking.checkOutTime).toLocaleString() : "Pending"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-600">Lateness</span>
                    <span className="text-xs font-mono text-error">{selectedBooking.latenessMinutes || 0} mins</span>
                  </div>
                </div>
              </div>

              {/* Resolution Controls */}
              <div className="p-6 bg-rose-50/50 rounded-2xl border border-rose-100">
                <h3 className="text-sm font-black text-rose-900 mb-4 flex items-center gap-2">
                  <MaterialIcon name="gavel" />
                  Administrative Override
                </h3>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => setShowCompleteModal(true)}
                    disabled={selectedBooking.status === "completed" || selectedBooking.status === "cancelled"}
                    className="flex-1 py-3 px-4 bg-white border-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="check_circle" className="text-[18px]" />
                    Force Complete & Release Escrow
                  </button>

                  <button 
                    onClick={() => setShowCancelModal(true)}
                    disabled={selectedBooking.status === "completed" || selectedBooking.status === "cancelled"}
                    className="flex-1 py-3 px-4 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-bold shadow-lg shadow-rose-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="remove_shopping_cart" className="text-[18px]" />
                    Force Cancel & Refund
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      {(showCancelModal || showCompleteModal) && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-[#1D3557] mb-2">
              {showCancelModal ? "Confirm Cancellation & Refund" : "Confirm Completion & Escrow Release"}
            </h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              This is a permanent administrative action. An audit log will be created and affected users will be notified.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1 mb-1 block">
                  Mandatory Audit Reason
                </label>
                <textarea 
                  value={adminReason}
                  onChange={e => setAdminReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#1D3557]/20 outline-none min-h-[100px]"
                  placeholder="E.g., Caregiver no-show, mutual dispute override..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => { setShowCancelModal(false); setShowCompleteModal(false); }}
                  className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Abort
                </button>
                <button 
                  disabled={!adminReason || isProcessing}
                  onClick={showCancelModal ? executeCancel : executeComplete}
                  className={cn(
                    "flex-1 py-3 text-white font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2",
                    showCancelModal ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
                  )}
                >
                  {isProcessing ? "Executing..." : "Confirm Action"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
