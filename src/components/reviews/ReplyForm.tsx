"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";
import { replyToReview } from "@/app/dashboard/reviews/actions";

export function ReplyForm({ reviewId, onSuccess }: { reviewId: string; onSuccess: () => void }) {
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsSubmitting(true);
    try {
      await replyToReview({ reviewId, replyText });
      showToast("Reply posted successfully", "success");
      onSuccess();
    } catch (error: any) {
      showToast(error.message || "Failed to post reply", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <input
        type="text"
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a public reply..."
        className="flex-1 bg-surface border border-outline-variant/30 rounded-2xl px-6 py-3 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
        disabled={isSubmitting}
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
      >
        {isSubmitting ? "Posting..." : "Reply"}
      </button>
      <button
        type="button"
        onClick={onSuccess}
        className="bg-surface-container-high text-on-surface px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-surface-container-highest transition-all"
      >
        Cancel
      </button>
    </form>
  );
}
