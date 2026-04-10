"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface Step3Props {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const CERTS = [
  { id: "cpr", name: "CPR", icon: "medical_services", desc: "Current infant/child certification required." },
  { id: "first_aid", name: "First Aid", icon: "emergency", desc: "Basic first aid training for emergencies." },
  { id: "badge", name: "Global Care Badge", icon: "verified_user", desc: "Kindred-exclusive background verification.", color: "text-secondary" },
];

const PREREQUISITES = [
  { id: "isNonSmoker", name: "Non-Smoker", icon: "smoke_free" },
  { id: "isSafeDriver", name: "Safe Driver", icon: "directions_car" },
  { id: "hasOwnTransport", name: "Own Transport", icon: "commute" },
  { id: "isVaccinated", name: "Vaccinated", icon: "vaccines" },
  { id: "swimmingProficient", name: "Swimming Proficient", icon: "pool" },
  { id: "passportReady", name: "Passport Ready", icon: "passport" },
  { id: "animalFriendly", name: "Animal Friendly", icon: "pets" },
  { id: "nonDrinker", name: "Non-Drinker", icon: "no_drinks" },
  { id: "willingToTravel", name: "Willing to Travel", icon: "flight_takeoff" },
  { id: "multilingual", name: "Multilingual", icon: "translate" },
  { id: "childhoodEdu", name: "Childhood Ed", icon: "school" },
  { id: "collegeDegree", name: "College Grad", icon: "workspace_premium" },
];

const DUTIES = [
  "Light housekeeping",
  "Meal prep",
  "Homework help",
  "Driving children",
  "Pet care",
  "Grocery shopping",
];

const TEMPLATES = [
  { name: "Active & Fun", icon: "sports_tennis", text: "Our family is looking for an energetic caregiver who loves outdoor activities, sports, and creative play. We encourage limited screen time and plenty of fresh air!" },
  { name: "Educational", icon: "menu_book", text: "We prioritize early childhood development. Looking for someone who can engage our child with age-appropriate learning, reading together, and basic educational games." },
  { name: "Structured", icon: "assignment", text: "Routine is very important for our household. We need a reliable professional who can maintain a strict nap schedule, meal times, and a calm environment." },
];

