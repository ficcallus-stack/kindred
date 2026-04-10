"use client";

import { useTransition } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";
import { infiltrateFamily } from "../actions";

export default function InfiltrateButton({ uid }: { uid: string }) {
  const [isPending, startTransition] = useTransition();
  const { showToast } = useToast();
  const router = useRouter();

  const handleInfiltrate = () => {
    startTransition(async () => {
      try {
        await infiltrateFamily(uid);
        showToast("Ghost Protocol Active: Impersonating Parent", "success");
        // Redirect to parent dashboard
        router.push("/dashboard/parent");
        router.refresh();
      } catch (err: any) {
        showToast(err.message || "Infiltration failed", "error");
      }
    });
  };

  return (
    <button
      onClick={handleInfiltrate}
      disabled={isPending}
      className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 hover:bg-secondary transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 group"
    >
      <MaterialIcon name="vpn_key" className={`text-sm group-hover:rotate-12 transition-transform ${isPending ? 'animate-pulse' : ''}`} />
      {isPending ? "Syncing Identity..." : "Infiltrate Household"}
    </button>
  );
}
