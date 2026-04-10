"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { processRetainerBilling } from "@/lib/actions/retainer-billing";
import { useToast } from "@/components/Toast";

interface BillingTriggerProps {
  dueCount: number;
}

export default function BillingTrigger({ dueCount }: BillingTriggerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();

  async function handleRunBilling() {
    if (dueCount === 0) {
      showToast("No series currently due for billing.", "info");
      return;
    }

    if (!confirm(`Are you sure you want to process billing for ${dueCount} families? This will attempt live Stripe charges.`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const results = await processRetainerBilling();
      const successCount = results.filter((r: any) => r.status === "success").length;
      const failCount = results.filter((r: any) => r.status === "failed").length;

      if (failCount > 0) {
        showToast(`Processed ${successCount} successful charges. ${failCount} failed. Check audit logs for details.`, "error");
      } else {
        showToast(`Successfully processed all ${successCount} due retainers.`, "success");
      }
    } catch (error: any) {
      showToast(error.message || "Failed to trigger billing run.", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <button
      onClick={handleRunBilling}
      disabled={isProcessing || dueCount === 0}
      className={`w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg border-2 ${
        dueCount > 0 
          ? "bg-secondary text-primary border-primary shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98]" 
          : "bg-surface-container text-outline border-outline/10 cursor-not-allowed shadow-none"
      }`}
    >
      {isProcessing ? (
        <>
          <div className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          Processing Transactions...
        </>
      ) : (
        <>
          <MaterialIcon name="bolt" className="text-base" fill={dueCount > 0} />
          {dueCount > 0 ? `Trigger Billing Run (${dueCount} Due)` : "No Billing Due Today"}
        </>
      )}
    </button>
  );
}
