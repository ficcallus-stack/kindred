"use client";

import { useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";

interface AvailabilityStepProps {
  data: any;
  onBack: () => void;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIMES = ["Mornings", "Afternoons", "Evenings"];

export default function AvailabilityStep({ data, onBack, onSubmit, isSubmitting }: AvailabilityStepProps) {
  const [availability, setAvailability] = useState(data.times || {});
  const [rate, setRate] = useState(data.rate || "");
  const [locations, setLocations] = useState(data.locations || "");
  const [lat, setLat] = useState<number | undefined>(data.lat);
  const [lng, setLng] = useState<number | undefined>(data.lng);
  const [terms, setTerms] = useState(data.terms || "");

  const toggleSlot = (day: string, time: string) => {
    const key = `${day}-${time}`;
    setAvailability((prev: any) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rate, locations, times: availability, terms, lat, lng });
  };

  return (
    <section className="bg-surface-container-lowest p-8 xl:p-10 rounded-2xl shadow-sm border border-outline-variant/10">
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-4">
          <h2 className="text-primary font-bold font-headline text-lg">Rate & Availability</h2>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Set your expected hourly rate and the areas you're willing to serve. This helps families find a perfect match.
          </p>
        </div>

        {/* Rate and Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-primary font-bold text-xs uppercase tracking-widest">Hourly Rate ($)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">$</span>
              <input
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full bg-surface-container-low border-none rounded-xl pl-8 pr-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-lg"
                placeholder="25.00"
                type="number"
                step="0.50"
                required
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-xs font-bold uppercase">/ hr</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-primary font-bold text-xs uppercase tracking-widest">Service Areas</label>
            <MapboxAutocomplete
              initialLocation={locations}
              onSelect={(loc, selectedLat, selectedLng) => {
                setLocations(loc);
                setLat(selectedLat);
                setLng(selectedLng);
              }}
              placeholder="e.g. Austin, Round Rock"
              inputClassName="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
            />
          </div>
        </div>

        {/* Availability Grid */}
        <div className="space-y-4">
          <label className="block text-primary font-bold text-xs uppercase tracking-widest">Weekly Availability</label>
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="p-2 text-left font-bold text-[10px] text-on-surface-variant uppercase tracking-widest">Time</th>
                  {DAYS.map((day) => (
                    <th key={day} className="p-2 text-center font-bold text-[10px] text-primary uppercase tracking-widest">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMES.map((time) => (
                  <tr key={time}>
                    <td className="p-2 text-[10px] font-bold text-on-surface-variant uppercase whitespace-nowrap">{time}</td>
                    {DAYS.map((day) => (
                      <td key={day} className="p-1">
                        <button
                          type="button"
                          onClick={() => toggleSlot(day, time)}
                          className={cn(
                            "w-full aspect-square rounded-lg transition-all border-2",
                            availability[`${day}-${time}`]
                              ? "bg-secondary-container border-secondary-container"
                              : "bg-surface-container-low border-transparent hover:border-outline-variant"
                          )}
                        ></button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary-container rounded-sm"></div> Selected slots indicate availability.
          </p>
        </div>

        {/* Terms and Custom Rules */}
        <div className="space-y-4">
          <label className="block text-primary font-bold font-headline text-lg italic underline decoration-secondary decoration-2 underline-offset-4">My Terms & House Rules</label>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Specify any additional terms such as "pet friendly", "non-smoking environment only", "overtime rules", etc.
          </p>
          <textarea
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 resize-none font-medium h-32"
            placeholder="e.g. I require at least 24 hours notice for cancellations..."
            required
          ></textarea>
        </div>

        {/* Final Submit Button */}
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
            disabled={isSubmitting}
            className="bg-primary disabled:opacity-50 text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-3"
          >
            {isSubmitting ? "Registering..." : "Complete Registration"}
            <MaterialIcon name="done_all" className="text-sm" />
          </button>
        </div>
      </form>
    </section>
  );
}
