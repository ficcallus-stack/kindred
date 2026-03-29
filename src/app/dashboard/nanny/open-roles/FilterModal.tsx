"use client";

import { useState, useEffect } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface FilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (filters: any) => void;
    initialFilters: any;
}

export default function FilterModal({ isOpen, onClose, onApply, initialFilters }: FilterModalProps) {
    const [jobType, setJobType] = useState(initialFilters.jobType || "all");
    const [minRate, setMinRate] = useState(initialFilters.minRate || 25);
    const [radius, setRadius] = useState(initialFilters.radius || 25);
    const [useLocation, setUseLocation] = useState(!!initialFilters.latitude);
    const [isLocating, setIsLocating] = useState(false);

    if (!isOpen) return null;

    const handleApply = () => {
        if (useLocation) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    onApply({
                        jobType,
                        minRate,
                        radius,
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude
                    });
                    setIsLocating(false);
                    onClose();
                },
                (err) => {
                    console.error("Location error:", err);
                    onApply({ jobType, minRate }); // Fallback without location
                    setIsLocating(false);
                    onClose();
                }
            );
        } else {
            onApply({ jobType, minRate, latitude: null, longitude: null });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-primary/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10 animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low">
                    <div>
                        <h3 className="font-headline text-3xl font-black text-primary italic tracking-tighter italic">Configure Filters</h3>
                        <p className="text-on-surface-variant text-sm font-medium mt-1 uppercase tracking-widest text-[10px] opacity-40">Tailor your job feed</p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-white transition-all flex items-center justify-center text-on-surface-variant shadow-sm border border-outline-variant/10">
                        <MaterialIcon name="close" />
                    </button>
                </div>

                <div className="p-10 space-y-10">
                    {/* Job Type */}
                    <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 block">Job Category</label>
                        <div className="grid grid-cols-3 gap-3">
                            {['all', 'recurring', 'one_time'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setJobType(type)}
                                    className={cn(
                                        "py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                        jobType === type 
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                            : "bg-surface-container-lowest text-on-surface-variant/60 border-outline-variant/10 hover:border-primary/20"
                                    )}
                                >
                                    {type.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rate Range */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 block">Minimum Hourly Rate</label>
                            <span className="text-2xl font-black text-primary italic tracking-tighter">${minRate}/hr</span>
                        </div>
                        <input 
                            type="range" 
                            min="20" 
                            max="100" 
                            step="5"
                            value={minRate}
                            onChange={(e) => setMinRate(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[10px] font-bold text-on-surface-variant/20 tracking-widest uppercase">
                            <span>$20</span>
                            <span>$100+</span>
                        </div>
                    </div>

                    {/* Proximity / Area */}
                    <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-outline-variant/10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                    useLocation ? "bg-primary text-white" : "bg-white text-on-surface-variant/20 border border-outline-variant/10"
                                )}>
                                    <MaterialIcon name="my_location" className="text-lg" />
                                </div>
                                <div>
                                    <div className="text-xs font-black text-primary uppercase tracking-tight">Proximity Search</div>
                                    <div className="text-[10px] font-medium text-on-surface-variant opacity-60">Find roles near your current location</div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setUseLocation(!useLocation)}
                                className={cn(
                                    "w-12 h-6 rounded-full transition-all relative",
                                    useLocation ? "bg-primary" : "bg-slate-200"
                                )}
                            >
                                <div className={cn(
                                    "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                    useLocation ? "right-1" : "left-1"
                                )}></div>
                            </button>
                        </div>

                        {useLocation && (
                            <div className="pt-4 border-t border-outline-variant/10 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">Search Radius</span>
                                    <span className="text-sm font-black text-primary">{radius} Miles</span>
                                </div>
                                <div className="flex gap-2">
                                    {[10, 25, 50, 100].map((r) => (
                                        <button
                                            key={r}
                                            onClick={() => setRadius(r)}
                                            className={cn(
                                                "flex-1 py-2 rounded-lg text-[10px] font-black transition-all border",
                                                radius === r ? "bg-white text-primary border-primary/20 shadow-sm" : "bg-transparent text-on-surface-variant/40 border-transparent"
                                            )}
                                        >
                                            {r}mi
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-5 bg-slate-50 text-on-surface-variant rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-100 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleApply}
                            disabled={isLocating}
                            className="flex-1 py-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:opacity-95 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isLocating ? (
                                <>
                                    <MaterialIcon name="sync" className="animate-spin" />
                                    Locating...
                                </>
                            ) : (
                                "Apply Settings"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
