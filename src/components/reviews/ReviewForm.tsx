"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { createReview } from "@/app/dashboard/reviews/actions";
import { getReviewUploadUrl } from "@/app/dashboard/reviews/upload-actions";

export function ReviewForm({ nannyId, onClose }: { nannyId: string; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [bookingId, setBookingId] = useState(""); // Currently users will manually input this or select from a dropdown depending on how booking states are provided. For now, we'll ask for it.
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 3)); // Max 3 images
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      showToast("Please select a star rating", "error");
      return;
    }
    if (!bookingId.trim()) {
      showToast("Please provide the Booking ID", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedImageUrls: string[] = [];

      // 1. Upload Images to AWS S3/Cloudflare R2
      for (const file of images) {
        const { uploadUrl, publicUrl } = await getReviewUploadUrl(file.name, file.type);
        const res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type }
        });
        
        if (!res.ok) throw new Error(`Failed to upload image: ${file.name}`);
        uploadedImageUrls.push(publicUrl);
      }

      // 2. Submit Review Server Action
      await createReview({
        bookingId,
        revieweeId: nannyId,
        rating,
        comment,
        images: uploadedImageUrls,
      });

      showToast("Review submitted successfully", "success");
      onClose();
    } catch (error: any) {
      showToast(error.message || "An error occurred while submitting review", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 lg:p-12 animate-in fade-in backdrop-blur-sm">
      <div className="bg-surface w-full max-w-2xl rounded-[3rem] p-8 md:p-16 relative shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto">
        
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 bg-surface-container-high rounded-full flex items-center justify-center hover:bg-surface-container-highest transition-colors"
        >
          <MaterialIcon name="close" />
        </button>

        <h2 className="text-4xl font-black text-primary font-headline italic tracking-tighter mb-4">Leave a Review</h2>
        <p className="text-on-surface-variant font-medium mb-12">Share your experience to help other families find the perfect caregiver.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-primary">Booking ID</label>
            <input 
              type="text" 
              value={bookingId} 
              onChange={(e) => setBookingId(e.target.value)}
              placeholder="Paste your past Booking ID here..."
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-primary">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 transition-transform focus:outline-none"
                >
                  <MaterialIcon 
                    name="star" 
                    fill={(hoverRating || rating) >= star} 
                    className={`text-4xl ${(hoverRating || rating) >= star ? 'text-secondary' : 'text-outline-variant/30'}`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-primary">Your Review</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you love about working with them?"
              className="w-full h-40 bg-surface-container-lowest border border-outline-variant/30 rounded-[2rem] p-6 outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
              required
              minLength={10}
            />
          </div>

          <div className="space-y-4 relative">
            <label className="text-xs font-black uppercase tracking-widest text-primary">Attach Photos (Optional, Max 3)</label>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-[2rem] p-8 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-low transition-colors cursor-pointer group">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageChange}
                className="absolute inset-x-0 bottom-0 h-32 opacity-0 cursor-pointer"
                disabled={isSubmitting}
              />
              <MaterialIcon name="add_a_photo" className="text-4xl text-on-surface-variant opacity-40 group-hover:scale-110 group-hover:text-primary transition-all mb-4" />
              <p className="text-sm font-bold text-on-surface-variant">Click or drag photos here</p>
            </div>
            
            {images.length > 0 && (
              <div className="flex gap-4 mt-4 text-xs font-bold text-primary bg-primary/5 px-4 py-2 rounded-xl inline-flex w-full">
                {images.length} file(s) selected
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {isSubmitting ? "Submitting securely..." : "Post Public Review"}
          </button>
        </form>

      </div>
    </div>
  );
}
