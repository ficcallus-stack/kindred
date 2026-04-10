"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

export default function MarketplaceHealthTab({ data }: { data: any }) {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-secondary font-bold text-xs tracking-widest uppercase mb-2 block">Executive Insights</span>
          <h2 className="text-4xl font-extrabold text-primary tracking-tight leading-none mb-2 font-headline">Marketplace Health</h2>
          <p className="text-on-surface-variant max-w-xl">Deep-dive into the supply-demand dynamics and performance cohorts.</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-secondary-fixed rounded-lg flex items-center justify-center">
              <MaterialIcon name="timer" className="text-on-secondary-fixed" />
            </div>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Avg. Time-to-Hire</p>
          <h3 className="text-3xl font-bold text-primary mt-1">{data.timeToHire} Days</h3>
        </div>

        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-tertiary-fixed rounded-lg flex items-center justify-center">
              <MaterialIcon name="group_add" className="text-on-tertiary-fixed" />
            </div>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Application Density</p>
          <h3 className="text-3xl font-bold text-primary mt-1">{data.appDensity.toFixed(1)} <span className="text-sm font-normal text-slate-400">per job</span></h3>
        </div>

        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-primary-fixed rounded-lg flex items-center justify-center">
              <MaterialIcon name="task_alt" className="text-on-primary-fixed" />
            </div>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Job Fulfillment Rate</p>
          <h3 className="text-3xl font-bold text-primary mt-1">{data.fulfillmentRate.toFixed(1)}%</h3>
        </div>

        <div className="col-span-12 lg:col-span-3 bg-surface-container-lowest p-6 rounded-2xl shadow-sm border border-outline-variant/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 bg-secondary-fixed-dim rounded-lg flex items-center justify-center">
              <MaterialIcon name="repeat" className="text-on-secondary-fixed" />
            </div>
          </div>
          <p className="text-on-surface-variant text-sm font-medium">Retention Rate</p>
          <h3 className="text-3xl font-bold text-primary mt-1">{data.retentionRate}%</h3>
        </div>

        {/* Map */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-primary font-headline">Supply/Demand Ratio by State</h3>
              <p className="text-sm text-on-surface-variant">Real-time heatmapping of active caregiver availability vs job posts.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-6">
              {data.supplyDemand.map((sd: any, idx: number) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{sd.state}</span>
                    <span className="text-on-surface-variant">{sd.ratio} ({sd.status})</span>
                  </div>
                  <div className="h-3 bg-surface-container-low rounded-full overflow-hidden">
                    <div className={`h-full ${sd.color} rounded-full`} style={{ width: `${sd.fillPercent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-slate-100 rounded-xl flex items-center justify-center p-8">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Geo Map Render</span>
            </div>
          </div>
        </div>

        {/* Regions */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/5">
          <h3 className="text-xl font-bold text-primary mb-6 font-headline">Top Yielding Regions</h3>
          <div className="space-y-4">
            {data.yieldRegions.map((yr: any, idx: number) => (
              <div key={idx} className="flex items-center p-4 bg-surface rounded-xl hover:translate-x-2 transition-transform cursor-pointer">
                <span className="text-lg font-bold text-slate-300 w-8">0{idx + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-primary">{yr.region}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-primary">${(yr.volume/1000).toFixed(0)}K</p>
                  <p className="text-[10px] text-tertiary-container font-bold">+{yr.growth}% MoM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
