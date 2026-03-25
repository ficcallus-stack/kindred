"use client";

import { useState } from "react";
import { MaterialIcon } from "./MaterialIcon";
import { submitSupportTicket } from "@/app/dashboard/moderator/support/actions";
import { useToast } from "./Toast";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await submitSupportTicket(formData);
      showToast("Ticket Submitted. Our support team will review your request shortly.", "success");
      setIsOpen(false);
    } catch (error: any) {
      showToast(error.message || "Failed to submit ticket. Please ensure you are logged in.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[340px] bg-white rounded-3xl shadow-2xl border border-outline-variant/10 overflow-hidden flex flex-col origin-bottom-right"
          >
            {/* Header */}
            <div className="bg-primary px-6 py-5 text-white flex items-center justify-between">
              <div>
                <h3 className="font-headline font-extrabold text-lg">Support</h3>
                <p className="text-xs text-white/80 font-medium mt-0.5">We typically reply in minutes</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="Close support widget"
              >
                <MaterialIcon name="close" className="text-xl" />
              </button>
            </div>

            {/* Content / Form */}
            <div className="p-6 bg-surface-container-lowest">
              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Issue Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    maxLength={100}
                    placeholder="e.g. Payment not going through"
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Category</label>
                  <select
                    id="category"
                    name="category"
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium appearance-none"
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="payment">Billing / Payment</option>
                    <option value="technical">Technical Issue</option>
                    <option value="safety">Safety Concern</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    required
                    rows={3}
                    placeholder="Please describe your issue in detail..."
                    className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none placeholder:text-slate-400 font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary text-white font-bold text-sm py-3.5 rounded-xl hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <MaterialIcon name="hourglass_empty" className="animate-spin text-sm" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <MaterialIcon name="send" className="text-sm" />
                        Submit Ticket
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-medium mt-3">
                    Requires an active account to submit.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-[24px] bg-primary text-white flex items-center justify-center shadow-xl shadow-primary/30 hover:shadow-primary/40 transition-shadow relative"
        aria-label="Open support"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MaterialIcon name="close" className="text-2xl" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MaterialIcon name="chat_bubble" className="text-2xl" />
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-error border-2 border-white pointer-events-none animate-pulse"></span>
        )}
      </motion.button>
    </div>
  );
}
