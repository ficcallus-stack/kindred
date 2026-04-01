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

  const toggleDuty = (duty: string) => {
    const duties = { ...(data.duties || {}) };
    duties[duty] = !duties[duty];
    updateData({ duties });
  };

  const applyTemplate = (text: string) => {
    updateData({ description: text });
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Section 1: Certifications */}
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

      {/* Section 2: Duties */}
      <section className="bg-surface-container-low -mx-6 px-6 py-10 md:mx-0 md:rounded-3xl border border-outline-variant/10 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <h2 className="font-headline text-xl font-bold text-primary mb-2">Daily Duties & Responsibilities</h2>
          <p className="text-on-surface-variant mb-8">What will a typical day look like for your Kindred Caregiver?</p>
          <div className="flex flex-wrap gap-3">
            {DUTIES.map((duty) => {
              const isSelected = data.duties?.[duty];
              return (
                <button
                  key={duty}
                  onClick={() => toggleDuty(duty)}
                  className={cn(
                    "px-5 py-3 rounded-full font-medium text-sm flex items-center gap-2 border transition-all active:scale-95 shadow-sm",
                    isSelected
                      ? "bg-tertiary-fixed text-on-tertiary-fixed border-transparent"
                      : "bg-surface-container-lowest text-on-surface-variant border-outline-variant/15 hover:bg-white"
                  )}
                  type="button"
                >
                  <MaterialIcon name={isSelected ? "check" : "add"} className="text-lg" />
                  {duty}
                </button>
              );
            })}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
      </section>

      {/* Section 3: Languages & Requirements */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-8">
          <div>
            <label className="block font-headline font-bold text-primary mb-2">Language Requirements</label>
            <p className="text-sm text-on-surface-variant mb-4">Does your family speak multiple languages at home?</p>
            <div className="relative">
              <select
                className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-4 appearance-none focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-primary cursor-pointer hover:bg-surface-container-lowest/80"
                value={data.language || ""}
                onChange={(e) => updateData({ language: e.target.value })}
              >
                <option value="">English (Primary)</option>
                <option value="bilingual_es">Bilingual (Spanish preferred)</option>
                <option value="bilingual_fr">Bilingual (French preferred)</option>
                <option value="bilingual_zh">Bilingual (Mandarin preferred)</option>
                <option value="multilingual">Multilingual</option>
              </select>
              <MaterialIcon name="unfold_more" className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
            </div>
          </div>

          <div className="p-6 bg-secondary-fixed rounded-2xl border border-outline-variant/10 relative overflow-hidden group">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h4 className="font-headline font-bold text-on-secondary-fixed mb-1">Request Video Intro</h4>
                <p className="text-xs text-on-secondary-fixed-variant leading-relaxed">Require applicants to record a 30s hello.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={data.requestVideo || false}
                  onChange={(e) => updateData({ requestVideo: e.target.checked })}
                />
                <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-sm"></div>
              </label>
            </div>
            <MaterialIcon name="videocam" className="absolute -bottom-2 -right-2 text-6xl text-white/10 group-hover:scale-110 transition-transform duration-500" />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block font-headline font-bold text-primary mb-2">Additional Notes</label>
            <div className="mb-4 flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  onClick={() => applyTemplate(t.text)}
                  className="px-3 py-1.5 bg-surface-container-high rounded-full text-[10px] font-bold text-primary border border-outline-variant/15 hover:bg-primary hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
                  type="button"
                >
                  <MaterialIcon name={t.icon} className="text-sm" />
                  {t.name}
                </button>
              ))}
            </div>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-primary placeholder:text-outline/60 min-h-[200px] shadow-sm"
              placeholder="Our 4-year old loves dinosaurs and we encourage outdoor play..."
              value={data.description || ""}
              onChange={(e) => updateData({ description: e.target.value })}
            ></textarea>
            <p className="text-[10px] text-on-surface-variant mt-2 italic text-right">
              {data.description?.length || 0}/5000 characters
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
