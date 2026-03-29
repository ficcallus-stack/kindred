"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { BookingModal } from "./BookingModal";

interface BookingTriggerProps {
  nanny: {
    id: string;
    name: string;
    hourlyRate: string;
  };
}

export function BookingTrigger({ nanny }: BookingTriggerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        nanny={nanny} 
      />
      
      <button 
        onClick={() => setIsModalOpen(true)}
        className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
      >
        Book {nanny.name.split(' ')[0]} Now <MaterialIcon name="calendar_today" fill />
      </button>
    </>
  );
}
