"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MaterialIcon } from "@/components/MaterialIcon";

interface ProfileGalleryProps {
  photos: string[];
  name: string;
}

export function ProfileGallery({ photos, name }: ProfileGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback images if none provided
  const displayPhotos = photos.length > 0 ? photos : [
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
  ];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displayPhotos.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + displayPhotos.length) % displayPhotos.length);
  };

  return (
    <section className="mb-20">
      <h3 className="text-3xl font-extrabold font-headline text-primary mb-10 text-center uppercase tracking-tighter italic">
        Life with {name.split(' ')[0]}
      </h3>
      
      {/* Desktop Grid (Matches Design) */}
      <div className="hidden md:grid grid-cols-5 gap-4 h-[500px]">
        {/* Main large image (asymmetric clip) */}
        <div className="col-span-2 row-span-2 relative">
          <img 
            src={displayPhotos[0]} 
            alt={`${name} Activity 1`}
            className="w-full h-full object-cover rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-xl rounded-bl-xl shadow-lg"
          />
        </div>
        
        {/* Row 1, Col 3 */}
        <div className="h-[242px]">
          <img 
            src={displayPhotos[1] || displayPhotos[0]} 
            alt={`${name} Activity 2`}
            className="w-full h-full object-cover rounded-2xl shadow-sm"
          />
        </div>
        
        {/* Row 1, Col 4-5 */}
        <div className="col-span-2 h-[242px]">
          <img 
            src={displayPhotos[2] || displayPhotos[0]} 
            alt={`${name} Activity 3`}
            className="w-full h-full object-cover rounded-2xl shadow-sm"
          />
        </div>
        
        {/* Row 2, Col 3 */}
        <div className="h-[242px]">
          <img 
            src={displayPhotos[3] || displayPhotos[0]} 
            alt={`${name} Activity 4`}
            className="w-full h-full object-cover rounded-2xl shadow-sm"
          />
        </div>
        
        {/* Row 2, Col 4-5 */}
        <div className="col-span-2 h-[242px]">
          <img 
            src={displayPhotos[4] || displayPhotos[0]} 
            alt={`${name} Activity 5`}
            className="w-full h-full object-cover rounded-2xl shadow-sm"
          />
        </div>
      </div>

      {/* Mobile Swipeable Carousel */}
      <div className="md:hidden relative aspect-square overflow-hidden rounded-[2rem] shadow-xl group">
        <AnimatePresence initial={false} mode="wait">
          <motion.img
            key={currentIndex}
            src={displayPhotos[currentIndex]}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        
        {/* Navigation Overlays */}
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2 z-10">
          {displayPhotos.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                i === currentIndex ? "bg-white w-6" : "bg-white/40"
              )}
            />
          ))}
        </div>

        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MaterialIcon name="chevron_left" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MaterialIcon name="chevron_right" />
        </button>
      </div>
    </section>
  );
}
