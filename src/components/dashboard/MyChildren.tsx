"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { addChild } from "@/app/dashboard/parent/children/actions";
import { useToast } from "@/components/Toast";
import { uploadFile } from "@/lib/actions/upload";

interface MyChildrenProps {
  initialChildren: any[];
}

export default function MyChildren({ initialChildren }: MyChildrenProps) {
  const [childrenList, setChildrenList] = useState(initialChildren);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    type: "toddler",
    bio: "",
    photoUrl: "",
    specialNeeds: ""
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uformData = new FormData();
      uformData.append("file", file);
      const res = await uploadFile(uformData);
      setFormData(prev => ({ ...prev, photoUrl: res.url }));
      showToast("Photo uploaded successfully!", "success");
    } catch (err) {
      showToast("Photo upload failed. Check your connection.", "error");
    } finally {
      setIsUploading(false);
    }
  };

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
        bio: formData.bio,
        photoUrl: formData.photoUrl,
        specialNeeds: needsArray,
        interests: []
      });

      // Optimistic update
      setChildrenList([...childrenList, {
        id: crypto.randomUUID(),
        name: formData.name,
        age: Number(formData.age),
        type: formData.type,
        bio: formData.bio,
        photoUrl: formData.photoUrl,
        specialNeeds: JSON.stringify(needsArray),
        interests: JSON.stringify([])
      }]);
      
      setIsModalOpen(false);
      setFormData({ name: "", age: "", type: "toddler", bio: "", photoUrl: "", specialNeeds: "" });
      showToast("Child profile added successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to add child profile. Please try again.", "error");
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
            className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:underline underline-offset-8 transition-all"
          >
            <MaterialIcon name="add_circle" className="text-xl" />
            Add Profile
          </button>
        </div>
        
        <div className="grid sm:grid-cols-2 gap-8">
          {childrenList.length > 0 ? (
            childrenList.map((child: any) => {
              const tags: string[] = (() => { try { return JSON.parse(child.specialNeeds || "[]"); } catch { return []; } })();
              const icon = child.age < 2 ? "baby_changing_station" : child.age < 5 ? "child_care" : "face";
              return (
              <div key={child.id} className="bg-surface-container-low p-8 rounded-[2.5rem] border-l-8 border-secondary shadow-inner relative group hover:shadow-xl transition-all h-full flex flex-col">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden border border-outline-variant/30 shadow-sm group-hover:scale-105 transition-transform">
                      {child.photoUrl ? (
                         <img src={child.photoUrl} alt="Child" className="w-full h-full object-cover" />
                      ) : (
                        <MaterialIcon name={icon} className="text-3xl text-secondary" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-headline text-2xl font-bold text-primary tracking-tight leading-none mb-1 truncate">{child.name}, {child.age}</h3>
                      <p className="text-[9px] font-black uppercase tracking-widest text-secondary opacity-80">{child.type}</p>
                    </div>
                  </div>
                </div>

                {child.bio && (
                  <p className="text-sm text-on-surface-variant italic mb-6 leading-relaxed opacity-70">"{child.bio}"</p>
                )}

                {tags.length > 0 && (
                <div className="mt-auto pt-6 border-t border-outline-variant/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Safety Considerations</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: string) => (
                      <span key={tag} className="px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-tertiary-fixed text-on-tertiary-fixed shadow-sm">
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
            <div className="sm:col-span-2 py-24 flex flex-col items-center justify-center text-center opacity-30 italic">
              <MaterialIcon name="child_care" className="text-7xl mb-6" />
              <p className="font-headline font-bold text-2xl">No child profiles yet.</p>
              <p className="text-sm">Complete your profile to find better matches.</p>
            </div>
          )}
        </div>
      </section>

      {/* Add Child Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] max-w-lg w-full p-10 md:p-14 shadow-2xl space-y-8 relative animate-in zoom-in-95 duration-400 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-10 top-10 text-slate-300 hover:text-primary transition-colors p-2"
            >
              <MaterialIcon name="close" className="text-3xl" />
            </button>

            <div className="space-y-3">
              <h2 className="text-3xl font-headline font-black text-primary tracking-tighter italic">Add Child Profile</h2>
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                <MaterialIcon name="security" className="text-primary text-xl" />
                <p className="text-[11px] font-body text-primary leading-tight font-medium">
                  This profile information is <span className="font-black italic underline">private</span> and only visible to <span className="font-black">Verified Nannies</span> once a booking is confirmed.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Photo Upload Bridge */}
              <div className="flex flex-col items-center gap-4">
                 <div className="h-32 w-32 rounded-[2rem] bg-slate-50 border-2 border-dashed border-outline-variant flex items-center justify-center relative overflow-hidden group hover:border-primary transition-colors">
                    {formData.photoUrl ? (
                      <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <MaterialIcon name="add_a_photo" className="text-4xl text-slate-300 group-hover:text-primary transition-colors" />
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Profile Photo (Optional)</p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2">Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Liam"
                      className="w-full rounded-2xl bg-surface-container-low border-none p-5 focus:ring-2 focus:ring-primary/20 font-bold transition-all"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2">Age</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      max="18"
                      placeholder="0"
                      className="w-full rounded-2xl bg-surface-container-low border-none p-5 focus:ring-2 focus:ring-primary/20 font-bold transition-all"
                      value={formData.age}
                      onChange={e => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2">Category</label>
                  <select 
                    className="w-full rounded-2xl bg-surface-container-low border-none p-5 focus:ring-2 focus:ring-primary/20 font-bold appearance-none transition-all"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="infant">Infant (0-12 months)</option>
                    <option value="toddler">Toddler (1-3 years)</option>
                    <option value="pre-schooler">Pre-schooler (3-5 years)</option>
                    <option value="school-aged">School-aged (5+ years)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2">About (Optional)</label>
                  <textarea 
                    placeholder="Tell caregivers about their personality, hobbies, or daily routine..."
                    className="w-full rounded-2xl bg-surface-container-low border-none p-5 focus:ring-2 focus:ring-primary/20 font-medium h-32 resize-none leading-relaxed transition-all placeholder:font-normal placeholder:opacity-50"
                    value={formData.bio}
                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-2">Safety Consideration</label>
                  <input 
                    type="text" 
                    placeholder="Allergies, ADHD, Routine Needs (comma separated)"
                    className="w-full rounded-2xl bg-surface-container-low border-none p-5 focus:ring-2 focus:ring-primary/20 font-medium transition-all placeholder:font-normal placeholder:opacity-50"
                    value={formData.specialNeeds}
                    onChange={e => setFormData({ ...formData, specialNeeds: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full bg-primary text-white font-black uppercase tracking-widest text-sm py-6 rounded-3xl shadow-2xl shadow-primary/30 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? "Syncing..." : "Publish Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
