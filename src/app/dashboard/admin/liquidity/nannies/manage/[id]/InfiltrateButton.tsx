"use client";

import { useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { infiltrateGhost } from "../actions";

export default function InfiltrateButton({ uid }: { uid: string }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();

  const handleInfiltrate = () => {
    startTransition(async () => {
      try {
        await infiltrateGhost(uid);
        // Server will set cookie and we redirect the client
        window.location.href = "/dashboard/nanny";
      } catch (err: any) {
        showToast(err.message || "Infiltration failed", "error");
      }
    });
  };

  return (
    <button
      onClick={handleInfiltrate}
      disabled={isPending}
      className="w-full py-4 bg-primary text-white text-[10px] uppercase font-black tracking-widest rounded-2xl hover:bg-secondary transition-all active:scale-95 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 relative z-10 disabled:opacity-50"
    >
      {isPending ? (
        <MaterialIcon name="hourglass_empty" className="animate-spin text-sm" />
      ) : (
        <MaterialIcon name="visibility_off" className="text-sm" />
      )}
      {isPending ? "Connecting..." : "Ghost Protocol // Infiltrate"}
    </button>
  );
}
