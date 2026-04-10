"use client";

import { motion } from "framer-motion";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";

interface HireSuccessViewProps {
  nannyName: string;
  jobTitle: string;
  onClose: () => void;
}

export function HireSuccessView({ nannyName, jobTitle, onClose }: HireSuccessViewProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 lg:p-12 text-center space-y-8 animate-in fade-in zoom-in duration-500">
      {/* Celebration Icon */}
      <div className="relative">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 10, stiffness: 100 }}
          className="w-32 h-32 bg-secondary-fixed text-on-secondary-fixed rounded-full flex items-center justify-center shadow-2xl shadow-secondary/20"
        >
          <MaterialIcon name="celebration" size={64} fill />
        </motion.div>
        
        {/* Floating Accents */}
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute -top-4 -right-4 w-12 h-12 bg-primary-container text-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-12"
        >
          <MaterialIcon name="favorite" size={24} fill />
        </motion.div>
      </div>

      {/* Success Text */}
      <div className="space-y-3">
        <h2 className="text-4xl lg:text-5xl font-black font-headline text-primary italic tracking-tight uppercase">
          It's Official!
        </h2>
        <p className="text-on-surface-variant font-medium text-lg lg:text-xl opacity-80 max-w-md mx-auto">
          You have successfully hired <span className="text-secondary font-black">{nannyName}</span> for <span className="font-bold">"{jobTitle}"</span>.
        </p>
      </div>

      {/* Contact Disclosure Notice */}
      <div className="bg-surface-container p-6 rounded-3xl border border-outline-variant/10 max-w-sm">
        <div className="flex items-start gap-4 text-left">
          <MaterialIcon name="share" className="text-secondary mt-1" />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            <span className="font-black uppercase tracking-widest text-[10px] block mb-1">Contact Sharing</span>
            We've shared your mobile number with {nannyName.split(' ')[0]} to ensure seamless coordination for the job.
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link 
          href="/dashboard/messages"
          className="flex-1 bg-primary text-on-primary py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 font-label"
        >
          Go to Chat <MaterialIcon name="chat_bubble" fill />
        </Link>
        <button 
          onClick={onClose}
          className="flex-1 bg-white border border-outline-variant text-primary py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-surface-container transition-all font-label"
        >
          View Bookings
        </button>
      </div>

      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 font-label">
        Funds are now held securely in escrow
      </p>
    </div>
  );
}
