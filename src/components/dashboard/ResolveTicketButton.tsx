"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { resolveSupportTicket } from "@/app/dashboard/moderator/support/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ResolveTicketButtonProps {
  conversationId: string;
}

export function ResolveTicketButton({ conversationId }: ResolveTicketButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResolve = async () => {
    if (!confirm("Are you sure you want to mark this issue as resolved? This will archive the chat and notify the user.")) return;
    
    setLoading(true);
    try {
      await resolveSupportTicket(conversationId);
      router.push("/dashboard/moderator/support");
      router.refresh();
    } catch (err) {
      alert("Failed to resolve ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleResolve}
      disabled={loading}
      className={cn(
        "px-4 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/10",
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      <MaterialIcon name={loading ? "sync" : "check_circle"} className={cn("text-sm", loading && "animate-spin")} />
      {loading ? "Resolving..." : "Mark Resolved"}
    </button>
  );
}
