"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { addChildrenBatch } from "../actions";
import { AnimatePresence, motion } from "framer-motion";

const CHILD_TYPES = [
  { id: "infant", label: "Infant", icon: "child_care", desc: "0-12 months" },
  { id: "toddler", label: "Toddler", icon: "toys", desc: "1-3 years" },
  { id: "pre-schooler", label: "Pre-schooler", icon: "school", desc: "3-5 years" },
  { id: "school-aged", label: "School-aged", icon: "directions_run", desc: "5+ years" },
];

interface ChildForm {
  id: string;
  name: string;
  age: string;
  type: string;
  bio: string;
  specialNeeds: string[];
  interests: string[];
  medicalNotes: string;
  photoUrl: string;
  uploading: boolean;
}

export default function AddChildPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState<ChildForm[]>([
     { id: Math.random().toString(), name: "", age: "", type: "", bio: "", specialNeeds: [], interests: [], medicalNotes: "", photoUrl: "", uploading: false }
  ]);

  const addChildBlock = () => {
     setChildren([...children, { id: Math.random().toString(), name: "", age: "", type: "", bio: "", specialNeeds: [], interests: [], medicalNotes: "", photoUrl: "", uploading: false }]);
  };

  const removeChildBlock = (id: string) => {
     if (children.length === 1) return;
     setChildren(children.filter(c => c.id !== id));
  };

  const updateChild = (id: string, updates: Partial<ChildForm>) => {
     setChildren(children.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const handlePhotoUpload = async (id: string, file: File) => {
     updateChild(id, { uploading: true });
     try {
        const fileName = `children/${id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
        const res = await fetch("/api/upload/presigned", {
           method: "POST",
           body: JSON.stringify({ fileName, contentType: file.type })
        });
        const { url, publicUrl } = await res.json();
        
        await fetch(url, {
           method: "PUT",
           body: file,
           headers: { "Content-Type": file.type }
        });

        updateChild(id, { photoUrl: publicUrl });
        showToast("Photo uploaded successfully", "success");
     } catch (err) {
        showToast("Failed to upload photo", "error");
     } finally {
        updateChild(id, { uploading: false });
     }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    for (const child of children) {
       if (!child.name || !child.age || !child.type) {
          showToast(`Please complete the basics for ${child.name || 'all children'}.`, "error");
          return;
       }
    }

    setLoading(true);
    try {
      const res = await addChildrenBatch(children.map(c => ({
        name: c.name,
        age: parseInt(c.age),
        type: c.type,
        bio: c.bio,
        specialNeeds: c.specialNeeds,
        interests: c.interests,
        medicalNotes: c.medicalNotes,
        photoUrl: c.photoUrl,
      })));

      if (res.success) {
        showToast(`${res.count} children added to your family!`, "success");
        router.push("/dashboard/parent");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add child profiles.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-40">
      {/* Header / Reassurance Hero */}
      <section className="bg-white/60 backdrop-blur-xl border-b border-outline-variant/10 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
             <Link href="/dashboard/parent" className="flex items-center gap-2 text-primary/40 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-8">
                <MaterialIcon name="arrow_back" className="text-lg" />
                Back to Dashboard
             </Link>
             <h1 className="font-headline text-5xl md:text-7xl font-black text-primary leading-[0.9] italic tracking-tighter">
                Tell us about your <span className="text-secondary opacity-70">little ones.</span>
             </h1>
             <p className="text-on-surface-variant text-lg leading-relaxed font-bold max-w-md opacity-60">
                Detailed profiles help us find the perfect match. Your family's privacy is our top priority.
             </p>
             
             <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-green-100">
                   <MaterialIcon name="verified_user" className="text-lg" fill />
                   Data Encrypted
                </div>
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
                   <MaterialIcon name="security" className="text-lg" fill />
                   Vetted Members Only
                </div>
             </div>
          </div>
          
          <div className="relative group hidden lg:block">
             <div className="absolute inset-0 bg-primary/5 rounded-[4rem] -rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-1000"></div>
             <div className="relative aspect-video bg-white/40 backdrop-blur-md rounded-[3rem] p-4 border border-white shadow-2xl overflow-hidden group">
                <img 
                  src="/safe_childhood_illustration.png" 
                  alt="Safe & Happy Childhood"
                  className="rounded-[2.5rem] w-full h-full object-cover shadow-2xl shadow-primary/10 group-hover:scale-105 transition-transform duration-1000"
                />
             </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form Column (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <AnimatePresence mode="popLayout">
               {children.map((child, index) => (
                 <motion.div 
                   key={child.id}
                   initial={{ opacity: 0, scale: 0.95, y: 20 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   exit={{ opacity: 0, scale: 0.9, y: -20 }}
                   className="relative"
                 >
                    <div className="bg-white/90 backdrop-blur-2xl p-8 lg:p-12 rounded-[3.5rem] border border-white shadow-[0_32px_80px_rgba(0,0,0,0.03)] space-y-12">
                       {children.length > 1 && (
                          <button 
                             type="button"
                             onClick={() => removeChildBlock(child.id)}
                             className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-50 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center z-20 group"
                          >
                             <MaterialIcon name="delete" className="group-hover:scale-110 transition-transform" />
                          </button>
                       )}

                       {/* Header for Child */}
                       <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                          <label className="relative cursor-pointer group shrink-0">
                             <div className="w-32 h-32 rounded-[2.5rem] bg-slate-50 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center text-primary/20 group-hover:border-primary/20 transition-all">
                                {child.photoUrl ? (
                                   <img src={child.photoUrl} className="w-full h-full object-cover" alt="Preview" />
                                ) : (
                                   <MaterialIcon name="add_a_photo" className="text-4xl group-hover:scale-110 transition-transform" />
                                )}
                                {child.uploading && (
                                   <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                   </div>
                                )}
                             </div>
                             <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => e.target.files && handlePhotoUpload(child.id, e.target.files[0])}
                             />
                             <div className="absolute -bottom-2 -right-2 bg-primary text-white w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <MaterialIcon name="edit" className="text-sm" />
                             </div>
                          </label>

                          <div className="space-y-2 pt-2">
                             <h2 className="font-headline text-3xl font-black text-primary italic tracking-tight leading-none">Child Profile #{index + 1}</h2>
                             <p className="text-xs font-bold text-slate-400 opacity-60 uppercase tracking-widest">{child.name || "A little Kindred joining the family"}</p>
                          </div>
                       </div>

                       {/* The Basics */}
                       <div className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Full Name</label>
                              <input 
                                required
                                value={child.name}
                                onChange={(e) => updateChild(child.id, { name: e.target.value })}
                                className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30"
                                placeholder="e.g. Leo"
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Current Age</label>
                              <input 
                                required
                                type="number"
                                value={child.age}
                                onChange={(e) => updateChild(child.id, { age: e.target.value })}
                                className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30"
                                placeholder="Years"
                              />
                           </div>
                         </div>
                       </div>

                       {/* Development Stage */}
                       <div className="space-y-8">
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {CHILD_TYPES.map((ct) => (
                             <button
                               key={ct.id}
                               type="button"
                               onClick={() => updateChild(child.id, { type: ct.id })}
                               className={cn(
                                 "group relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-500 text-center",
                                 child.type === ct.id 
                                   ? "bg-primary border-primary shadow-xl shadow-primary/20 scale-105" 
                                   : "bg-white border-outline-variant/10 hover:border-primary/40 text-on-surface-variant hover:-translate-y-1"
                               )}
                             >
                                <div className={cn(
                                   "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                   child.type === ct.id ? "bg-white/20 text-white" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                                )}>
                                   <MaterialIcon name={ct.icon} className="text-2xl" />
                                </div>
                                <span className={cn(
                                   "text-xs font-black uppercase tracking-widest mb-1",
                                   child.type === ct.id ? "text-white" : "text-primary"
                                )}>{ct.label}</span>
                                <span className={cn(
                                   "text-[9px] font-bold opacity-60",
                                   child.type === ct.id ? "text-white/70" : "text-on-surface-variant"
                                )}>{ct.desc}</span>
                             </button>
                           ))}
                         </div>
                       </div>

                       {/* Care Needs & Health */}
                       <div className="space-y-8">
                          <div className="space-y-6">
                             <div className="space-y-4">
                                <div className="relative">
                                   <input 
                                     onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                           e.preventDefault();
                                           const val = e.currentTarget.value.trim();
                                           if (val) {
                                              updateChild(child.id, { specialNeeds: [...child.specialNeeds, val] });
                                              e.currentTarget.value = "";
                                           }
                                        }
                                     }}
                                     className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30"
                                     placeholder="Add health conditions or needs (Press Enter)..."
                                   />
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                  {child.specialNeeds.map((need, i) => (
                                    <div key={i} className="bg-white border border-outline-variant/20 py-2 pl-4 pr-2 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-left-2 shadow-sm">
                                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">{need}</span>
                                       <button 
                                         type="button"
                                         onClick={() => updateChild(child.id, { specialNeeds: child.specialNeeds.filter((_, idx) => idx !== i) })}
                                         className="w-6 h-6 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                                       >
                                          <MaterialIcon name="close" className="text-sm" />
                                       </button>
                                    </div>
                                  ))}
                                </div>
                             </div>

                             <div className="space-y-4">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Favorite Things / Interests</label>
                                <div className="relative">
                                   <input 
                                     onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                           e.preventDefault();
                                           const val = e.currentTarget.value.trim();
                                           if (val) {
                                              updateChild(child.id, { interests: [...child.interests, val] });
                                              e.currentTarget.value = "";
                                            }
                                         }
                                      }}
                                     className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30"
                                     placeholder="e.g. Legos, Dinosaurs (Press Enter)..."
                                   />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {child.interests.map((interest, i) => (
                                    <div key={i} className="bg-primary/5 text-primary py-2 px-4 rounded-full flex items-center gap-2 border border-primary/10">
                                       <span className="text-[10px] font-black uppercase tracking-widest">{interest}</span>
                                       <button type="button" onClick={() => updateChild(child.id, { interests: child.interests.filter((_, idx) => idx !== i) })}>
                                          <MaterialIcon name="close" className="text-sm" />
                                       </button>
                                    </div>
                                  ))}
                                </div>
                             </div>

                             <div className="space-y-2 pt-4">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Medical History & Safety Notes</label>
                                <textarea 
                                  rows={3}
                                  value={child.medicalNotes}
                                  onChange={(e) => updateChild(child.id, { medicalNotes: e.target.value })}
                                  className="w-full bg-red-50/20 border border-red-100 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-red-500/5 transition-all placeholder:text-red-900/30 resize-none leading-relaxed"
                                  placeholder="Allergies, chronic conditions, emergency protocols..."
                                />
                             </div>

                             <div className="space-y-2 pt-4">
                                <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">General Biography / Personality</label>
                                <textarea 
                                  rows={3}
                                  value={child.bio}
                                  onChange={(e) => updateChild(child.id, { bio: e.target.value })}
                                  className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-medium text-on-surface focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30 resize-none leading-relaxed"
                                  placeholder="Fav routines, favorite games, typical personality..."
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
               ))}
            </AnimatePresence>

            {/* Add Another Child Button */}
            <button 
               type="button"
               onClick={addChildBlock}
               className="group w-full py-10 bg-dashed border-4 border-dashed border-outline-variant/30 rounded-[3.5rem] flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
               <div className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MaterialIcon name="add" className="text-2xl" />
               </div>
               <span className="font-headline text-xl font-black text-primary italic">Add Another Little One</span>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 opacity-60">Complete multiple registrations at once</span>
            </button>
          </div>

          {/* Safety Column (4/12) */}
          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-10 space-y-8">
               <div className="bg-secondary-fixed text-on-secondary-fixed p-8 lg:p-10 rounded-[3rem] shadow-xl space-y-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <MaterialIcon name="health_and_safety" className="text-4xl" fill />
                  <h3 className="font-headline text-3xl font-black italic tracking-tighter leading-[0.9]">Why we ask for this info.</h3>
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Personalized Matching</p>
                        <p className="text-sm font-medium leading-relaxed">Caregivers can see if their experience matches your child's age group and developmental needs.</p>
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Safety Alerts</p>
                        <p className="text-sm font-medium leading-relaxed">By listing allergies or special needs, you ensure caregivers are fully prepared before they even step through your door.</p>
                     </div>
                     <div className="space-y-3 pt-4 border-t border-black/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Privacy Policy</p>
                        <div className="flex gap-4">
                           <MaterialIcon name="verified_user" className="text-amber-600 shrink-0" fill />
                           <p className="text-sm font-bold leading-tight italic text-amber-900/80">
                              "This data is only visible to background verified nannies assigned to your family."
                           </p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border border-white/60 shadow-sm flex flex-col items-center text-center gap-6">
                   <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                      <MaterialIcon name="shield" className="text-3xl" fill />
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">Secure Infrastructure</p>
                      <p className="text-xs font-bold text-on-surface-variant opacity-60">Kindred US uses industry-standard encryption to protect your family's sensitive information.</p>
                   </div>
               </div>

               <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-primary text-white font-headline font-black py-8 px-12 rounded-[2.5rem] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex flex-col items-center gap-1 uppercase tracking-widest text-[12px] disabled:opacity-50"
               >
                  <span>{loading ? "Creating..." : "Secure Profiles"}</span>
                  <p className="text-[8px] opacity-60 font-medium">Add {children.length} {children.length === 1 ? 'child' : 'children'} to Kindred</p>
               </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
