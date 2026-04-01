"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface EarningsForecast {
  retainer: number;
  totalOvertime: number;
  grossEarnings: number;
  estimatedTax: number;
  netEarnings: number;
  actualHoursWorked: number;
  currency: string;
}

interface EarningsForecasterProps {
  forecast: EarningsForecast;
}

export function EarningsForecaster({ forecast }: EarningsForecasterProps) {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-outline-variant/10 shadow-sm space-y-10 relative overflow-hidden group/forecaster">
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] -z-0 group-hover/forecaster:scale-125 transition-transform duration-1000"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h3 className="font-headline text-3xl font-black text-primary tracking-tighter leading-none italic">Your Forecast</h3>
          <p className="text-sm font-medium opacity-60 italic text-on-surface-variant flex items-center gap-2">
            <MaterialIcon name="verified" className="text-sm text-emerald-600" fill />
            Guaranteed monthly stability hub
          </p>
        </div>
        <div className="text-right">
             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">Stage 3 payroll</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
        
        {/* Main Earnings Card */}
        <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 space-y-6 shadow-sm">
             <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                       <MaterialIcon name="savings" className="text-2xl" fill />
                  </div>
                  <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Gross Monthly</p>
                       <p className="text-3xl font-black text-primary tracking-tighter italic leading-none mt-1">${(forecast.grossEarnings / 100).toFixed(0)}</p>
                  </div>
             </div>

             <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center">
                       <p className="text-xs font-bold text-on-surface-variant/60">Fixed Retainer</p>
                       <p className="text-xs font-black text-primary">${(forecast.retainer / 100).toFixed(0)}</p>
                  </div>
                  <div className="flex justify-between items-center font-bold">
                       <p className="text-xs text-on-surface-variant/60">Overtime Extras</p>
                       <p className="text-xs text-emerald-600">+${(forecast.totalOvertime / 100).toFixed(0)}</p>
                  </div>
                  {forecast.estimatedTax > 0 && (
                     <div className="flex justify-between items-center text-amber-600 font-bold">
                          <p className="text-xs opacity-60">Est. Tax Withholding</p>
                          <p className="text-xs">-${(forecast.estimatedTax / 100).toFixed(0)}</p>
                     </div>
                  )}
             </div>

             <div className="p-5 bg-primary text-white rounded-3xl shadow-xl space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Net Payout Prediction</p>
                  <p className="text-4xl font-black italic tracking-tighter leading-tight">${(forecast.netEarnings / 100).toFixed(0)}</p>
             </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 gap-6">
             <div className="p-6 bg-slate-50 border border-slate-200/50 rounded-[2rem] flex items-center gap-6 group/stat hover:border-primary/20 transition-all">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover/stat:scale-110 transition-transform">
                       <MaterialIcon name="schedule" className="text-2xl" />
                  </div>
                  <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Hours Completed</p>
                       <p className="text-2xl font-black text-primary tracking-tighter leading-none mt-1">{forecast.actualHoursWorked} Hrs</p>
                  </div>
             </div>

             <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-6 group/stat hover:border-emerald-200 transition-all">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm group-hover/stat:scale-110 transition-transform">
                       <MaterialIcon name="security" className="text-2xl" fill />
                  </div>
                  <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/40">Guaranteed Floor</p>
                       <p className="text-2xl font-black text-emerald-900 tracking-tighter leading-none mt-1">${(forecast.retainer / 100).toFixed(0)}</p>
                  </div>
             </div>
        </div>

      </div>

      <div className="flex items-start gap-4 p-5 bg-surface-container text-[11px] font-medium text-on-surface-variant rounded-3xl opacity-60 border border-outline-variant/10 italic">
           <MaterialIcon name="lightbulb" className="text-emerald-600 text-lg shrink-0" fill />
           <span>This forecast is based on your active professional retainers and current verified hours. Payouts are estimated at the start of each billing cycle for maximum financial stability.</span>
      </div>
    </div>
  );
}
