"use client"

import React, { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { motion, AnimatePresence } from "framer-motion"
import { MaterialIcon } from "@/components/MaterialIcon"
import { getGeoPulseData } from "@/app/dashboard/admin/analytics/actions"

// US Continental Bounds
const US_BOUNDS: [[number, number], [number, number]] = [
  [-125.0, 24.396308], // Southwest
  [-66.93457, 49.384358], // Northeast
]

export default function MarketplaceGeoMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "all">("7d")
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{ guests: any[], caregivers: any[], parents: any[], active: any[] }>({ 
    guests: [], caregivers: [], parents: [], active: [] 
  })

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      maxBounds: US_BOUNDS,
      attributionControl: false,
    })

    // Custom Pulsing Dot Implementation
    const size = 150;
    const pulsingDot = {
      width: size,
      height: size,
      data: new Uint8ClampedArray(size * size * 4),
      context: null as CanvasRenderingContext2D | null,
      onAdd: function() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
      },
      render: function() {
        const duration = 1500;
        const t = (performance.now() % duration) / duration;
        const radius = (size / 2) * 0.3;
        const outerRadius = (size / 2) * 0.7 * t + radius;
        const context = this.context;
        if (!context) return false;

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
        context.fillStyle = `rgba(255, 255, 255, ${1 - t})`;
        context.fill();

        context.beginPath();
        context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
        context.fillStyle = 'rgba(59, 130, 246, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        this.data = context.getImageData(0, 0, this.width, this.height).data;
        map.triggerRepaint();
        return true;
      }
    };

    map.on("load", () => {
      mapRef.current = map
      map.addImage('pulsing-dot', pulsingDot as any, { pixelRatio: 2 });
      
      const sources = ["guests", "caregivers", "parents", "active"];
      sources.forEach(s => {
        map.addSource(s, { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      });

      // Layer: Guests (Red Dots)
      map.addLayer({
        id: "guests-layer", type: "circle", source: "guests",
        paint: { "circle-radius": 4, "circle-color": "#ef4444", "circle-opacity": 0.6, "circle-stroke-width": 1, "circle-stroke-color": "white" }
      });

      // Layer: Caregivers (Blue Dots)
      map.addLayer({
        id: "caregivers-layer", type: "circle", source: "caregivers",
        paint: { "circle-radius": 6, "circle-color": "#3b82f6", "circle-stroke-width": 2, "circle-stroke-color": "white" }
      });

      // Layer: Parents (Green Dots)
      map.addLayer({
        id: "parents-layer", type: "circle", source: "parents",
        paint: { "circle-radius": 6, "circle-color": "#10b981", "circle-stroke-width": 2, "circle-stroke-color": "white" }
      });

      // Layer: Active (Pulsing Radar)
      map.addLayer({
        id: "active-layer", type: "symbol", source: "active",
        layout: { "icon-image": "pulsing-dot", "icon-allow-overlap": true }
      });

      fetchData()
    })

    return () => map.remove()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const result = await getGeoPulseData(timeRange)
      setData(result)
      
      if (mapRef.current) {
        const updateSource = (id: string, points: any[]) => {
          const geojson: any = {
            type: "FeatureCollection",
            features: points.map(p => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: [p.lng, p.lat] }
            }))
          };
          (mapRef.current!.getSource(id) as mapboxgl.GeoJSONSource).setData(geojson);
        };

        updateSource("guests", result.guests);
        updateSource("caregivers", result.caregivers);
        updateSource("parents", result.parents);
        updateSource("active", result.active);
      }
    } catch (error) {
      console.error("[MAP] Fetch Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mapRef.current) fetchData()
  }, [timeRange])

  return (
    <div className="relative w-full h-[600px] bg-slate-900 rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 group">
      <div ref={mapContainerRef} className="absolute inset-0" />
      
      {/* HUD: Controls */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-4">
        <div className="bg-black/40 backdrop-blur-3xl p-2 rounded-2xl border border-white/10 flex gap-1.5 shadow-2xl">
          {(["24h", "7d", "all"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
                timeRange === range 
                ? "bg-white text-primary shadow-xl scale-105" 
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              {range === "all" ? "All Time" : range}
            </button>
          ))}
        </div>
      </div>

      {/* HUD: Identity Legend */}
      <div className="absolute bottom-8 right-8 z-10 bg-black/60 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[280px]">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-white/70">Intelligence Legend</span>
        </div>
        
        <div className="space-y-5">
          <div className="flex items-center justify-between group/item cursor-help">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#ef4444] border border-white/50" />
              <span className="text-[12px] font-bold text-white/90">Guests (IP Pulse)</span>
            </div>
            <span className="text-[10px] font-black text-white/20 italic">{data.guests.length}</span>
          </div>
          
          <div className="flex items-center justify-between group/item cursor-help">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6] border border-white/50" />
              <span className="text-[12px] font-bold text-white/90">Caregivers</span>
            </div>
            <span className="text-[10px] font-black text-white/20 italic">{data.caregivers.length}</span>
          </div>

          <div className="flex items-center justify-between group/item cursor-help">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#10b981] border border-white/50" />
              <span className="text-[12px] font-bold text-white/90">Parents</span>
            </div>
            <span className="text-[10px] font-black text-white/20 italic">{data.parents.length}</span>
          </div>

          <div className="pt-4 mt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-primary border-2 border-white" />
                <div className="absolute inset-0 w-4 h-4 rounded-full bg-primary animate-ping opacity-75" />
              </div>
              <div>
                <span className="text-[12px] font-black text-white uppercase tracking-wider block leading-none">Active Revenue</span>
                <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest mt-1">Confirmed Bookings</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Panoramic Blur Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Syncing Geodata</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
