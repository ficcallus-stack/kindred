"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function SafetyOpsTab({ data }: { data: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dashboard Header & Top Metrics */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-primary font-headline">Safety & Trust Operations</h2>
          <p className="text-on-surface-variant font-medium">Real-time verification funnel and risk auditing.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white text-primary border border-outline-variant/15 rounded-xl text-sm font-semibold hover:bg-surface-container transition-colors">Export Report</button>
          <button className="px-4 py-2 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/10">Run Audit Scan</button>
        </div>
      </div>

      {/* Bento Grid of Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Review Score</span>
            <MaterialIcon name="grade" className="text-secondary-container" fill />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-primary">{data.reviewScore.toFixed(2)}</span>
            <span className="text-sm font-semibold text-tertiary-container flex items-center gap-1">
              <MaterialIcon name="trending_up" className="text-xs" /> 0.3%
            </span>
          </div>
          <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-secondary-container w-[96.4%]"></div>
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium">Global platform average across {data.reviewCount} ratings.</p>
        </div>

        <div className="md:col-span-1 bg-error-container/30 p-6 rounded-xl shadow-sm border border-error/5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-error">Support Density</span>
            <MaterialIcon name="warning" className="text-error" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-error">{data.ticketDensity.toFixed(1)}%</span>
            <span className="text-sm font-semibold text-error flex items-center gap-1">
              <MaterialIcon name="arrow_upward" className="text-xs" /> 2.1%
            </span>
          </div>
          <div className="flex gap-1 h-2">
            <div className="flex-1 bg-error rounded-full"></div>
            <div className="flex-1 bg-error rounded-full opacity-60"></div>
            <div className="flex-1 bg-error rounded-full opacity-30"></div>
            <div className="flex-1 bg-slate-200 rounded-full"></div>
          </div>
          <p className="text-[10px] text-error font-medium">Critical: High volume detected in 'Payment Disputes'.</p>
        </div>

        <div className="md:col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/10 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Lateness Rate</span>
            <MaterialIcon name="schedule" className="text-primary-container" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-primary">{data.latenessRate}%</span>
            <span className="text-sm font-semibold text-tertiary-container flex items-center gap-1">
              <MaterialIcon name="arrow_downward" className="text-xs" /> 0.2%
            </span>
          </div>
          <div className="text-[10px] space-y-1">
            <div className="flex justify-between"><span>On-time: {100 - data.latenessRate}%</span><span>Target: 99.5%</span></div>
          </div>
        </div>

        <div className="md:col-span-1 bg-tertiary-fixed/20 p-6 rounded-xl shadow-sm border border-tertiary-fixed/30 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-on-tertiary-fixed-variant">Completeness</span>
            <MaterialIcon name="verified_user" className="text-on-tertiary-fixed-variant" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-on-tertiary-fixed">{data.profileCompleteness}%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-full bg-slate-200 h-1 rounded-full">
              <div className="bg-on-tertiary-fixed-variant h-full rounded-full" style={{ width: `${data.profileCompleteness}%` }}></div>
            </div>
          </div>
          <p className="text-[10px] text-on-tertiary-fixed-variant font-medium">Mandatory background checks pending for 450 users.</p>
        </div>
      </div>

      {/* Deep Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-surface-container-lowest p-8 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="text-lg font-bold text-primary font-headline">Verification Funnel Drop-off</h3>
              <p className="text-sm text-on-surface-variant">Identification of friction points in onboarding.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface px-3 py-1.5 rounded-full border border-outline-variant/10">
              Last 30 Days <MaterialIcon name="expand_more" className="text-sm" />
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="w-32 text-right text-xs font-bold text-on-surface-variant">Initial Signup</div>
                <div className="flex-1 bg-primary h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {data.funnel.initialSignup} Users (100%)
                </div>
              </div>
            </div>
            
            <div className="relative mt-8">
              <div className="flex items-center gap-4">
                <div className="w-32 text-right text-xs font-bold text-on-surface-variant">ID Upload</div>
                <div className="w-[72%] bg-primary/80 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {data.funnel.idUpload} ({((data.funnel.idUpload / Math.max(data.funnel.initialSignup, 1)) * 100).toFixed(0)}%)
                </div>
              </div>
            </div>

            <div className="relative mt-8">
              <div className="flex items-center gap-4">
                <div className="w-32 text-right text-xs font-bold text-on-surface-variant">Exam Attempt</div>
                <div className="w-[45%] bg-primary/60 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  {data.funnel.examAttempt} ({((data.funnel.examAttempt / Math.max(data.funnel.initialSignup, 1)) * 100).toFixed(0)}%)
                </div>
              </div>
            </div>

            <div className="relative mt-8">
              <div className="flex items-center gap-4">
                <div className="w-32 text-right text-xs font-bold text-on-surface-variant">Verified Elite</div>
                <div className="w-[12%] bg-secondary-container h-12 rounded-lg flex items-center justify-center text-on-secondary-container font-bold text-sm">
                  {data.funnel.verifiedElite} ({((data.funnel.verifiedElite / Math.max(data.funnel.initialSignup, 1)) * 100).toFixed(0)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-surface-container-low p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Certification Exam Pass Rate</h3>
            <div className="flex items-center justify-center py-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle className="stroke-slate-200" cx="18" cy="18" fill="none" r="16" strokeWidth="3"></circle>
                  <circle className="stroke-primary" cx="18" cy="18" fill="none" r="16" strokeDasharray="100" strokeDashoffset={100 - data.examPassRate} strokeWidth="3"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-extrabold text-primary">{data.examPassRate.toFixed(0)}%</span>
                  <span className="text-[8px] uppercase font-bold text-on-surface-variant">Avg Pass</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary text-white p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary-fixed">Elite Status ROI</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Elite Rate</span>
                  <span>$45/hr</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full">
                  <div className="bg-secondary-container h-full w-[90%] rounded-full"></div>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span>Standard Rate</span>
                  <span>$22/hr</span>
                </div>
                <div className="w-full bg-white/10 h-2 rounded-full">
                  <div className="bg-white/40 h-full w-[45%] rounded-full"></div>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-primary-fixed-dim italic leading-tight">Elite caregivers generate 2.4x more platform fee revenue per booking.</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm">
        <h3 className="text-lg font-bold text-primary font-headline mb-6">Pending Trust Verifications</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-surface-container">
                <th className="pb-4">Caregiver</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Score</th>
                <th className="pb-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {data.pendingQueue.map((p: any) => (
                <tr key={p.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <img src={p.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${p.name}`} className="w-8 h-8 rounded-full" alt="Profile" />
                      <div>
                        <div className="text-sm font-bold">{p.name}</div>
                        <div className="text-[10px] text-on-surface-variant">{p.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 bg-tertiary-fixed text-[10px] font-bold text-on-tertiary-fixed rounded-md uppercase">{p.status}</span>
                  </td>
                  <td className="py-4 font-bold text-sm">{p.score}</td>
                  <td className="py-4 text-right">
                    <button className="text-xs font-bold text-primary hover:text-secondary-container transition-colors">Review Docs</button>
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
