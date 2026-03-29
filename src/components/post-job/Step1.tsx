"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import MapboxAutocomplete from "@/components/MapboxAutocomplete";

interface Step1Props {
  availableChildren?: any[];
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function Step1({ availableChildren = [], data, updateData, onNext, onCancel }: Step1Props) {
  const toggleChild = (child: any) => {
    const selected = data.selectedChildrenIds || [];
    const isIn = selected.includes(child.id);
    const nextSelected = isIn ? selected.filter((id: string) => id !== child.id) : [...selected, child.id];
    
    const updates: any = {
      selectedChildrenIds: nextSelected,
      childCount: nextSelected.length > 0 ? nextSelected.length : 1
    };

    // Auto-fill existing manual structure so validation/review steps don't break!
    nextSelected.forEach((id: string, index: number) => {
      const c = availableChildren.find(x => x.id === id);
      if (c) {
        updates[`child${index + 1}Years`] = c.age;
        updates[`child${index + 1}Months`] = 0;
      }
    });

    updateData(updates);
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Main Form Section */}
      <section className="lg:col-span-8 space-y-12">
        {/* Number of Children / Children Selector */}
        <div className="space-y-6">
          <label className="text-xl font-bold font-headline text-primary block">
            {availableChildren.length > 0 ? "Which children need care?" : "How many children need care?"}
          </label>
          
          {availableChildren.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableChildren.map((child: any) => {
                const isSelected = (data.selectedChildrenIds || []).includes(child.id);
                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleChild(child)}
                    className={cn(
                      "p-6 rounded-xl border-2 transition-all active:scale-95 shadow-sm text-left flex items-center gap-4",
                      isSelected
                        ? "border-primary bg-surface-container-lowest"
                        : "border-outline-variant hover:border-primary-container bg-surface-container-lowest"
                    )}
                  >
                    <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                      <MaterialIcon name={child.age < 2 ? "baby_changing_station" : "child_care"} className="text-2xl" />
                    </div>
                    <div className="flex-1">
                      <p className="font-headline font-bold text-primary">{child.name}</p>
                      <p className="text-xs text-on-surface-variant font-medium">{child.age} years old • {child.type}</p>
                    </div>
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                      isSelected ? "border-primary bg-primary text-white" : "border-outline-variant"
                    )}>
                      {isSelected && <MaterialIcon name="check" className="text-sm" fill />}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3, "4+"].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => updateData({ childCount: num })}
                  className={cn(
                    "px-8 py-4 rounded-xl border-2 transition-all active:scale-95 shadow-sm",
                    data.childCount === num
                      ? "border-primary text-primary font-bold bg-surface-container-lowest"
                      : "border-outline-variant text-on-surface-variant font-medium hover:border-primary-container hover:text-primary bg-surface-container-lowest"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Ages of Children (only show if using manual count) */}
        {availableChildren.length === 0 && (
          <div className="space-y-6">
            <label className="text-xl font-bold font-headline text-primary block">
              Ages of children
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: typeof data.childCount === 'number' ? data.childCount : 4 }).map((_, i) => (
                <div key={i} className="bg-surface-container-lowest p-6 rounded-xl shadow-sm space-y-2 border border-black/5 animate-in fade-in zoom-in-95 duration-300">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Child {i + 1}
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/40 py-3 px-4 font-medium"
                      placeholder="Years"
                      type="number"
                      value={data[`child${i + 1}Years`] || ""}
                      onChange={(e) => updateData({ [`child${i + 1}Years`]: e.target.value })}
                    />
                    <input
                      className="w-full bg-surface-container-low border-none rounded-lg focus:ring-2 focus:ring-primary/40 py-3 px-4 font-medium"
                      placeholder="Months"
                      type="number"
                      value={data[`child${i + 1}Months`] || ""}
                      onChange={(e) => updateData({ [`child${i + 1}Months`]: e.target.value })}
                    />
                  </div>
                </div>
              ))}
              {(typeof data.childCount !== 'number' || data.childCount < 4) && (
                <button
                  type="button"
                  onClick={() => updateData({ childCount: Math.min((typeof data.childCount === 'number' ? data.childCount : 4) + 1, 4) })}
                  className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors group"
                >
                  <MaterialIcon name="add_circle" className="group-hover:scale-110 transition-transform" />
                  <span className="font-bold">Add another child</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Location and Timing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="text-xl font-bold font-headline text-primary block">
              Primary location (Area/Zip)
            </label>
            <div className="relative group">
              <MapboxAutocomplete 
                initialLocation={data.location}
                onSelect={(loc) => updateData({ location: loc })}
                inputClassName="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/40 font-medium placeholder:font-normal placeholder:opacity-40"
                placeholder="Where will care take place?"
              />
              <MaterialIcon
                name="location_on"
                className="absolute left-4 top-[1.35rem] text-on-surface-variant pointer-events-none z-10"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-xl font-bold font-headline text-primary block">
              Start date
            </label>
            <div className="relative group">
              <MaterialIcon
                name="calendar_today"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
              />
              <input
                className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl shadow-sm focus:ring-2 focus:ring-primary/40 font-medium cursor-pointer"
                type="date"
                value={data.startDate || ""}
                onChange={(e) => updateData({ startDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Duration Chips */}
        <div className="space-y-6">
          <label className="text-xl font-bold font-headline text-primary block">
            Preferred duration
          </label>
          <div className="flex flex-wrap gap-3">
            {["Full-time", "Part-time", "One-time"].map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => updateData({ duration })}
                className={cn(
                  "px-6 py-3 rounded-full font-bold text-sm transition-all",
                  data.duration === duration
                    ? "bg-tertiary-fixed text-on-tertiary-fixed"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-tertiary-fixed/50"
                )}
              >
                {duration}
              </button>
            ))}
          </div>
        </div>

      </section>

      {/* Sidebar Reassurance */}
      <aside className="lg:col-span-4 space-y-8">
        <div className="bg-primary p-8 rounded-2xl text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative z-10 space-y-6">
            <div className="w-16 h-16 bg-secondary-fixed-dim/20 rounded-2xl flex items-center justify-center">
              <MaterialIcon name="verified_user" className="text-secondary-fixed-dim text-4xl" fill />
            </div>
            <h3 className="text-2xl font-bold font-headline leading-tight">
              Your family's safety is our priority
            </h3>
            <p className="text-primary-fixed/80 text-sm leading-relaxed">
              Every caregiver on Kindred Care undergoes a rigorous 10-step vetting process including
              criminal background checks and identity verification.
            </p>
            <ul className="space-y-4">
              {[
                "100% Background Checked",
                "Identity Verification",
                "Reference Audits",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <MaterialIcon name="check_circle" className="text-tertiary-fixed text-xl" />
                  <span className="text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-surface-container-low p-8 rounded-2xl border-l-4 border-secondary">
          <p className="text-on-surface-variant italic mb-6 leading-relaxed">
            "Finding a nanny who truly felt like part of the family seemed impossible until Kindred
            Care. The process was so thorough and reassuring."
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container">
              <img
                alt="Sarah J."
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2nyDmGpyDdT_g6Eu88Eq49BAWfcS5-O5Cm2hM8mYNkQIWjxjqnpSEuogSDXSdVhHMwvMyz27OVBm7TQ2GkOrGXirxhhKtFo4u_2w5BZvnN_g3Bk2yX70xO3cbHhWsfuCU_u15HanHhLbndwPVclDVCphaH05HwAJEZln44iQ9Y_Zdm0B8yNp51o23yv25PRgFSLRFXV8oXtXAyaMuPBiy-BCsMjpCbzsMEihKByHJkJkV_w8zo5mq4Eyz6AhXRkcn2H2xCnQsYUs"
              />
            </div>
            <div>
              <p className="font-bold text-primary">Sarah Jenkins</p>
              <p className="text-xs text-on-surface-variant">Member since 2022</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
