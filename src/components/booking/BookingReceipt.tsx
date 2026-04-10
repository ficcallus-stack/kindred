"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface BookingReceiptProps {
  booking: any;
  nanny: any;
}

export function BookingReceipt({ booking, nanny }: BookingReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!receiptRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        backgroundColor: "#f9f9f9",
      });
      const link = document.createElement("a");
      link.download = `KindredReceipt-${booking.id.slice(0, 8)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Receipt capture failed", err);
    } finally {
      setDownloading(false);
    }
  };

  const isRetainer = booking.hiringMode === "retainer";
  const totalAmount = booking.totalAmount / 100;
  const subtotal = Math.round(totalAmount / 1.075);
  const fees = totalAmount - subtotal;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Target for Capture */}
      <div 
        ref={receiptRef}
        className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-2xl border border-outline-variant/10 font-body relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
        
        <header className="mb-8 border-b border-dashed border-outline-variant/30 pb-6 text-center">
           <p className="font-headline font-black italic text-primary text-xl tracking-tighter mb-1">KindredCare</p>
           <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Official Care Receipt</p>
        </header>

        <div className="space-y-6">
           <div className="flex justify-between items-start">
              <div>
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Caregiver</p>
                 <p className="font-headline font-black italic text-primary">{nanny.fullName}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Date</p>
                 <p className="font-bold text-slate-600 text-xs">{new Date().toLocaleDateString()}</p>
              </div>
           </div>

           <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                 <span>Subtotal</span>
                 <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 italic">
                 <span>Kindred Global Fee</span>
                 <span>${fees.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-200 border-t border-dashed my-2" />
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-black text-primary uppercase tracking-widest">Total Paid</span>
                 <span className="text-lg font-headline font-black italic text-primary">${totalAmount.toFixed(2)}</span>
              </div>
           </div>

           <div className="pt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-black uppercase tracking-widest text-[9px] mb-2">
                 <MaterialIcon name="verified" className="text-sm" fill />
                 Funds Secured in Escrow
              </div>
              <p className="text-[8px] text-slate-400 leading-relaxed max-w-[200px] mx-auto uppercase font-medium">
                 Your payment is protected by Kindred Escrow. Funds release only after session completion.
              </p>
           </div>
        </div>

        <div className="mt-8 pt-6 border-t border-dashed border-outline-variant/30 flex justify-center">
           <div className="w-16 h-1 bg-slate-100 rounded-full" />
        </div>
      </div>

      {/* Button Tool */}
      <button 
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-3 px-8 py-4 bg-white hover:bg-slate-50 text-slate-600 border border-outline-variant/20 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-slate-200/50"
      >
        {downloading ? (
          <div className="w-4 h-4 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
        ) : (
          <>
            <MaterialIcon name="download" className="text-lg" />
            Download Receipt (PNG)
          </>
        )}
      </button>
    </div>
  );
}
