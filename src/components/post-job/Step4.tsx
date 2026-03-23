"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface Step4Props {
  data: any;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function Step4({ data, onEdit, onSubmit, onBack }: Step4Props) {
  const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Summary Cards Column */}
      <div className="lg:col-span-2 space-y-8">
        {/* Job Title Card */}
        <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm shadow-blue-900/5 transition-all hover:shadow-md border border-outline-variant/10">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-headline font-bold text-on-surface-variant text-sm uppercase tracking-wider">
              Job Title & Description
            </h3>
            <button onClick={() => onEdit(1)} className="text-primary hover:underline text-sm font-semibold">
              Edit
            </button>
          </div>
          <h2 className="font-headline text-2xl font-bold text-primary mb-3">
            Experienced Nanny for {data.childCount || 2} Active Child{data.childCount > 1 ? 'ren' : ''} in {data.location || 'Austin'}
          </h2>
          <p className="text-on-surface-variant leading-relaxed">
            {data.notes || "Looking for a patient and energetic caregiver to engage our children in creative play, outdoor activities, and light educational tasks. Experience with early childhood development is a plus."}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Family Details Summary */}
          <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
            <div className="flex justify-between items-center mb-6">
              <div className="p-2 bg-primary/5 rounded-lg">
                <MaterialIcon name="family_restroom" className="text-primary" />
              </div>
              <button onClick={() => onEdit(1)} className="text-primary hover:underline text-sm font-semibold">
                Edit
              </button>
            </div>
            <h3 className="font-headline font-bold text-primary text-xl mb-4">Family Details</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary shadow-sm"></span>
                <span className="font-bold text-sm tracking-tight">{data.childCount || 1} Child{data.childCount > 1 ? 'ren' : ''}</span>
              </li>
              <div className="pl-5 space-y-2 border-l-2 border-outline-variant/20 ml-1">
                {Array.from({ length: typeof data.childCount === 'number' ? data.childCount : 4 }).map((_, i) => (
                  <li key={i} className="flex items-center gap-3 text-on-surface-variant text-xs font-medium">
                    <MaterialIcon name="child_care" className="text-sm text-primary opacity-60" />
                    <span>
                      Child {i + 1}: {data[`child${i + 1}Years`] || 0} yrs, {data[`child${i + 1}Months`] || 0} mos
                    </span>
                  </li>
                ))}
              </div>
              <li className="flex items-center gap-3 text-on-surface-variant pt-2">
                <MaterialIcon name="location_on" className="text-secondary" />
                <span className="font-bold text-sm">Location: {data.location || "Austin, TX"}</span>
              </li>
              <li className="flex items-center gap-3 text-on-surface-variant">
                <MaterialIcon name="calendar_today" className="text-secondary" />
                <span className="font-bold text-sm">Starts: {data.startDate || "As soon as possible"}</span>
              </li>
            </ul>
          </section>

          {/* Requirements Summary */}
          <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/5">
            <div className="flex justify-between items-center mb-6">
              <div className="p-2 bg-primary/5 rounded-lg">
                <MaterialIcon name="task_alt" className="text-primary" />
              </div>
              <button onClick={() => onEdit(3)} className="text-primary hover:underline text-sm font-semibold">
                Edit
              </button>
            </div>
            <h3 className="font-headline font-bold text-primary text-xl mb-4">Requirements</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {data.certs?.cpr && (
                <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded-full uppercase tracking-tight flex items-center gap-1">
                  <MaterialIcon name="medical_services" className="text-[14px]" /> CPR
                </span>
              )}
              {data.certs?.first_aid && (
                <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-bold rounded-full uppercase tracking-tight flex items-center gap-1">
                  <MaterialIcon name="healing" className="text-[14px]" /> First Aid
                </span>
              )}
            </div>
            <ul className="space-y-2">
              {Object.entries(data.duties || {})
                .filter(([_, val]) => val)
                .map(([name]) => (
                  <li key={name} className="text-sm text-on-surface-variant flex items-center gap-2">
                    <MaterialIcon name="check" className="text-sm text-secondary" />
                    {name}
                  </li>
                ))}
            </ul>
          </section>
        </div>

        {/* Schedule & Rates Summary */}
        <section className="bg-surface-container-lowest p-8 rounded-xl shadow-sm shadow-blue-900/5 border border-outline-variant/10">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div className="flex-1">
              <h3 className="font-headline font-bold text-primary text-xl mb-4">Schedule & Rates</h3>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {DAYS.map((day) => (
                  <div key={day} className="text-center">
                    <span className="text-[10px] font-bold text-on-surface-variant block mb-1">{day}</span>
                    <div
                      className={cn(
                        "h-6 w-full rounded-sm mb-1",
                        data.schedule?.[`${day.charAt(0) + day.slice(1).toLowerCase()}-morning`]
                          ? "bg-secondary-container"
                          : "bg-surface-container"
                      )}
                    />
                    <div
                      className={cn(
                        "h-6 w-full rounded-sm",
                        data.schedule?.[`${day.charAt(0) + day.slice(1).toLowerCase()}-afternoon`]
                          ? "bg-secondary-container"
                          : "bg-surface-container"
                      )}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="payments" className="text-primary" />
                  <span className="font-headline font-bold text-primary">
                    ${data.minRate || 22} - ${data.maxRate || 28}/hr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MaterialIcon name="event_repeat" className="text-primary" />
                  <span className="text-on-surface-variant text-sm font-medium">
                    {data.duration || "Weekly recurring"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <button onClick={() => onEdit(2)} className="text-primary hover:underline text-sm font-semibold">
                Edit Details
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* Sidebar Info Column */}
      <aside className="space-y-8">
        <div className="bg-primary text-on-primary p-8 rounded-xl shadow-2xl shadow-primary/10 relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-4 inline-flex p-3 bg-white/10 rounded-full">
              <MaterialIcon name="verified_user" fill />
            </div>
            <h4 className="font-headline font-bold text-xl mb-3">Safety & Trust</h4>
            <p className="text-on-primary-container text-sm leading-relaxed mb-6">
              Every job listing on NannyConnect is reviewed by our moderation team within 12 hours. We
              ensure all postings meet our community standards.
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2 text-xs font-medium text-white/80">
                <MaterialIcon name="info" className="text-sm" />
                Verifying identity...
              </li>
              <li className="flex gap-2 text-xs font-medium text-white/80">
                <MaterialIcon name="info" className="text-sm" />
                Screening descriptions...
              </li>
            </ul>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-secondary-container rounded-full opacity-10 blur-3xl"></div>
        </div>

        <div className="relative group">
          <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-sm">
            <p className="italic text-on-surface-variant font-headline text-lg mb-6 leading-relaxed">
              "The right caregiver doesn't just watch your children; they become an extension of your family's heart."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200">
                <img
                  alt="Founder"
                  className="w-full h-full object-cover grayscale"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYnhWhAOcCbTxQKCiNkR9knaKMSk0uYP6bxbwWFWtBxAlS7moQQ7cvcNBldz7T-jMzKSOdWMF2g4oCqm7ZFWGgmrV0FTDjYI-GR3AeSOgrX764U5cnDkvtjNkExpiCs8WRfge0evO351HyrPVdQHhMWa88QkzbxHWKGA-ql-CGGqvjJyYLWkF7j4YPPXOAPt1rg-yfV7LOFtKPG8joK8BZzh9ZFklHJ0bBuHZwtApInL8LG7WqfkZUBzyXkPnc6HDwa0B-kS6D_J8"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-primary">Elena Rodriguez</p>
                <p className="text-xs text-on-surface-variant">Founder, NannyConnect</p>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 bg-secondary rounded-xl opacity-20 hidden md:block"></div>
        </div>
      </aside>
    </div>
  );
}
