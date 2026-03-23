"use client";

import { MaterialIcon } from "@/components/MaterialIcon";

interface ProfileStepProps {
  data: any;
  onNext: (data: any) => void;
}

export default function ProfileStep({ data, onNext }: ProfileStepProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());
    onNext(values);
  };

  return (
    <section className="bg-surface-container-lowest p-8 xl:p-10 rounded-2xl shadow-sm border border-outline-variant/10">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Photo Upload */}
        <div className="space-y-4">
          <label className="block text-primary font-bold font-headline text-lg">Professional Photo</label>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Families prefer caregivers with clear, friendly profile pictures.
          </p>
          <div className="flex items-center gap-6 mt-4">
            <div className="relative group">
              <div className="w-32 h-32 bg-surface-container-low rounded-[1.5rem] flex items-center justify-center overflow-hidden border-2 border-dashed border-outline-variant group-hover:border-primary transition-colors">
                <MaterialIcon name="add_a_photo" className="text-4xl text-on-surface-variant" />
              </div>
              <button
                className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-full shadow-lg hover:scale-105 transition-transform"
                type="button"
              >
                <MaterialIcon name="edit" className="text-sm" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="px-4 py-2 bg-surface-container text-primary rounded-lg font-bold text-sm hover:opacity-80 transition-opacity"
                type="button"
              >
                Upload Image
              </button>
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                JPG, PNG or WEBP. Max 5MB.
              </span>
            </div>
          </div>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 space-y-2">
            <label className="block text-primary font-bold text-xs uppercase tracking-widest">First Name</label>
            <input
              name="firstName"
              defaultValue={data.firstName}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
              placeholder="e.g. Sarah"
              type="text"
              required
            />
          </div>
          <div className="col-span-1 space-y-2">
            <label className="block text-primary font-bold text-xs uppercase tracking-widest">Last Name</label>
            <input
              name="lastName"
              defaultValue={data.lastName}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
              placeholder="e.g. Jenkins"
              type="text"
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="block text-primary font-bold text-xs uppercase tracking-widest">Email Address</label>
            <input
              name="email"
              defaultValue={data.email}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
              placeholder="sarah.j@example.com"
              type="email"
              required
            />
          </div>
          <div className="col-span-2 space-y-2">
            <label className="block text-primary font-bold text-xs uppercase tracking-widest">Phone Number</label>
            <input
              name="phone"
              defaultValue={data.phone}
              className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40"
              placeholder="(555) 000-0000"
              type="tel"
              required
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-4 pt-4">
          <label className="block text-primary font-bold font-headline text-lg">About You</label>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Tell families about your personality, your approach to childcare, and why you love being a nanny.
          </p>
          <textarea
            name="bio"
            defaultValue={data.bio}
            className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/40 resize-none"
            placeholder="Share your story..."
            rows={5}
            required
            minLength={150}
          ></textarea>
          <div className="flex justify-end">
            <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
              Minimum 150 characters
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-surface-container-low">
          <button
            type="button"
            className="px-6 py-3 font-bold text-primary hover:opacity-70 transition-opacity flex items-center gap-2"
          >
            <MaterialIcon name="arrow_back" className="text-sm" />
            Cancel
          </button>
          <button
            type="submit"
            className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-all flex items-center gap-2"
          >
            Next: References
            <MaterialIcon name="arrow_forward" className="text-sm" />
          </button>
        </div>
      </form>
    </section>
  );
}
