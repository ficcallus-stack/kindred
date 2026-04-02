"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getOrCreateConversation } from "@/app/dashboard/messages/actions";
import { useToast } from "@/components/Toast";
import { MaterialIcon } from "@/components/MaterialIcon";

interface MessageButtonProps {
  recipientId: string;
  className?: string;
  label?: string;
  icon?: string;
}

export default function MessageButton({ 
  recipientId, 
  className = "flex-1 py-3 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all",
  label = "Message",
  icon = "chat_bubble"
}: MessageButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  async function handleMessage() {
    if (loading) return;
    setLoading(true);

    try {
      const conversationId = await getOrCreateConversation(recipientId);
      router.push(`/dashboard/messages/${conversationId}`);
    } catch (error: any) {
      if (error.message.includes("PREMIUM_REQUIRED")) {
        showToast("Premium membership required to message nannies before hiring.", "error");
        router.push("/dashboard/parent/subscription");
      } else {
        showToast(error.message || "Failed to start conversation", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleMessage}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Wait...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && <MaterialIcon name={icon} className="text-sm" fill />}
          {label}
        </span>
      )}
    </button>
  );
}
