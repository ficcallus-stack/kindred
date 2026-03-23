"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";

interface ReferencesStepProps {
  data: any[];
  onNext: (data: any[]) => void;
  onBack: () => void;
}

export default function ReferencesStep({ data, onNext, onBack }: ReferencesStepProps) {
  const [references, setReferences] = useState(
    data.length >= 2 ? data : [
      { name: "", relationship: "", phone: "", email: "" },
      { name: "", relationship: "", phone: "", email: "" }
    ]
  );

  const handleChange = (index: number, field: string, value: string) => {
    const newRefs = [...references];
    newRefs[index] = { ...newRefs[index], [field]: value };
    setReferences(newRefs);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(references);
  };

  return (
    <section className="bg-surface-container-lowest p-8 xl:p-10 rounded-2xl shadow-sm border border-outline-variant/10">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-4">
          <h2 className="text-primary font-bold font-headline text-lg">Parent References</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Please provide at least two professional references from families you've worked with previously.
          </p>
        </div>

        {references.map((ref, index) => (
          <div key={index} className="space-y-6 pt-6 border-t border-surface-container-low">
            <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
              <MaterialIcon name="person" className="text-sm" />
              Reference {index + 1}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-primary font-bold text-[10px] uppercase tracking-widest">Full Name</label>
                <input
                  value={ref.name}
                  onChange={(e) => handleChange(index, "name", e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="e.g. Jane Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-primary font-bold text-[10px] uppercase tracking-widest">Relationship</label>
                <input
                  value={ref.relationship}
                  onChange={(e) => handleChange(index, "relationship", e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="e.g. Previous Employer (3 years)"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-primary font-bold text-[10px] uppercase tracking-widest">Phone Number</label>
                <input
                  value={ref.phone}
                  onChange={(e) => handleChange(index, "phone", e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="(555) 000-0000"
                  type="tel"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-primary font-bold text-[10px] uppercase tracking-widest">Email Address</label>
                <input
                  value={ref.email}
                  onChange={(e) => handleChange(index, "email", e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="jane.doe@example.com"
                  type="email"
                  required
                />
              </div>
            </div>
          </div>
        ))}

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
            Next: Certifications
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </button>
        </div>
      </form>
    </section>
  );
}
