"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface RetainerSettingsProps {
  seriesId: string;
  initialRetainer?: number; // in cents
  initialOvertimeRate?: number; // in cents
  initialTaxWithholding?: boolean;
}

export function RetainerSettings({ seriesId, initialRetainer, initialOvertimeRate, initialTaxWithholding }: RetainerSettingsProps) {
  const [retainer, setRetainer] = useState(initialRetainer ? (initialRetainer / 100).toString() : "2000");
  const [overtimeRate, setOvertimeRate] = useState(initialOvertimeRate ? (initialOvertimeRate / 100).toString() : "35");
  const [taxWithholding, setTaxWithholding] = useState(initialTaxWithholding || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Placeholder for server action: updateRetainerSettings(seriesId, { retainer, overtimeRate, taxWithholding })
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="p-8 bg-surface-container-low rounded-[2rem] border border-outline-variant/10 shadow-sm space-y-6 relative overflow-hidden group/retainer">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px]"></div>
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
           <MaterialIcon name="finance_chip" fill />
        </div>
        <div>
           <h3 className="text-lg font-black text-primary font-headline tracking-tight leading-none italic uppercase">Retainer Settings</h3>
           <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest mt-1">Stage 3 Financials</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-primary/60 px-1">Monthly Salary (Fixed)</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary/30">$</span>
                <input 
                    type="number" 
                    value={retainer}
                    onChange={(e) => setRetainer(e.target.value)}
                    className="w-full bg-white border border-outline-variant/20 rounded-2xl py-3 pl-8 pr-4 font-black text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner"
                />
            </div>
        </div>

        <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-primary/60 px-1">Overtime Rate (per hr)</label>
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary/30">$</span>
                <input 
                    type="number" 
                    value={overtimeRate}
                    onChange={(e) => setOvertimeRate(e.target.value)}
                    className="w-full bg-white border border-outline-variant/20 rounded-2xl py-3 pl-8 pr-4 font-black text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner"
                />
            </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-5 bg-white/50 rounded-2xl border border-outline-variant/10 relative z-10 group/toggle">
         <div className="flex items-center gap-4">
            <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                taxWithholding ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
            )}>
               <MaterialIcon name="account_balance_wallet" fill={taxWithholding} />
            </div>
            <div>
               <p className="text-xs font-black text-primary">Tax Withholding Utility</p>
               <p className="text-[10px] font-bold text-slate-400">Track 15.3% estimated self-employment tax</p>
            </div>
         </div>
         <button 
           onClick={() => setTaxWithholding(!taxWithholding)}
           className={cn(
            "w-12 h-6 rounded-full relative transition-all duration-300",
            taxWithholding ? "bg-amber-500" : "bg-slate-200"
           )}
         >
            <div className={cn(
                "absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300",
                taxWithholding ? "left-7 shadow-lg" : "left-1"
            )}></div>
         </button>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {saving ? (
            <MaterialIcon name="sync" className="animate-spin" />
        ) : (
            <>
               <MaterialIcon name="save_as" fill />
               Update Financial Commitments
            </>
        )}
      </button>

      {taxWithholding && (
        <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 relative z-10 flex items-start gap-4">
             <MaterialIcon name="info" className="text-amber-600 text-lg" fill />
             <p className="text-[10px] font-medium text-amber-900 leading-relaxed opacity-70">
                You decided to enable tax tracking. We will set aside an estimated <strong>15.3%</strong> in the earnings forecast, showing your nanny their true net income.
             </p>
        </div>
      )}
    </div>
  );
}
