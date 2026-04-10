"use client";

import { useState, useMemo } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { updateNannyVerificationStatus } from "../actions";
import { useToast } from "@/components/Toast";

interface VerificationsHubProps {
  queueItems: any[];
}

export default function VerificationsHub({ queueItems }: VerificationsHubProps) {
  const [selectedId, setSelectedId] = useState<string | null>(queueItems[0]?.id || null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [processing, setProcessing] = useState(false);
  const [notes, setNotes] = useState("");
  const { showToast } = useToast();

  const selectedCandidate = useMemo(() => 
    queueItems.find(item => item.id === selectedId) || queueItems[0],
    [selectedId, queueItems]
  );

  const filteredItems = useMemo(() => {
    return queueItems.filter(item => {
      const matchesSearch = item.fullName.toLowerCase().includes(search.toLowerCase());
      if (filter === "all") return matchesSearch;
      if (filter === "premium") return matchesSearch && item.isPremium;
      if (filter === "pending") return matchesSearch && item.status === "pending";
      return matchesSearch;
    });
  }, [queueItems, filter, search]);

  const handleAction = async (status: "verified" | "rejected") => {
    if (!selectedCandidate || processing) return;
    
    if (status === "rejected" && !notes.trim()) {
      showToast("Please provide a reason for rejection in the notes.", "error");
      return;
    }

    setProcessing(true);
    try {
      await updateNannyVerificationStatus(selectedCandidate.id, status, notes);
      showToast(status === "verified" ? "Caregiver verified successfully!" : "Application rejected.", status === "verified" ? "success" : "error");
      setNotes(""); // Reset notes on success
    } catch (error) {
      showToast("Verification action failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const getStepStatus = (step: number, candidate: any) => {
    if (candidate.currentStep > step) return "completed";
    if (candidate.currentStep === step) return "current";
    return "pending";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Left: Verification Queue */}
      <div className="lg:w-1/3 flex flex-col gap-6 w-full sticky top-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-headline font-black text-blue-950 italic tracking-tight">Verification Queue</h2>
          <span className="px-2 py-1 bg-primary text-white text-[9px] font-black rounded-lg animate-pulse tracking-widest">LIVE</span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
          {["all", "premium", "pending"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                filter === f ? "bg-white text-primary shadow-sm" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="space-y-4 max-h-[calc(100vh-20rem)] overflow-y-auto pr-2 custom-scrollbar">
          {filteredItems.map((item) => {
            const isSelected = selectedId === item.id;
            const progress = (item.currentStep / 5) * 100;

            return (
              <motion.div
                layout
                key={item.id}
                onClick={() => setSelectedId(item.id)}
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all cursor-pointer group relative overflow-hidden",
                  isSelected 
                    ? "bg-white border-secondary shadow-xl shadow-secondary/5 ring-4 ring-secondary/5" 
                    : "bg-white/60 border-transparent hover:border-slate-200 hover:bg-white"
                )}
              >
                {item.isPremium && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-secondary text-white text-[8px] font-black uppercase tracking-[0.2em] rounded-bl-xl shadow-sm z-10 transition-transform group-hover:scale-105">
                    Premium App
                  </div>
                )}
                
                <div className="flex gap-4 items-start">
                  <div className="relative shrink-0">
                    <img 
                      src={item.photos?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${item.fullName}`} 
                      alt={item.fullName} 
                      className={cn(
                        "w-14 h-14 rounded-2xl object-cover border-2 shadow-sm transition-all grayscale-[0.3]",
                        isSelected ? "border-secondary grayscale-0 scale-105" : "border-slate-100"
                      )} 
                    />
                    {item.status === 'pending' && (
                       <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={cn(
                        "font-black font-headline italic tracking-tight truncate transition-colors",
                        isSelected ? "text-primary text-lg" : "text-slate-600"
                      )}>
                        {item.fullName}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-3">
                      Submitted {formatDistanceToNow(item.createdAt)} ago
                    </p>
                    
                    <div className="flex justify-between items-center mt-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        item.status === "verified" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        item.status === "rejected" ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {item.status}
                      </span>
                      <MaterialIcon name="chevron_right" className={cn(
                        "text-lg transition-transform",
                        isSelected ? "text-secondary transform translate-x-1" : "text-slate-300"
                      )} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {filteredItems.length === 0 && (
            <div className="py-20 text-center space-y-4 grayscale opacity-40">
              <MaterialIcon name="manage_search" className="text-6xl text-slate-300" />
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic">No candidates matching search</p>
            </div>
          )}
        </div>
      </div>

      {/* Right: Detailed Verification Profile */}
      <AnimatePresence mode="wait">
        {selectedCandidate ? (
          <motion.div 
            key={selectedCandidate.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lg:w-2/3 w-full bg-white rounded-[2.5rem] shadow-2xl shadow-primary/5 overflow-hidden border border-slate-100 flex flex-col min-h-[calc(100vh-14rem)]"
          >
            {/* Header Section */}
            <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-slate-50/30">
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-secondary to-amber-300 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity blur-lg"></div>
                  <img 
                    src={selectedCandidate.photos?.[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedCandidate.fullName}`} 
                    alt={selectedCandidate.fullName} 
                    className="w-28 h-28 rounded-[2.2rem] object-cover relative z-10 border-4 border-white shadow-xl" 
                  />
                  <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-lg z-20 ring-4 ring-white">
                    <div className={cn(
                      "text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-widest",
                      selectedCandidate.idFrontUrl ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-slate-100 text-slate-400"
                    )}>
                      <MaterialIcon name="verified" className="text-[14px]" fill={!!selectedCandidate.idFrontUrl} />
                      {selectedCandidate.idFrontUrl ? "ID Verified" : "No ID"}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-4xl font-headline font-black text-primary tracking-tighter italic leading-none">{selectedCandidate.fullName}</h2>
                  <div className="flex items-center gap-4">
                    <p className="text-slate-400 flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                      <MaterialIcon name="location_on" className="text-sm" />
                       {selectedCandidate.location || "Brooklyn, NY"} • 5.2 miles
                    </p>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-200"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Applied {format(selectedCandidate.createdAt, "MMM d")}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.specializations?.map((spec: string, i: number) => (
                      <span key={i} className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                        {spec}
                      </span>
                    )) || (
                      <>
                        <span className="bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm italic">Standard Enrollee</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right flex flex-col items-end gap-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Safety Audit Command</p>
                <a 
                  href={`/nanny/${selectedCandidate.id}`} 
                  target="_blank"
                  className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all shadow-sm flex items-center gap-2"
                >
                  <MaterialIcon name="visibility" className="text-sm" />
                  View Public Profile
                </a>
                <div className="flex items-center gap-2 mt-1">
                   <div className={cn("w-2 h-2 rounded-full", selectedCandidate.status === 'pending' ? "bg-amber-500 animate-pulse" : "bg-emerald-500")}></div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">STATUS: {selectedCandidate.status?.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Scrollable Detail Blocks */}
            <div className="flex-1 overflow-y-auto p-10 space-y-16 custom-scrollbar max-h-[calc(100vh-28rem)]">
              {/* Step 1: Identity */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-lg shadow-xl shadow-primary/20">1</span>
                  <h3 className="font-headline font-black text-2xl text-blue-950 italic tracking-tight">Identity Verification</h3>
                  <div className="ml-auto h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6"></div>
                  {selectedCandidate.idFrontUrl && <MaterialIcon name="check_circle" className="text-tertiary text-2xl" fill />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Government Issued ID</p>
                    <div className="aspect-[16/10] bg-slate-900 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl group flex items-center justify-center relative bg-slate-200">
                      {selectedCandidate.idFrontUrl ? (
                         <img 
                          src={selectedCandidate.idFrontUrl} 
                          alt="ID Front" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-4 opacity-20">
                           <MaterialIcon name="id_card" className="text-6xl text-slate-400" />
                           <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Document Provided</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Recognition Check</p>
                     <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 flex items-center gap-8 h-full">
                        {selectedCandidate.selfieUrl ? (
                          <>
                            <div className="relative shrink-0">
                               <img 
                                src={selectedCandidate.selfieUrl} 
                                alt="Selfie" 
                                className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg" 
                               />
                            </div>
                            <div className="space-y-2 flex-1">
                               <p className="text-sm font-black text-blue-950 uppercase italic tracking-tight underline decoration-secondary decoration-2 underline-offset-4">Visual Comparison Required</p>
                               <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-wider">Moderator must manually confirm biometric alignment between selfie and government document.</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-4 opacity-40 justify-center w-full">
                             <MaterialIcon name="face" className="text-6xl text-slate-400" />
                             <p className="text-xs font-black text-slate-500 uppercase tracking-widest text-center">No Selfie Provided</p>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </section>

              {/* Step 2: Background Check */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-lg shadow-xl shadow-primary/20">2</span>
                  <h3 className="font-headline font-black text-2xl text-blue-950 italic tracking-tight">Professional Background</h3>
                  <div className="ml-auto h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6"></div>
                  {selectedCandidate.backgroundAuth && <MaterialIcon name="check_circle" className="text-tertiary text-2xl" fill />}
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary rounded-full blur-[80px] opacity-10 -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-8 mb-8">
                    <div>
                      <p className="text-primary-fixed-dim text-[10px] font-black uppercase tracking-[0.3em] mb-2 opacity-60">Full Screening Report</p>
                      <h4 className="text-2xl font-headline font-black italic tracking-tight">Checkr Global Safety Scan</h4>
                      <p className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-widest">{selectedCandidate.backgroundAuth ? `Authorized on ${format(selectedCandidate.backgroundAuthTimestamp || new Date(), "MMM d, yyyy")}` : "Authorization Required"}</p>
                    </div>
                    <button className="px-6 py-2 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-primary transition-all active:scale-95">View Detailed PDF</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {[
                      { label: "Criminal History", detail: "Clear / No Records", icon: "security_update_good" },
                      { label: "MVR Compliance", detail: "Clean License", icon: "directions_car" },
                      { label: "SSN Trace", detail: "Validated", icon: "badge" },
                    ].map((item, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm group-hover:bg-white/10 transition-colors">
                        <MaterialIcon name={item.icon} className="text-secondary text-2xl mb-4" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                        <p className="text-sm font-black italic uppercase italic tracking-tight">{item.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Step 3: Professional Profile */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-lg shadow-xl shadow-primary/20">3</span>
                  <h3 className="font-headline font-black text-2xl text-blue-950 italic tracking-tight">Professional Persona</h3>
                  <div className="ml-auto h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6"></div>
                </div>

                <div className="grid lg:grid-cols-5 gap-8">
                  <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative group overflow-hidden">
                       <MaterialIcon name="format_quote" className="absolute -top-2 -left-2 text-7xl text-slate-200 opacity-20 rotate-12" />
                       <p className="text-slate-600 font-medium leading-relaxed italic relative z-10 text-lg selection:bg-secondary/20">
                          {selectedCandidate.bio || "Candidate has not submitted a professional bio yet. Personal parameters are still under review."}
                       </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {selectedCandidate.logistics?.map((trait: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 font-bold text-xs text-slate-500 uppercase tracking-[0.1em]">
                           <span className="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
                           {trait}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-2 gap-4 h-full">
                     {selectedCandidate.photos?.slice(1, 5).map((photo: string, i: number) => (
                       <img key={i} src={photo} alt={`Candidate photo ${i}`} className="w-full aspect-square rounded-[2rem] object-cover border-4 border-white shadow-xl hover:scale-105 transition-transform" />
                     ))}
                     {(!selectedCandidate.photos || selectedCandidate.photos.length <= 1) && [1,2,3,4].map(i => (
                       <div key={i} className="w-full aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                          <MaterialIcon name="image_not_supported" className="text-3xl" />
                       </div>
                     ))}
                  </div>
                </div>
              </section>

              {/* Step 4: References */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-lg shadow-xl shadow-primary/20">4</span>
                  <h3 className="font-headline font-black text-2xl text-blue-950 italic tracking-tight">Vetted References</h3>
                  <div className="ml-auto h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6"></div>
                  {selectedCandidate.references?.length > 0 && <MaterialIcon name="check_circle" className="text-tertiary text-2xl" fill />}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {selectedCandidate.references?.map((ref: any, i: number) => (
                     <div key={i} className="p-8 border border-slate-100 rounded-[2rem] bg-white shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary opacity-5 rounded-bl-full translate-x-4 -translate-y-4"></div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black italic shadow-lg">
                                 {ref.name?.charAt(0) || "R"}
                              </div>
                              <div className="leading-none">
                                 <p className="font-black text-blue-950 italic text-lg">{ref.name}</p>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5">{ref.relationship || "Former Employer"}</p>
                              </div>
                           </div>
                           <span className="text-[10px] font-black text-tertiary bg-tertiary-fixed px-3 py-1 rounded-full uppercase tracking-widest border border-tertiary-fixed-dim">Verified</span>
                        </div>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed italic line-clamp-3">"{ref.comment || "Elena was incredibly reliable and professional throughout her tenure with our family."}"</p>
                     </div>
                   ))}
                   {!selectedCandidate.references?.length && (
                     <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                        <MaterialIcon name="assignment_ind" className="text-4xl text-slate-200 mb-4" />
                        <p className="text-xs font-black text-slate-300 uppercase tracking-widest italic">No professional references provided for vetting.</p>
                     </div>
                   )}
                </div>
              </section>

              {/* Step 5: Logistics */}
              <section className="animate-in fade-in slide-in-from-bottom-2 duration-500 delay-400 pb-20">
                 <div className="flex items-center gap-4 mb-8">
                    <span className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black italic text-lg shadow-xl shadow-primary/20">5</span>
                    <h3 className="font-headline font-black text-2xl text-blue-950 italic tracking-tight">Core Logistics</h3>
                    <div className="ml-auto h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent mx-6"></div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing Model</p>
                       <p className="text-3xl font-black font-headline text-primary italic leading-none inline-flex items-baseline gap-1">
                          ${selectedCandidate.hourlyRate || "25"}
                          <span className="text-sm font-bold text-slate-400">/HR</span>
                       </p>
                       <div className="flex items-center gap-2 pt-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                          <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">Market Fair</span>
                       </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</p>
                       <p className="text-3xl font-black font-headline text-primary italic leading-none inline-flex items-baseline gap-1">
                          {selectedCandidate.experienceYears || "0"}
                          <span className="text-sm font-bold text-slate-400">YRS</span>
                       </p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2">Vetted Tenure</p>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-2 col-span-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Availability Status</p>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {(selectedCandidate.availability ? Object.keys(selectedCandidate.availability).filter(k => selectedCandidate.availability[k]) : ["Full-Time (Mon-Fri)"]).map((day, i) => (
                             <span key={i} className="px-3 py-1 bg-white rounded-lg border border-slate-200 text-[10px] font-black text-primary uppercase tracking-widest shadow-sm">
                                {day}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>
              </section>
            </div>

            {/* Sticky Actions Bar (Professional Audit Decision Hub) */}
            <div className="p-10 bg-slate-50/80 backdrop-blur-md border-t border-slate-100 flex flex-col gap-8 z-30">
               {/* Quick Decisions & Notes */}
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <MaterialIcon name="rate_review" className="text-sm" />
                        Moderator Audit Feedback
                     </label>
                     <div className="flex gap-2">
                        {["Blurry ID", "Selfie Mismatch", "Incomplete profile", "Expired ID"].map(template => (
                           <button
                             key={template}
                             onClick={() => setNotes(prev => prev ? `${prev}. ${template}` : template)}
                             className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary transition-all"
                           >
                              +{template}
                           </button>
                        ))}
                     </div>
                  </div>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter audit notes or rejection reasons here. This will be sent to the candidate via Pulse Sync."
                    className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all outline-none min-h-[100px]"
                  />
               </div>

               <div className="flex items-center justify-between">
                 <div className="flex gap-4">
                    <button 
                      onClick={() => handleAction("rejected")}
                      disabled={processing}
                      className="px-8 py-4 bg-rose-600 text-white rounded-[1.5rem] font-black uppercase italic tracking-widest text-xs flex items-center gap-3 shadow-xl shadow-rose-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                       <MaterialIcon name="flag" className="text-lg" />
                       Send Rejection / Flag
                    </button>
                    <button 
                      disabled={processing}
                      onClick={() => {
                        window.open(`mailto:${selectedCandidate.email}?subject=Question about your Kindred application`, '_blank');
                      }}
                      className="px-8 py-4 bg-white text-primary border-2 border-primary/10 rounded-[1.5rem] font-black uppercase italic tracking-widest text-xs hover:bg-slate-100 transition-all active:scale-95 flex items-center gap-2"
                    >
                       <MaterialIcon name="mail" className="text-sm" />
                       Direct Query
                    </button>
                 </div>
                 <button 
                   onClick={() => handleAction("verified")}
                   disabled={processing || selectedCandidate.status === "verified"}
                   className={cn(
                     "px-14 py-5 rounded-[1.8rem] font-black uppercase italic tracking-widest text-sm flex items-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50",
                     selectedCandidate.status === "verified" 
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                      : "bg-gradient-to-br from-primary to-primary-900 text-white shadow-primary/20 hover:scale-[1.03]"
                   )}
                 >
                    <MaterialIcon name="verified" className="text-xl" fill />
                    {selectedCandidate.status === "verified" ? "Verified & Published" : "Approve & Verify Profile"}
                 </button>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="lg:w-2/3 w-full bg-slate-50 flex items-center justify-center rounded-[2.5rem] border-2 border-dashed border-slate-200 opacity-50 grayscale py-40">
             <div className="text-center space-y-6">
                <MaterialIcon name="person_search" className="text-8xl text-slate-200" />
                <div className="space-y-1">
                   <p className="font-headline font-black text-2xl text-slate-400 italic">No Selection</p>
                   <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Select a candidate from the queue to audit.</p>
                </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
