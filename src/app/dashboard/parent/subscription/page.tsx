"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import { createSubscriptionSession, getSubscriptionStatus } from "@/lib/actions/subscription";
import { getBookingSeries } from "@/app/dashboard/parent/care-team/actions";
import { useToast } from "@/components/Toast";
import { formatCurrency, cn } from "@/lib/utils";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState<"month" | "year" | null>(null);
  const [series, setSeries] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const [seriesData, subData] = await Promise.all([
          getBookingSeries(),
          getSubscriptionStatus()
        ]);
        setSeries(seriesData);
        setSubscription(subData);
      } catch (error) {
        console.error("Failed to fetch billing data", error);
      } finally {
        setDataLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleSubscribe(tier: "plus" | "elite") {
    setLoading(tier === "plus" ? "month" : "year"); // Reuse loading state for simplicity or update it
    try {
      const { url } = await createSubscriptionSession(tier);
      if (url) window.location.href = url;
    } catch (error: any) {
      showToast(error.message || "Failed to start checkout session", "error");
      setLoading(null);
    }
  }

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <style jsx global>{`
        .editorial-shadow {
          box-shadow: 0 32px 64px -12px rgba(3, 31, 65, 0.06);
        }
      `}</style>

      <main className="pt-24 pb-20">
        <section className="px-8 max-w-7xl mx-auto space-y-16">
          {/* Header */}
          <div className="space-y-4">
            <h1 className="font-headline text-5xl font-extrabold text-primary italic tracking-tighter">
              Billing & <span className="text-secondary">Commitments</span>
            </h1>
            <p className="text-on-surface-variant font-medium opacity-70">Elevate your family's care with our professional subscription tiers.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Premium Membership */}
            <div className="lg:col-span-12 space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kindred Plus Card */}
                <div className={cn(
                  "bg-white rounded-[3rem] p-10 editorial-shadow border border-outline-variant/10 relative overflow-hidden transition-all",
                  subscription?.subscriptionTier === "plus" && "ring-2 ring-primary bg-primary/5"
                )}>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          <MaterialIcon name="verified_user" fill />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold font-headline text-primary italic">Kindred Plus</h2>
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Verified Access</p>
                        </div>
                      </div>
                      {subscription?.subscriptionTier === "plus" && (
                        <span className="bg-primary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Current Plan</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-headline font-black text-primary tracking-tighter">$29</span>
                        <span className="text-sm font-medium text-on-surface-variant">/mo</span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-medium">Essential professional discovery & messaging.</p>
                    </div>

                    <ul className="space-y-4 pt-6 border-t border-outline-variant/10">
                      {["Unlimited Real-time Messaging", "Professional Priority Access", "Zero Service Fees", "Basic Job Posting"].map(benefit => (
                        <li key={benefit} className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                          <MaterialIcon name="check_circle" className="text-primary/40 text-sm" fill />
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handleSubscribe("plus")}
                      disabled={!!loading || subscription?.subscriptionTier === "plus" || subscription?.subscriptionTier === "elite"}
                      className={cn(
                        "w-full py-4 rounded-2xl font-headline font-black text-[12px] uppercase tracking-widest transition-all",
                        subscription?.subscriptionTier === "plus"
                          ? "bg-primary/10 text-primary cursor-default"
                          : subscription?.subscriptionTier === "elite"
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-primary text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-primary/20"
                      )}
                    >
                      {subscription?.subscriptionTier === "plus" ? "Current Plan" : subscription?.subscriptionTier === "elite" ? "Elite Inclusive" : "Upgrade to Plus"}
                    </button>
                  </div>
                </div>

                {/* Kindred Elite Card */}
                <div className={cn(
                  "bg-primary rounded-[3rem] p-10 editorial-shadow border border-white/10 relative overflow-hidden transition-all text-white",
                  subscription?.subscriptionTier === "elite" && "ring-4 ring-secondary"
                )}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary">
                          <MaterialIcon name="diamond" fill />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold font-headline italic">Kindred Elite</h2>
                          <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">Full Power Membership</p>
                        </div>
                      </div>
                      {subscription?.subscriptionTier === "elite" && (
                        <span className="bg-secondary text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Active</span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-baseline gap-1 focus-ring">
                        <span className="text-5xl font-headline font-black tracking-tighter">$59</span>
                        <span className="text-sm font-medium text-white/60">/mo</span>
                      </div>
                      <p className="text-xs text-white/70 font-medium">For families who demand the best.</p>
                    </div>

                    <ul className="space-y-4 pt-6 border-t border-white/10">
                      {[
                        "Automatic Job Boosting ($19/post value)", 
                        "Featured Professional Priority", 
                        "Direct Concierge Support", 
                        "Unlimited Messaging & Reports"
                      ].map(benefit => (
                        <li key={benefit} className="flex items-center gap-2 text-xs font-medium">
                          <MaterialIcon name="verified" className="text-secondary text-sm" fill />
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <button 
                      onClick={() => handleSubscribe("elite")}
                      disabled={!!loading || subscription?.subscriptionTier === "elite"}
                      className={cn(
                        "w-full py-4 rounded-2xl font-headline font-black text-[12px] uppercase tracking-widest transition-all",
                        subscription?.subscriptionTier === "elite"
                          ? "bg-white/10 text-white cursor-default"
                          : "bg-white text-primary hover:bg-secondary hover:text-white hover:scale-[1.02] active:scale-95 shadow-xl shadow-black/20"
                      )}
                    >
                      {subscription?.subscriptionTier === "elite" ? "Current Plan" : "Upgrade to Elite"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Safety & Vetting Callout */}
              <div className="bg-primary p-12 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl">
                 <div className="relative z-10 space-y-6">
                    <h3 className="text-3xl font-headline font-black italic tracking-tighter">Your family's peace of mind is our priority.</h3>
                    <p className="text-white/60 text-sm leading-relaxed max-w-md">Our continuous monitoring system alert us 24/7 to any changes in your caregiver's background status.</p>
                 </div>
                 <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
              </div>
            </div>

            {/* Right Column: Care Team Commitments */}
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-white rounded-[3rem] editorial-shadow border border-outline-variant/10 overflow-hidden">
                <div className="p-10 bg-surface-container-highest/20 border-b border-outline-variant/10">
                  <h3 className="text-xl font-bold font-headline text-primary italic">Active Care Commitments</h3>
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Recurring Monthly Retainers</p>
                </div>

                <div className="p-8 space-y-6">
                  {dataLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin"></div>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest animate-pulse">Syncing Vault...</p>
                    </div>
                  ) : series.length > 0 ? (
                    <div className="space-y-4">
                      {series.map(s => (
                        <div key={s.id} className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/5 flex items-center justify-between group hover:border-secondary/30 transition-colors">
                          <div className="space-y-1">
                            <h4 className="font-bold text-primary font-headline italic">{s.caregiverName}</h4>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Next Payment: {s.nextBillingDate}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-black text-secondary font-headline tracking-tight">{formatCurrency(s.retainerAmount || 0)}</p>
                            <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest opacity-50">Monthly Retainer</p>
                          </div>
                        </div>
                      ))}
                      
                      <div className="pt-8 border-t border-outline-variant/10 flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Monthly Commit</span>
                        <span className="text-2xl font-black text-primary font-headline tracking-tight">
                          {formatCurrency(series.reduce((acc, s) => acc + (s.retainerAmount || 0), 0))}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center space-y-6">
                      <div className="w-16 h-16 bg-surface-container-high rounded-3xl flex items-center justify-center mx-auto opacity-40">
                         <MaterialIcon name="pending_actions" className="text-3xl text-on-surface-variant" />
                      </div>
                      <div className="space-y-2">
                        <p className="font-bold text-primary italic">No active retainers</p>
                        <p className="text-xs text-on-surface-variant px-12 leading-relaxed italic opacity-70">
                          Convert an existing trial or hire a caregiver into your Care Team to start recurring care.
                        </p>
                      </div>
                      <Link 
                        href="/dashboard/parent/care-team"
                        className="inline-block px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10"
                      >
                        Browse Care Team
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-8 bg-surface-container rounded-[2.5rem] border border-outline-variant/10 flex items-start gap-5">
                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary flex-shrink-0">
                  <MaterialIcon name="info" fill />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-tight">Automatic Anniversary Billing</h4>
                  <p className="text-[10px] text-on-surface-variant leading-relaxed opacity-70">
                    Retainers are automatically charged to your default payment method on the monthly anniversary of the series start date. You will receive a summary 48 hours prior to every charge.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
