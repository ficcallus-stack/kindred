"use client";

import { useState, useEffect, useCallback } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getOpenJobs, FilterOptions } from "./actions";
import FilterModal from "./FilterModal";

interface JobBoardProps {
    initialJobs: any[];
}

export default function JobBoard({ initialJobs }: JobBoardProps) {
    const [jobs, setJobs] = useState(initialJobs);
    const [filters, setFilters] = useState<FilterOptions>({
        jobType: "all",
        minRate: 20,
        limit: 10,
        offset: 0
    });
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialJobs.length === 10);

    const fetchJobs = useCallback(async (newFilters: FilterOptions, append = false) => {
        setIsLoading(true);
        try {
            const results = await getOpenJobs(newFilters);
            if (append) {
                setJobs(prev => [...prev, ...results]);
            } else {
                setJobs(results);
            }
            setHasMore(results.length === 10);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleApplyFilters = (newFilters: any) => {
        const updatedFilters = { ...filters, ...newFilters, offset: 0 };
        setFilters(updatedFilters);
        fetchJobs(updatedFilters);
    };

    const handleLoadMore = () => {
        const nextOffset = filters.offset! + 10;
        const updatedFilters = { ...filters, offset: nextOffset };
        setFilters(updatedFilters);
        fetchJobs(updatedFilters, true);
    };

    return (
        <div className="space-y-12">
            {/* Interactive Header & Top Filters */}
            <div className="mb-12 sticky top-4 z-40">
                <div className="bg-white/80 backdrop-blur-3xl p-4 rounded-[2.5rem] shadow-2xl shadow-primary/5 flex flex-wrap items-center gap-4 lg:gap-8 border border-outline-variant/10">
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex flex-col gap-1.5 px-6 group text-left border-r border-outline-variant/20 pr-8"
                    >
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 group-hover:text-primary transition-colors cursor-pointer">Job Category</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-primary uppercase tracking-tight italic">{filters.jobType?.replace('_', ' ')}</span>
                            <MaterialIcon name="expand_more" className="text-sm opacity-40 group-hover:opacity-100" />
                        </div>
                    </button>
                    
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex flex-col gap-1.5 px-6 group text-left border-r border-outline-variant/20 pr-8"
                    >
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 group-hover:text-primary transition-colors cursor-pointer">Rate Minimum</label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-primary tracking-tight italic">${filters.minRate}/hr+</span>
                            <MaterialIcon name="expand_more" className="text-sm opacity-40 group-hover:opacity-100" />
                        </div>
                    </button>

                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex flex-col gap-1.5 px-6 group text-left"
                    >
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 group-hover:text-primary transition-colors cursor-pointer">Search Area</label>
                        <div className="flex items-center gap-2 text-primary font-black text-sm italic tracking-tight uppercase">
                            <MaterialIcon name="near_me" className="text-sm" />
                            {filters.latitude ? `${filters.radius} Miles` : "Global"}
                            <MaterialIcon name="expand_more" className="text-sm opacity-40 group-hover:opacity-100" />
                        </div>
                    </button>

                    <div className="ml-auto flex gap-3">
                        <button 
                            onClick={handleLoadMore}
                            disabled={isLoading || !hasMore}
                            className="w-12 h-12 flex items-center justify-center text-on-surface-variant hover:bg-slate-50 rounded-2xl transition-all border border-outline-variant/10 shadow-sm"
                        >
                            <MaterialIcon name={isLoading ? "sync" : "refresh"} className={isLoading ? "animate-spin" : ""} />
                        </button>
                        <button 
                            onClick={() => setIsFilterModalOpen(true)}
                            className="bg-primary text-white px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 shadow-lg shadow-primary/10 flex items-center gap-2"
                        >
                            <MaterialIcon name="tune" className="text-sm" />
                            Advanced
                        </button>
                    </div>
                </div>
            </div>

            {/* Job Grid */}
            {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {jobs.map((job, idx) => {
                        const fallbacks = ["/family_illustration_1_1774602472962.png", "/family_illustration_2_1774602489023.png"];
                        const displayImg = job.parentPhoto || fallbacks[idx % 2];
                        const childCount = job.children?.length || 1;
                        const hourCount = Object.values(job.schedule || {}).filter(Boolean).length * 2;

                        return (
                            <div key={job.id} className="group relative bg-white rounded-[3rem] border border-outline-variant/10 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-700 flex flex-col overflow-hidden">
                                {/* Image Frame */}
                                <div className="relative h-64 overflow-hidden">
                                     <img 
                                        src={displayImg} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                                        alt="Family" 
                                    />
                                    {/* Elevated Location Badge */}
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="bg-white/40 backdrop-blur-3xl border border-white/40 p-3 rounded-2xl flex items-center gap-3 shadow-2xl">
                                            <div className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg">
                                                <MaterialIcon name="location_on" className="text-lg" />
                                            </div>
                                            <div className="text-[10px] font-black text-primary uppercase tracking-widest italic">{job.location || "Midtown East, NY"}</div>
                                        </div>
                                    </div>

                                    {/* Floating Status Tag */}
                                    <div className={cn(
                                        "absolute top-6 right-6 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-none shadow-xl border border-white/20 backdrop-blur-md",
                                        job.scheduleType === 'recurring' ? "bg-primary/80 text-white" : "bg-tertiary-fixed/80 text-on-tertiary-fixed-variant"
                                    )}>
                                        {job.scheduleType.replace('_', ' ')}
                                    </div>
                                </div>

                                {/* Minimalist Content */}
                                <div className="p-10 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-10">
                                        <h3 className="font-headline text-2xl font-black text-primary tracking-tighter italic leading-none">The {job.parentName} Family</h3>
                                        <div className="text-right">
                                            <div className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Elite Rate</div>
                                            <div className="text-xl font-black text-primary italic tracking-tight">${job.minRate}/hr</div>
                                        </div>
                                    </div>

                                    {/* Key Stats Row */}
                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <div className="bg-surface-container-low p-4 rounded-[1.5rem] border border-outline-variant/10 group-hover:bg-primary/5 transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MaterialIcon name="child_care" className="text-sm text-primary opacity-40" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Children</span>
                                            </div>
                                            <div className="text-sm font-black text-primary">{childCount} {childCount > 1 ? 'Toddlers' : 'Infant'}</div>
                                        </div>
                                        <div className="bg-surface-container-low p-4 rounded-[1.5rem] border border-outline-variant/10 group-hover:bg-primary/5 transition-colors">
                                            <div className="flex items-center gap-2 mb-1">
                                                <MaterialIcon name="schedule" className="text-sm text-primary opacity-40" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant/40">Weekly</span>
                                            </div>
                                            <div className="text-sm font-black text-primary">~{hourCount} Hours</div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-6 border-t border-outline-variant/10">
                                        <Link 
                                            href={`/dashboard/nanny/open-roles/${job.id}`}
                                            className="w-full py-5 bg-gradient-to-br from-primary to-primary-container text-white rounded-[2rem] text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl shadow-primary/10 hover:shadow-primary/25 hover:-translate-y-1 active:translate-y-0 transition-all duration-500"
                                        >
                                            View Details
                                            <MaterialIcon name="arrow_forward" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                 <div className="py-40 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-surface-container-low rounded-full flex items-center justify-center text-on-surface-variant/20 mb-4 animate-pulse">
                        <MaterialIcon name="search_off" className="text-6xl" />
                    </div>
                    <div>
                        <h3 className="font-headline text-3xl font-black text-primary tracking-tighter italic">No roles fit your current settings</h3>
                        <p className="text-on-surface-variant max-w-sm mx-auto leading-relaxed font-medium italic mt-2 opacity-60">
                            Try expanding your search area or hourly rate minimum to see more prestigious opportunities.
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsFilterModalOpen(true)}
                        className="px-12 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 mt-4 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        Adjust Filters
                    </button>
                </div>
            )}

            {hasMore && (
                <div className="mt-20 flex flex-col items-center gap-6">
                    <button 
                        onClick={handleLoadMore}
                        disabled={isLoading}
                        className="px-14 py-5 rounded-full border border-primary/20 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary hover:text-white transition-all duration-700 shadow-xl shadow-primary/5 active:scale-95"
                    >
                        {isLoading ? <MaterialIcon name="sync" className="animate-spin" /> : "Load More Elite Roles"}
                    </button>
                    <p className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-widest italic tracking-[0.2em]">Batch 10 of 28 Curated Spots</p>
                </div>
            )}

            <FilterModal 
                isOpen={isFilterModalOpen} 
                onClose={() => setIsFilterModalOpen(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
            />
        </div>
    );
}
