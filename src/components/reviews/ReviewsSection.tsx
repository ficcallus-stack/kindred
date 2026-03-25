"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { ReviewForm } from "./ReviewForm";
import { ReplyForm } from "./ReplyForm";

export function ReviewsSection({ nannyId, initialReviews }: { nannyId: string, initialReviews: any[] }) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  return (
    <section className="space-y-12 animate-in fade-in duration-700 delay-300">
      <div className="flex items-center justify-between">
        <h3 className="text-3xl font-black text-primary font-headline tracking-tighter italic flex items-center gap-4">
          <MaterialIcon name="reviews" className="text-secondary text-4xl" />
          Reviews ({initialReviews.length})
        </h3>
        <button 
          onClick={() => setIsReviewModalOpen(true)}
          className="bg-primary/10 text-primary px-6 py-2 rounded-full font-bold hover:bg-primary hover:text-white transition-all text-sm uppercase tracking-widest"
        >
          Leave a Review
        </button>
      </div>

      <div className="space-y-8">
        {initialReviews.length === 0 ? (
          <p className="text-on-surface-variant italic opacity-60">No reviews yet. Be the first to leave one!</p>
        ) : (
          initialReviews.map((review) => (
            <div key={review.id} className="bg-surface-container-low p-8 rounded-[3rem] space-y-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center font-bold text-xl uppercase">
                    {review.reviewer.fullName[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{review.reviewer.fullName}</h4>
                    <div className="flex items-center gap-1 text-secondary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <MaterialIcon key={i} name="star" fill={i < review.rating} className="text-sm" />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest opacity-50">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-on-surface text-lg leading-relaxed">{review.comment}</p>
              
              {review.images && review.images.length > 0 && (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {review.images.map((img: string, i: number) => (
                    <img key={i} src={img} alt="Review attachment" className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-md" />
                  ))}
                </div>
              )}

              {/* Nanny Reply Block */}
              {review.replyText ? (
                <div className="mt-8 ml-8 sm:ml-12 p-6 bg-primary/5 border-l-4 border-primary rounded-r-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <MaterialIcon name="subdirectory_arrow_right" className="text-primary text-xl" />
                    <span className="font-bold text-primary tracking-tight">Nanny's Reply</span>
                  </div>
                  <p className="text-on-surface-variant italic leading-relaxed">{review.replyText}</p>
                </div>
              ) : (
                <button 
                  onClick={() => setReplyingTo(review.id)}
                  className="text-xs text-primary font-bold uppercase tracking-widest hover:underline mt-4 inline-block"
                >
                  Reply to this review
                </button>
              )}

              {replyingTo === review.id && (
                <div className="mt-6 ml-8 sm:ml-12">
                  <ReplyForm reviewId={review.id} onSuccess={() => setReplyingTo(null)} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isReviewModalOpen && (
        <ReviewForm 
          nannyId={nannyId} 
          onClose={() => setIsReviewModalOpen(false)} 
        />
      )}
    </section>
  );
}