export default function Step3({ data, updateData, onNext, onBack }: Step3Props) {
  const toggleCert = (id: string) => {
    const certs = { ...(data.certs || {}) };
    certs[id] = !certs[id];
    updateData({ certs });
  };

  const togglePrerequisite = (id: string) => {
    const requirements = { ...(data.requirements || {}) };
    requirements[id] = !requirements[id];
    updateData({ requirements });
  };

  const toggleDuty = (duty: string) => {
    const duties = { ...(data.duties || {}) };
    duties[duty] = !duties[duty];
    updateData({ duties });
  };

  const applyTemplate = (text: string) => {
    updateData({ description: text });
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
      
      {/* Section 1: Prerequisites (Pills Design) */}
      <section>
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                 <MaterialIcon name="rule" className="text-2xl" />
              </div>
              <div>
                 <h2 className="font-headline text-2xl font-black text-primary italic leading-none">Key Prerequisites</h2>
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Foundational Standards</p>
              </div>
           </div>
           <span className="text-[10px] font-black text-on-surface-variant/20 italic uppercase tracking-[0.2em]">Select all that apply</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {PREREQUISITES.map((req) => {
             const isSelected = data.requirements?.[req.id] || false;
             return (
              <button
                key={req.id}
                type="button"
                onClick={() => togglePrerequisite(req.id)}
                className={cn(
                  "px-5 py-3 rounded-full flex items-center gap-3 transition-all active:scale-95 text-xs font-black uppercase tracking-widest italic border-2",
                  isSelected
                    ? "bg-secondary text-white border-secondary shadow-lg shadow-secondary/20"
                    : "bg-surface-container-lowest text-on-surface-variant/60 border-outline-variant/10 hover:border-secondary/40 hover:text-secondary"
                )}
              >
                <MaterialIcon name={req.icon} className={cn("text-lg", isSelected ? "text-white" : "text-secondary")} fill={isSelected} />
                {req.name}
              </button>
             );
          })}
        </div>
      </section>

      {/* Section 2: Certifications */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-headline text-xl font-bold text-primary">Mandatory Certifications</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Select all that apply</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CERTS.map((cert) => (
            <label key={cert.id} className="group relative cursor-pointer">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={data.certs?.[cert.id] || false}
                onChange={() => toggleCert(cert.id)}
              />
              <div className="p-6 h-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl transition-all peer-checked:ring-2 peer-checked:ring-primary/40 peer-checked:bg-primary-fixed/10 group-hover:bg-surface-container-low shadow-[0_32px_48px_rgba(3,31,65,0.05)]">
                <div className="flex flex-col h-full justify-between">
                  <MaterialIcon name={cert.icon} className={cn("text-3xl mb-4", cert.color || "text-primary")} fill={cert.id === 'badge'} />
                  <div>
                    <h3 className="font-headline font-bold text-primary">{cert.name}</h3>
                    <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">{cert.desc}</p>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Section 3: Duties */}
      <section className="bg-surface-container-low -mx-6 px-6 py-10 md:mx-0 md:rounded-[2.5rem] border border-outline-variant/10 relative overflow-hidden group">
        <div className="max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
             <div className="w-14 h-14 bg-tertiary-fixed text-on-tertiary-fixed rounded-2xl flex items-center justify-center shadow-lg mb-6 group-hover:rotate-6 transition-transform">
                <MaterialIcon name="checklist_rtl" className="text-2xl" />
             </div>
             <h2 className="font-headline text-2xl font-black text-primary italic leading-none mb-4">Daily Duties & Responsibilities</h2>
             <p className="text-sm text-on-surface-variant leading-relaxed font-medium italic opacity-70">
                What will a typical day look like? Be as specific as possible about meal prep, school runs, or education.
             </p>
          </div>
          <div className="lg:col-span-8">
            <textarea
              className="w-full bg-white border-2 border-outline-variant/10 rounded-2xl px-6 py-6 focus:ring-4 focus:ring-tertiary-fixed/20 focus:border-tertiary-fixed/40 outline-none transition-all font-body text-primary placeholder:text-outline/40 min-h-[160px] shadow-sm italic font-medium"
              placeholder="e.g. Preparing healthy afternoon snacks, 3:00 PM school pickup, helping with 1st-grade math, and a light tidy of the play area..."
              value={data.duties || ""}
              onChange={(e) => updateData({ duties: e.target.value })}
            ></textarea>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary-fixed/5 rounded-full blur-3xl -z-0 group-hover:scale-110 transition-transform duration-1000"></div>
      </section>

      {/* Section 4: Language & Video Intro */}
      <section className="max-w-2xl mx-auto w-full">
          <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm space-y-6 group">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center group-hover:rotate-3 transition-transform">
                  <MaterialIcon name="language" />
               </div>
               <div>
                  <h3 className="font-headline font-black text-primary italic leading-none">Language Requirement</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 mt-1">Spoken at home</p>
               </div>
            </div>
            <input
              className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/40 py-4 px-5 font-bold text-primary shadow-inner"
              placeholder="e.g. English & Spanish (Bilingual preferred)"
              value={data.language || ""}
              onChange={(e) => updateData({ language: e.target.value })}
            />
          </div>
      </section>

      <section className="bg-white p-10 rounded-[3rem] border border-outline-variant/10 shadow-xl relative overflow-hidden group">
        <label className="block font-headline text-3xl font-black text-primary italic mb-6 text-left">Additional Information</label>
        <div className="mb-6 flex flex-wrap gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t.text)}
              className="px-5 py-2.5 bg-surface-container-high rounded-full text-[10px] font-black uppercase tracking-widest text-primary border border-outline-variant/15 hover:bg-primary hover:text-white transition-all flex items-center gap-2 active:scale-95 shadow-sm"
              type="button"
            >
              <MaterialIcon name={t.icon} className="text-sm" />
              {t.name}
            </button>
          ))}
        </div>
        <textarea
          className="w-full bg-surface-container-low border-none rounded-2xl px-8 py-8 focus:ring-2 focus:ring-primary/40 outline-none transition-all font-body text-primary placeholder:text-outline/40 min-h-[240px] shadow-inner italic font-medium text-lg leading-relaxed"
          placeholder="Any other details we should know about your household routines or expectations..."
          value={data.description || ""}
          onChange={(e) => updateData({ description: e.target.value })}
        ></textarea>
        <div className="flex justify-between items-center mt-4">
           <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 italic">Premium Household Briefing</span>
           <p className="text-[11px] font-black text-on-surface-variant italic">
              {data.description?.length || 0}/5000 characters
           </p>
        </div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-1000"></div>
      </section>
    </div>
  );
}
