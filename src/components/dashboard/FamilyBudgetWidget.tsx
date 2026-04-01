"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface FamilyFinancials {
  retainer: number;
  totalOvertime: number;
  grossEarnings: number;
  estimatedTax: number;
  netEarnings: number;
  actualHoursWorked: number;
  currency: string;
}

interface FamilyBudgetWidgetProps {
  financials: FamilyFinancials;
}

export function FamilyBudgetWidget({ financials }: FamilyBudgetWidgetProps) {
  return (
    <div className="bg-white rounded-[3rem] p-10 border border-outline-variant/10 shadow-sm space-y-8 relative overflow-hidden group/budget">
      <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[90px] -z-0"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-1">
          <h3 className="font-headline text-3xl font-black text-primary tracking-tighter leading-none italic uppercase">Monthly Family Budget</h3>
          <p className="text-sm font-medium opacity-60 italic text-on-surface-variant flex items-center gap-2">
            <MaterialIcon name="account_balance" className="text-sm" fill />
            Unified recurring commitments & salary tracker
          </p>
        </div>
        <div className="px-4 py-2 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-3">
             <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white">
                  <MaterialIcon name="calendar_month" className="text-lg" />
             </div>
             <span className="text-xs font-black text-primary uppercase tracking-widest">March 2026</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Main Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 space-y-2 group/card hover:bg-white transition-all">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Fixed Retainers</p>
                  <p className="text-4xl font-black text-primary tracking-tighter italic leading-none">${(financials.retainer / 100).toFixed(0)}</p>
                  <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400">
                       <MaterialIcon name="lock" className="text-xs" fill />
                       <span>Salary Floor</span>
                  </div>
             </div>

             <div className="p-8 bg-surface-container-low rounded-[2.5rem] border border-outline-variant/10 space-y-2 group/card hover:bg-white transition-all">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Overtime Extras</p>
                  <p className="text-4xl font-black text-emerald-600 tracking-tighter italic leading-none">${(financials.totalOvertime / 100).toFixed(0)}</p>
                  <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-600/60">
                       <MaterialIcon name="trending_up" className="text-xs" />
                       <span>Variable Adjustment</span>
                  </div>
             </div>
        </div>

        {/* Total Summary */}
        <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-2xl shadow-primary/20 space-y-6 flex flex-col justify-between">
             <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Total Estimated Cost</p>
                  <p className="text-5xl font-black italic tracking-tighter leading-tight mt-2">${(financials.grossEarnings / 100).toFixed(0)}</p>
             </div>

             <div className="space-y-3 pt-6 border-t border-white/10">
                  <div className="flex justify-between items-center text-[10px] font-bold opacity-70">
                       <span>Tax Withholding Logic</span>
                       <span className="bg-white/20 px-2 py-0.5 rounded-full">ESTIMATED</span>
                  </div>
                  <div className="flex justify-between items-center font-black">
                       <span className="text-xs">Est. Deductions</span>
                       <span className="text-xs">-${(financials.estimatedTax / 100).toFixed(0)}</span>
                  </div>
             </div>
        </div>

      </div>

      <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-200/50 rounded-3xl relative z-10">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <MaterialIcon name="history" />
              </div>
              <p className="text-xs font-bold text-on-surface-variant italic opacity-60">Last reconciliation: Today at 2:00 PM</p>
          </div>
          <button className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline underline-offset-4 decoration-2">
              View Detailed Ledger
          </button>
      </div>

    </div>
  );
}
