"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface CertificationsStepProps {
  data: string[];
  onNext: (data: string[]) => void;
  onBack: () => void;
}

const CERTIFICATIONS = [
  { id: "cpr", label: "CPR Certified", icon: "medical_services" },
  { id: "first_aid", label: "First Aid Certified", icon: "emergency" },
  { id: "newborn", label: "Newborn Care Specialist", icon: "child_care" },
  { id: "bilingual", label: "Bilingual (ES/EN)", icon: "translate" },
  { id: "sleep", label: "Sleep Training Expert", icon: "bedtime" },
  { id: "cooking", label: "Organic Meal Prep", icon: "kitchen" },
  { id: "special_needs", label: "Special Needs Experience", icon: "diversity_3" },
  { id: "tutoring", label: "STEM Tutoring", icon: "school" },
  { id: "driving", label: "Clean Driving Record", icon: "directions_car" },
];

export default function CertificationsStep({ data, onNext, onBack }: CertificationsStepProps) {
  const [selected, setSelected] = useState<string[]>(data);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(selected);
  };

  return (
    <section className="bg-surface-container-lowest p-8 xl:p-10 rounded-2xl shadow-sm border border-outline-variant/10">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-4">
          <h2 className="text-primary font-bold font-headline text-lg">Skills & Certifications</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Select the certifications and specialized skills you currently possess. These will be highlighted on your profile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CERTIFICATIONS.map((cert) => (
            <button
              key={cert.id}
              type="button"
              onClick={() => toggle(cert.id)}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                selected.includes(cert.id)
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-surface-container-low hover:border-outline-variant text-on-surface-variant"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                selected.includes(cert.id) ? "bg-primary text-white" : "bg-surface-container text-primary"
              )}>
                <MaterialIcon name={cert.icon} className="text-xl" fill={selected.includes(cert.id)} />
              </div>
              <span className="font-bold text-sm">{cert.label}</span>
              {selected.includes(cert.id) && (
                <MaterialIcon name="check_circle" className="ml-auto text-primary" fill />
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-surface-container-low">
          <button
            onClick={onBack}
            type="button"
            className="px-6 py-3 font-bold text-primary hover:opacity-70 transition-opacity flex items-center gap-2"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            Back
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
          >
            Next: Rate & Availability
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </button>
        </div>
      </form>
    </section>
  );
}
