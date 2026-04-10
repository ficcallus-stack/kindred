"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { submitReferenceResponse } from "../actions";

export default function ReferenceResponseClient({ token }: { token: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please provide a star rating.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      await submitReferenceResponse({ token, rating, comment });
      setIsDone(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="py-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MaterialIcon name="verified" className="text-4xl text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-[#000716] mb-2">Thank You!</h2>
        <p className="text-[#44474e]">Your reference has been successfully submitted and verified.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
      
      {/* Star Rating */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-[#000716] uppercase tracking-wider">
          How would you rate their performance?
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="group transition-transform hover:scale-110 active:scale-95"
            >
              <MaterialIcon 
                name={star <= (hoverRating || rating) ? "star" : "star_outline"}
                className={`text-4xl ${
                  star <= (hoverRating || rating) ? "text-[#ffb780]" : "text-[#e3e2e2]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="space-y-4">
        <label className="block text-sm font-bold text-[#000716] uppercase tracking-wider">
          Professional Feedback
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What was it like working with them? Any specific strengths or notes?"
          className="w-full h-40 bg-[#f9f9f9] border-none rounded-2xl p-6 text-[#000716] placeholder:text-[#9ea0a5] focus:ring-2 focus:ring-[#ffb780]/50 transition-all resize-none overflow-y-auto"
          required
        />
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium bg-red-50 p-4 rounded-xl border border-red-100 italic">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#031f41] text-white py-6 rounded-2xl font-bold text-lg hover:bg-[#1d3557] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#031f41]/10 flex items-center justify-center gap-3"
      >
        {isSubmitting ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            Submit Secure Reference
            <MaterialIcon name="arrow_forward" className="text-xl" />
          </>
        )}
      </button>

      <p className="text-center text-xs text-[#9ea0a5] px-8 italic">
        By clicking submit, you confirm that your feedback is truthful based on your professional experience.
      </p>
    </form>
  );
}
