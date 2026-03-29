"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { ReviewForm } from "./ReviewForm";
import { ReplyForm } from "./ReplyForm";

export function ReviewsSection({ 
  nannyId, 
  initialReviews, 
  currentUserId,
  hasBookedBefore 
}: { 
  nannyId: string, 
  initialReviews: any[], 
  currentUserId?: string,
  hasBookedBefore: boolean
}) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const canReply = currentUserId === nannyId;

  return (
    <section className="mb-20">
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold font-headline text-primary italic uppercase tracking-tighter">Parent Testimonials</h2>
          <p className="text-on-surface-variant text-sm font-medium">Trusted by {initialReviews.length} families in the marketplace.</p>
        </div>
        
        <div className="flex gap-4">
          <button className="text-primary font-bold border-b-2 border-primary/20 hover:border-primary transition-all text-xs uppercase tracking-widest">
            View all {initialReviews.length} reviews
          </button>
          
          {hasBookedBefore && (
            <button 
              onClick={() => setIsReviewModalOpen(true)}
              className="bg-primary text-white px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-all text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20"
            >
              Leave a Review
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {initialReviews.length === 0 ? (
          <div className="col-span-full py-20 bg-surface-container-low rounded-[3rem] text-center">
             <MaterialIcon name="reviews" className="text-4xl text-outline-variant mb-4 opacity-40" />
             <p className="text-on-surface-variant font-bold opacity-60">No reviews yet.</p>
             {!hasBookedBefore && <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-black italic">Booking required to leave feedback</p>}
          </div>
        ) : (
          initialReviews.map((review) => (
            <div key={review.id} className="bg-surface-container-lowest p-8 rounded-[2rem] editorial-shadow relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center font-black text-primary overflow-hidden shadow-inner">
                  {review.reviewer.fullName[0]}
                </div>
                <div>
                  <p className="font-bold text-primary">{review.reviewer.fullName}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-black opacity-40">Previous Client</p>
                </div>
                
                <div className="ml-auto flex flex-col items-end gap-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-sm text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                        {i < review.rating ? "star" : "star_outline"}
                      </span>
                    ))}
                  </div>
                  {review.totalAmount && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border border-emerald-200">
                      Verified Booking: ${(review.totalAmount / 100).toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-on-surface-variant italic leading-relaxed text-sm">"{review.comment}"</p>
              
              {review.replyText && (
                <div className="mt-6 p-4 bg-tertiary-fixed/10 border-l-2 border-tertiary rounded-r-xl space-y-1">
                  <p className="text-[8px] font-black text-tertiary uppercase tracking-widest">Caregiver's Response</p>
                  <p className="text-xs text-on-tertiary-fixed-variant leading-relaxed opacity-80">"{review.replyText}"</p>
                </div>
              )}

              {canReply && !review.replyText && (
                <button 
                  onClick={() => setReplyingTo(review.id)}
                  className="mt-4 text-[9px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  Reply to this feedback
                </button>
              )}

              {replyingTo === review.id && (
                <div className="mt-4">
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
