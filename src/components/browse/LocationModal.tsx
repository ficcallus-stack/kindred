"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useRouter, useSearchParams } from "next/navigation";

export function LocationModal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Already have lat/lng or user chose to skip
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const skip = searchParams.get("skip");
    
    if (!lat && !lng && !skip) {
      // Small delay for the premium "wait for it" experience
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by browser.");
      setLoading(false);
      setShow(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", latitude.toString());
        params.set("lng", longitude.toString());
        params.delete("skip"); // Ensure we clear skip if they allow now
        router.push(`/browse?${params.toString()}`);
        setShow(false);
      },
      async (error) => {
        console.warn("Geolocation denied/failed, falling back to IP:", error);
        try {
          // Robust fallback to IP API
          const res = await fetch('https://freeipapi.com/api/json');
          const data = await res.json();
          if (data.latitude && data.longitude) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("lat", data.latitude.toString());
            params.set("lng", data.longitude.toString());
            if (data.cityName) params.set("location", data.cityName);
            params.delete("skip");
            router.push(`/browse?${params.toString()}`);
          }
        } catch (ipErr) {
          console.error("IP fallback failed:", ipErr);
        }
        setLoading(false);
        setShow(false);
      },
      { timeout: 15000, enableHighAccuracy: true }
    );
  };

  const skipLocation = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("skip", "true");
    router.push(`/browse?${params.toString()}`);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300 transform transition-all">
        <div className="w-24 h-24 rounded-[2rem] bg-secondary-fixed/10 flex items-center justify-center mb-8 rotate-3 shadow-xl shadow-secondary-fixed/5">
          <MaterialIcon name="share_location" className="text-5xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }} />
        </div>
        
        <h2 className="font-headline text-4xl font-black text-primary tracking-tighter italic mb-4 leading-none">Find Care Closer.</h2>
        <p className="text-on-surface-variant text-lg font-medium opacity-60 leading-relaxed mb-10 italic">
          To connect you with elite caregivers in your immediate area, we request one-time access to your location.
        </p>

        <div className="flex flex-col gap-4">
          <button 
            onClick={requestLocation}
            disabled={loading}
            className="w-full bg-primary text-white py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/30 hover:scale-[1.01] hover:bg-slate-900 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {loading ? "Discovering You..." : "Enable Precise Matching"}
            {!loading && <MaterialIcon name="gps_fixed" className="text-sm" />}
          </button>
          
          <button 
            onClick={skipLocation}
            className="text-on-surface-variant text-[11px] font-black uppercase tracking-[0.3em] py-4 hover:text-primary transition-colors opacity-40 hover:opacity-100 flex items-center justify-center gap-2"
          >
            Skip for now & browse all nannies
            <MaterialIcon name="arrow_forward" className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
}
