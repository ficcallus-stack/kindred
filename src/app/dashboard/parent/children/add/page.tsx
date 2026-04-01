"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { useToast } from "@/components/Toast";
import { cn } from "@/lib/utils";
import { addChild } from "../actions";

const CHILD_TYPES = [
  { id: "infant", label: "Infant", icon: "child_care", desc: "0-12 months" },
  { id: "toddler", label: "Toddler", icon: "toys", desc: "1-3 years" },
  { id: "pre-schooler", label: "Pre-schooler", icon: "school", desc: "3-5 years" },
  { id: "school-aged", label: "School-aged", icon: "directions_run", desc: "5+ years" },
];

export default function AddChildPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [type, setType] = useState("");
  const [bio, setBio] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [currentNeed, setCurrentNeed] = useState("");

  const handleAddNeed = () => {
    if (currentNeed.trim()) {
      setSpecialNeeds([...specialNeeds, currentNeed.trim()]);
      setCurrentNeed("");
    }
  };

  const handleRemoveNeed = (index: number) => {
    setSpecialNeeds(specialNeeds.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!type) {
      showToast("Please select a child type.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await addChild({
        name,
        age: parseInt(age),
        type,
        bio,
        specialNeeds,
        photoUrl: "", // Optional for now
      });

      if (res.success) {
        showToast(`${name} has been added to your family!`, "success");
        router.push("/dashboard/parent");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to add child profile.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header / Reassurance Hero */}
      <section className="bg-white/60 backdrop-blur-xl border-b border-outline-variant/10 pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
             <Link href="/dashboard/parent" className="flex items-center gap-2 text-primary/40 hover:text-primary transition-colors text-xs font-black uppercase tracking-widest mb-8">
                <MaterialIcon name="arrow_back" className="text-lg" />
                Back to Dashboard
             </Link>
             <h1 className="font-headline text-5xl md:text-7xl font-black text-primary leading-[0.9] italic tracking-tighter">
                Tell us about your <span className="text-secondary opacity-70">little one.</span>
             </h1>
             <p className="text-on-surface-variant text-lg leading-relaxed font-bold max-w-md opacity-60">
                A detailed profile helps us find the perfect match. Your family's privacy is our top priority.
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Form Column (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-10">
            <div className="bg-white/90 backdrop-blur-2xl p-10 lg:p-14 rounded-[3rem] border border-white shadow-[0_32px_80px_rgba(0,0,0,0.03)]">
              <form onSubmit={handleSubmit} className="space-y-12">
                
                {/* Quick Identification */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black tracking-tighter">01</span>
                     <h2 className="font-headline text-2xl font-black text-primary italic">The Basics</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Child's Name</label>
                       <input 
                         required
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30"
                         placeholder="e.g. Leo"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Age</label>
                       <input 
                         required
                         type="number"
                         value={age}
                         onChange={(e) => setAge(e.target.value)}
                         className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30"
                         placeholder="Years"
                       />
                    </div>
                  </div>
                </div>

                {/* Child Type Selection */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black tracking-tighter">02</span>
                     <h2 className="font-headline text-2xl font-black text-primary italic">Developmental Stage</h2>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CHILD_TYPES.map((ct) => (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setType(ct.id)}
                        className={cn(
                          "group relative flex flex-col items-center p-6 rounded-3xl border-2 transition-all duration-500 text-center",
                          type === ct.id 
                            ? "bg-primary border-primary shadow-xl shadow-primary/20 scale-105" 
                            : "bg-white border-outline-variant/10 hover:border-primary/40 text-on-surface-variant hover:-translate-y-1"
                        )}
                      >
                         <div className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors",
                            type === ct.id ? "bg-white/20 text-white" : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
                         )}>
                            <MaterialIcon name={ct.icon} className="text-2xl" />
                         </div>
                         <span className={cn(
                            "text-xs font-black uppercase tracking-widest mb-1",
                            type === ct.id ? "text-white" : "text-primary"
                         )}>{ct.label}</span>
                         <span className={cn(
                            "text-[9px] font-bold opacity-60",
                            type === ct.id ? "text-white/70" : "text-on-surface-variant"
                         )}>{ct.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Care Needs & Health */}
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center text-primary text-[10px] font-black tracking-tighter">03</span>
                      <h2 className="font-headline text-2xl font-black text-primary italic">Care Needs & Health</h2>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-xs font-bold text-on-surface-variant opacity-60 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 italic">
                         "Safety is our mission. Listing any allergies, conditions, or special requirements here helps us alert caregivers before they apply."
                      </p>
                      
                      <div className="space-y-4">
                         <div className="relative">
                            <input 
                              value={currentNeed}
                              onChange={(e) => setCurrentNeed(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNeed())}
                              className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-bold text-primary focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30 pr-16"
                              placeholder="Add allergy, condition, or need..."
                            />
                            <button 
                              type="button"
                              onClick={handleAddNeed}
                              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                            >
                               <MaterialIcon name="add" className="text-xl" />
                            </button>
                         </div>
                         
                         <div className="flex flex-wrap gap-2">
                           {specialNeeds.map((need, i) => (
                             <div key={i} className="bg-white border border-outline-variant/20 py-2 pl-4 pr-2 rounded-full flex items-center gap-3 animate-in fade-in slide-in-from-left-2 shadow-sm">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest">{need}</span>
                                <button 
                                  onClick={() => handleRemoveNeed(i)}
                                  className="w-6 h-6 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center"
                                >
                                   <MaterialIcon name="close" className="text-sm" />
                                </button>
                             </div>
                           ))}
                         </div>
                      </div>

                      <div className="space-y-2 pt-4">
                         <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Additional Notes (Bio)</label>
                         <textarea 
                           rows={4}
                           value={bio}
                           onChange={(e) => setBio(e.target.value)}
                           className="w-full bg-slate-50/50 border border-outline-variant/10 rounded-2xl py-5 px-6 font-medium text-on-surface focus:ring-4 ring-primary/5 focus:border-primary/20 transition-all placeholder:opacity-30 resize-none leading-relaxed"
                           placeholder="Share anything that helps a caregiver understand your child better (routines, favorite games, personality)..."
                         />
                      </div>
                   </div>
                </div>

                <div className="pt-8 flex items-center justify-end">
                   <button 
                     disabled={loading}
                     type="submit"
                     className="bg-primary text-white font-headline font-black py-4 px-12 rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 uppercase tracking-widest text-[10px] disabled:opacity-50"
                   >
                      {loading ? "Creating Profile..." : "Add to Kindred Family"}
                      <MaterialIcon name="favorite" className="text-xl" fill />
                   </button>
                </div>
              </form>
            </div>
          </div>

          {/* Safety Column (4/12) */}
          <div className="lg:col-span-4 space-y-8">
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
                  <div className="space-y-1">
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Complete Privacy</p>
                     <p className="text-sm font-medium leading-relaxed italic opacity-80">"Your data is never sold. It is only shared within a secure booking enclave."</p>
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
          </div>
        </div>
      </main>
    </div>
  );
}
