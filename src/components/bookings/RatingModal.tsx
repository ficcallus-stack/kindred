"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { submitReviewAction } from "@/app/dashboard/parent/bookings/actions";
import { useToast } from "@/components/Toast";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: {
    id: string;
    caregiverId: string;
    caregiverName: string;
  };
}

export default function RatingModal({ isOpen, onClose, booking }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) return showToast("Please select a star rating", "error");
    setIsSubmitting(true);
    try {
      await submitReviewAction({
        bookingId: booking.id,
        caregiverId: booking.caregiverId,
        rating,
        comment,
      });
      showToast("Thank you for your feedback!", "success");
      onClose();
    } catch (err) {
      showToast("Failed to submit rating", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primary/40 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 z-[101] overflow-hidden"
          >
            {/* Decoration */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-headline font-black text-primary italic">Rate Your Caregiver</h3>
                <p className="text-sm font-medium text-slate-400">How was your session with {booking.caregiverName}?</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform active:scale-90"
                  >
                    <MaterialIcon 
                      name="star" 
                      className={cn(
                        "text-5xl transition-colors",
                        (hover || rating) >= star ? "text-amber-400 fill" : "text-slate-200"
                      )} 
                      fill={(hover || rating) >= star}
                    />
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Share a few words about ${booking.caregiverName.split(" ")[0]}...`}
                  className="w-full bg-slate-50 border-none rounded-3xl p-6 text-sm font-medium focus:ring-2 focus:ring-primary/10 outline-none italic resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || rating === 0}
                  className="flex-[2] py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all"
                >
                  {isSubmitting ? "Submitting..." : "Post Review"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
