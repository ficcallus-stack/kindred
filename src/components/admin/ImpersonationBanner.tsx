"use client";

import { useTransition, useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { revertImpersonation } from "@/app/dashboard/admin/liquidity/nannies/manage/actions";
import { useRouter } from "next/navigation";

export default function ImpersonationBanner({ isImpersonating }: { isImpersonating: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isImpersonating) return null;

  const handleRevert = () => {
    startTransition(async () => {
      try {
        await revertImpersonation();
        window.location.reload();
      } catch (err) {
        console.error("Failed to revert impersonation", err);
      }
    });
  };

  return (
    <div className="bg-rose-600 text-white px-4 py-2 flex items-center justify-between sticky top-0 z-[100] shadow-md border-b-[3px] border-rose-800 animate-in slide-in-from-top-4">
      <div className="flex items-center gap-3">
        <div className="bg-rose-800 rounded-full w-8 h-8 flex items-center justify-center animate-pulse">
          <MaterialIcon name="visibility_off" className="text-white text-sm" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.2em] leading-none mb-0.5">Ghost Protocol Active</p>
          <p className="text-[10px] font-medium opacity-80 leading-none">You are currently impersonating a user.</p>
        </div>
      </div>

      <button
        onClick={handleRevert}
        disabled={isPending}
        className="px-5 py-2 bg-white text-rose-700 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-rose-50 transition-all active:scale-95 disabled:opacity-50"
      >
        {isPending ? "Reverting..." : "Return to Admin"}
      </button>
    </div>
  );
}
