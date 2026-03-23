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

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Section 1: Certifications */}
      <section>
        <h2 className="font-headline text-xl font-bold text-primary mb-6">Mandatory Certifications</h2>
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
      <section className="bg-surface-container-low -mx-6 px-6 py-10 md:mx-0 md:rounded-3xl border border-outline-variant/10">
        <div className="max-w-2xl">
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
                    "px-5 py-3 rounded-full font-medium text-sm flex items-center gap-2 border transition-all active:scale-95",
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
          <div>
            <label className="block font-headline font-bold text-primary mb-2">Additional Notes</label>
            <p className="text-sm text-on-surface-variant mb-4">Tell us about your family dynamic or any special needs.</p>
            <textarea
              className="w-full bg-surface-container-lowest border border-outline-variant/15 rounded-xl px-4 py-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-body text-primary placeholder:text-outline/60 min-h-[160px]"
              placeholder="Our 4-year old loves dinosaurs and we encourage outdoor play..."
              value={data.notes || ""}
              onChange={(e) => updateData({ notes: e.target.value })}
            ></textarea>
          </div>
        </div>

        {/* Decorative Editorial Column */}
        <div className="hidden lg:block relative h-full min-h-[400px]">
          <div className="absolute inset-0 bg-primary-fixed/30 rounded-[2.5rem] overflow-hidden group">
            <img
              alt="Family playing"
              className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2X2kjaparMrU3W8GayCZ_3Uz0NiOQCXvaENQju5Yk__7PMoQldYLV14f6yxsKgD2WtnFQ3el2jXR62g5iAC7hG7kRD2aMQD2WrO861MtypREyiuAm4IlTMS9ipcK_ekoFsoNEIrCHhI-cFj6FnUS62rMTOl3E_gHeXZeg1C_ylEkmfyDqDFRnXyg9lkCL1bDTOp0_MoCn-dlOTmyEH8eWI1lbV-LuigQujZ0mwgBMeyIFKZoTQYKYxVFEWTXitfhrMEcMYK4EQm4"
            />
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
              <p className="font-headline font-bold text-primary italic leading-relaxed">
                "The right caregiver isn't just an employee, they become an extension of your family circle."
              </p>
              <div className="flex items-center gap-2 mt-4 text-secondary font-bold text-[10px] uppercase tracking-[0.2em]">
                <span>— NannyConnect Philosophy</span>
              </div>
            </div>
          </div>
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-secondary-fixed rounded-tr-[3rem] rounded-bl-[3rem] -z-10 shadow-lg"></div>
        </div>
      </section>
    </div>
  );
}
