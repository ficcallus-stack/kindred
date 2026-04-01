"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Milestone {
  id: string;
  content: string;
  photoUrl?: string | null;
  type: string;
  createdAt: any;
  caregiverName: string;
}

interface ScrapbookProps {
  milestones: Milestone[];
}

export function Scrapbook({ milestones = [] }: ScrapbookProps) {
  if (milestones.length === 0) return (
     <div className="bg-surface-container-low p-12 rounded-[3.5rem] border-2 border-dashed border-outline-variant/10 text-center space-y-6 opacity-40 grayscale group hover:grayscale-0 transition-all duration-1000">
        <MaterialIcon name="auto_stories" className="text-6xl text-primary" />
        <div className="space-y-2">
            <h3 className="font-headline text-3xl font-black text-primary italic tracking-tighter">Your Shared Legacy</h3>
            <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant max-w-sm mx-auto leading-relaxed">
              "Capturing the tiny victories and big milestones shared between your family and your trusted caregivers."
            </p>
        </div>
        <p className="text-[10px] font-bold text-slate-400 italic">No milestones registered yet. Awaiting your nanny's first post.</p>
     </div>
  );

  return (
    <div className="space-y-10 group/scrapbook">
      <div className="flex items-center justify-between px-6">
         <div className="flex items-center gap-4">
            <div className="w-1.5 h-12 bg-amber-500 rounded-full"></div>
            <h2 className="font-headline text-4xl font-black text-primary tracking-tighter italic leading-none">The Kindred Scrapbook</h2>
         </div>
         <button className="p-4 bg-primary text-white rounded-2xl hover:scale-110 active:scale-95 transition-all shadow-xl shadow-primary/20">
            <MaterialIcon name="style" fill />
         </button>
      </div>

      <div className="flex gap-10 overflow-x-auto pb-12 scrollbar-hide snap-x px-6 -mx-6">
        {milestones.map((milestone, idx) => (
          <div 
            key={milestone.id} 
            className={cn(
               "snap-start shrink-0 w-80 bg-white p-6 rounded-[3rem] shadow-xl border border-outline-variant/5 transition-all duration-700 hover:-translate-y-4 hover:shadow-2xl relative group/card",
               idx % 2 === 0 ? "rotate-1" : "-rotate-1"
            )}
          >
             {milestone.photoUrl ? (
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-6 relative shadow-inner">
                   <img src={milestone.photoUrl} alt="Moment" className="w-full h-full object-cover grayscale-0 group-hover/card:scale-110 transition-transform duration-1000" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                   <div className="absolute bottom-6 left-6 right-6 text-white text-[10px] font-black uppercase tracking-widest leading-tight">
                       <MaterialIcon name="place" className="text-xs inline mr-1" />
                       Recorded by {milestone.caregiverName.split(" ")[0]}
                   </div>
                </div>
             ) : (
                <div className="aspect-[4/5] rounded-[2rem] bg-surface-container-high flex flex-col items-center justify-center p-8 text-center space-y-4 mb-6 border border-outline-variant/10">
                   <MaterialIcon name="edit_note" className="text-5xl text-primary/20" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-relaxed italic">
                      "A milestone captured through words and care."
                   </p>
                </div>
             )}

             <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest rounded-full border border-amber-100">
                   {milestone.type.replace("_", " ")}
                </span>
                <p className="text-sm font-medium text-primary italic leading-relaxed line-clamp-3">
                   "{milestone.content}"
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/5">
                   <span className="text-[10px] font-bold text-slate-300 uppercase">
                      {format(new Date(milestone.createdAt), "MMM d, yyyy")}
                   </span>
                   <button className="text-primary/20 hover:text-rose-500 transition-colors">
                      <MaterialIcon name="favorite" fill />
                   </button>
                </div>
             </div>
          </div>
        ))}

        {/* Closing Card */}
        <div className="snap-start shrink-0 w-80 bg-surface-container-high p-12 rounded-[3rem] border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center space-y-6 grayscale opacity-40">
           <MaterialIcon name="auto_awesome" className="text-6xl" />
           <p className="text-xs font-black uppercase tracking-widest text-on-surface-variant leading-relaxed">
             This is where your family's history lives. 
           </p>
        </div>
      </div>
    </div>
  );
}
