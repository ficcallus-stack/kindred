"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { acceptApplication, rejectApplication } from "./actions";
import { useToast } from "@/components/Toast";

interface Applicant {
  id: string;
  jobTitle: string;
  nannyName: string;
  nannyRate: string | null;
  nannyLocation: string | null;
  status: string;
  createdAt: string;
  caregiverId: string;
  message: string | null;
}

export default function ApplicantsPage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  useEffect(() => {
    fetch("/api/applicants")
      .then((r) => r.json())
      .then((data) => {
        setApplicants(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleAccept = (id: string) => {
    startTransition(async () => {
      try {
        await acceptApplication(id);
        setApplicants((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "accepted" } : a))
        );
        showToast("Application accepted!", "success");
      } catch (err: any) {
        showToast(err.message || "Failed to accept", "error");
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      try {
        await rejectApplication(id);
        setApplicants((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: "rejected" } : a))
        );
        showToast("Application rejected", "info");
      } catch (err: any) {
        showToast(err.message || "Failed to reject", "error");
      }
    });
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-slate-100 rounded-xl" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-50 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="font-headline text-4xl font-black text-primary tracking-tighter italic">All Applicants</h1>
        <p className="text-on-surface-variant text-sm font-medium mt-2">{applicants.length} total applications</p>
      </header>

      {/* Feedback Toast - This section is removed as showToast is now used for all feedback */}

      <div className="space-y-6">
        {applicants.length > 0 ? applicants.map((app) => (
          <div key={app.id} className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/5 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="font-black text-2xl text-primary">{app.nannyName.charAt(0)}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-headline text-xl font-black text-primary tracking-tight">{app.nannyName}</h3>
                  <span className={cn(
                    "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                    app.status === "pending" ? "bg-secondary/10 text-secondary"
                    : app.status === "accepted" ? "bg-green-100 text-green-700"
                    : "bg-red-50 text-red-500"
                  )}>
                    {app.status}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm opacity-60">
                  Applied for: <span className="text-primary font-bold italic">{app.jobTitle}</span>
                </p>
                {app.message && (
                  <p className="text-on-surface-variant text-sm italic opacity-70 line-clamp-2 mt-2">&ldquo;{app.message}&rdquo;</p>
                )}
                <div className="flex items-center gap-6 pt-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MaterialIcon name="payments" className="text-lg" />
                    ${app.nannyRate || "N/A"}/hr
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <MaterialIcon name="location_on" className="text-lg" />
                    {app.nannyLocation || "Not specified"}
                  </span>
                </div>
              </div>
              <div className="flex gap-3 w-full md:w-auto shrink-0">
                {app.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleAccept(app.id)}
                      disabled={isPending}
                      className="flex-1 md:flex-none px-6 py-3 bg-green-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-green-700 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 justify-center"
                    >
                      <MaterialIcon name="check" className="text-lg" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      disabled={isPending}
                      className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-600 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 justify-center"
                    >
                      <MaterialIcon name="close" className="text-lg" />
                      Reject
                    </button>
                  </>
                )}
                {app.status === "accepted" && (
                  <Link
                    href={`/dashboard/parent/bookings?caregiverId=${app.caregiverId}`}
                    className="flex-1 md:flex-none px-6 py-3 bg-primary text-white font-black uppercase tracking-widest text-[10px] rounded-2xl hover:brightness-110 transition-all active:scale-95 flex items-center gap-2 justify-center shadow-lg"
                  >
                    <MaterialIcon name="event_available" className="text-lg" />
                    Create Booking
                  </Link>
                )}
                <Link
                  href={`/nannies/${app.caregiverId}`}
                  className="flex-1 md:flex-none px-6 py-3 bg-surface-container-low text-primary font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-surface-container-high transition-all text-center"
                >
                  View Profile
                </Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 italic">
            <MaterialIcon name="person_search" className="text-7xl mb-6" />
            <p className="font-headline font-bold text-2xl text-primary">No applicants yet</p>
            <p className="text-sm">Post a job to start receiving applications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
