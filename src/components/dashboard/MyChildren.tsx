"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { addChild } from "@/app/dashboard/parent/children/actions";

interface MyChildrenProps {
  initialChildren: any[];
}

export default function MyChildren({ initialChildren }: MyChildrenProps) {
  const [childrenList, setChildrenList] = useState(initialChildren);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    type: "toddler",
    specialNeeds: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const needsArray = formData.specialNeeds
        ? formData.specialNeeds.split(",").map(t => t.trim()).filter(Boolean)
        : [];
        
      await addChild({
        name: formData.name,
        age: Number(formData.age),
        type: formData.type,
        specialNeeds: needsArray
      });

      // Optimistic update / fast reloading
      setChildrenList([...childrenList, {
        id: crypto.randomUUID(),
        name: formData.name,
        age: Number(formData.age),
        type: formData.type,
        specialNeeds: JSON.stringify(needsArray)
      }]);
      
      setIsModalOpen(false);
      setFormData({ name: "", age: "", type: "toddler", specialNeeds: "" });
    } catch (error) {
      console.error(error);
      alert("Failed to add child profile. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-surface-container-lowest rounded-[3rem] p-10 shadow-sm border border-outline-variant/5">
        <div className="flex justify-between items-center mb-10 px-2">
          <h2 className="font-headline text-3xl font-black text-primary tracking-tighter italic">My Children</h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-8"
          >
            <MaterialIcon name="add_circle" className="text-xl" />
            Add Profile
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {childrenList.length > 0 ? (
            childrenList.map((child: any) => {
              const tags: string[] = (() => { try { return JSON.parse(child.specialNeeds || "[]"); } catch { return []; } })();
              const icon = child.age < 2 ? "baby_changing_station" : child.age < 5 ? "child_care" : "face";
              return (
              <div key={child.id} className="bg-surface-container-low p-8 rounded-[2.5rem] border-l-8 border-secondary shadow-inner relative group hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="font-headline text-2xl font-bold text-primary tracking-tight leading-none mb-1">{child.name}, {child.age}</h3>
                    <p className="text-on-surface-variant text-sm font-black uppercase tracking-widest opacity-40">{child.type}</p>
                  </div>
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-secondary shadow-sm group-hover:scale-110 transition-transform">
                    <MaterialIcon name={icon} className="text-3xl" />
                  </div>
                </div>
                {tags.length > 0 && (
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Special Considerations</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <span key={tag} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-tertiary-fixed text-on-tertiary-fixed">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                )}
              </div>
              );
            })
          ) : (
            <div className="col-span-2 py-20 flex flex-col items-center justify-center text-center opacity-30 italic">
              <MaterialIcon name="child_care" className="text-6xl mb-4" />
              <p className="font-headline font-bold text-xl">No children profiles yet.</p>
              <p className="text-sm">Complete your profile to find better matches.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add Child Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 text-slate-400 hover:text-slate-600"
            >
              <MaterialIcon name="close" className="text-2xl" />
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-headline font-black text-primary tracking-tight">Add Child Profile</h2>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                This information is private and is only visible to verified caregivers during booking.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="Child Name"
                  className="w-full rounded-xl bg-surface-container-low border-none p-4 focus:ring-2 focus:ring-primary/20 font-medium"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Age</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    max="18"
                    placeholder="0"
                    className="w-full rounded-xl bg-surface-container-low border-none p-4 focus:ring-2 focus:ring-primary/20 font-medium"
                    value={formData.age}
                    onChange={e => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Type</label>
                  <select 
                    className="w-full rounded-xl bg-surface-container-low border-none p-4 focus:ring-2 focus:ring-primary/20 font-medium"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="infant">Infant</option>
                    <option value="toddler">Toddler</option>
                    <option value="pre-schooler">Pre-schooler</option>
                    <option value="school-aged">School-aged</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Special Considerations</label>
                <input 
                  type="text" 
                  placeholder="Allergies, ADHD, Routine Needs (comma-separated)"
                  className="w-full rounded-xl bg-surface-container-low border-none p-4 focus:ring-2 focus:ring-primary/20 font-medium"
                  value={formData.specialNeeds}
                  onChange={e => setFormData({ ...formData, specialNeeds: e.target.value })}
                />
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Save Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
