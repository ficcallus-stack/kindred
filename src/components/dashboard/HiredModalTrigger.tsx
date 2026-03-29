"use client";

import { useState, useEffect } from "react";
import { HiredModal } from "./HiredModal";

export function HiredModalTrigger({ booking }: { booking: any }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (booking) {
      // Small delay for drama
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, [booking]);

  if (!booking) return null;

  return (
    <HiredModal 
      booking={booking} 
      show={show} 
      onClose={() => setShow(false)} 
    />
  );
}
