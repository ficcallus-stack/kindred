"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

const FAMILY = {
  name: "The Thompson Family",
  location: "Brooklyn, NY",
  memberSince: "2022",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFpRCeKzd5JZp3QIw567WvP9MAfm8r8CXKiWiCKxhSpbsidyDnuR1IweGIDoyTXk5wmr2xkjJ73gCStFLiB8vl5A0j7bZ7bd-7Ik2x1KBB7-J4WMKfgORfVLjA7VFzPyEZoZo-QJ3Vj_8oS03_Pzfnd7tAnm8szBBzbphrS9HPHz-1iNVtw4421f9tKjocAMLY-rC1h_E0bVXkUqb1Z0paT5Nhw1ujGFvyl1ZlE3Pnt7_sFUYy4qRHxcfEeDCUOfEkkP8mWE6dHmI",
  banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuBQuNtG1V6fUgwknF5WztofAZj4PvbQec70nTji7xTra6trhJvbqWr6VtHXXcs4NFPBqJAVR0RuRH5Iy9QabX5ijN5z7UCCm_vpCaO0-93-D6hmR-OsE5pEtycGX1D1-l5T1QaiuKNxwMF_BwkKhICb3UH5wI8sKQEkmKxXHhh6HW7AqoZAnU-43ftnDonVz2XCjhhCJpGULtEmeZWmyedqdtO-VjgK-_38dDGMjODgCEWnw8pJqEvMwYnPCKWVGNOlO2wX22HLLHM",
  about: [
    "We are a busy professional household with a focus on creative, gentle parenting and outdoor exploration. Mark is an architect and Sarah is a landscape designer, so our home is often filled with music, art supplies, and plants!",
    "Our parenting style is heavily influenced by Montessori principles—we believe in fostering independence and emotional intelligence while maintaining clear, loving boundaries. We're looking for someone who isn't afraid to get their hands dirty in the garden or spend an afternoon building cardboard castles."
  ],
  tags: ["Montessori-Friendly", "Gentle Parenting", "Outdoor Focused"],
  kids: [
    {
      initial: "L",
      name: "Leo, 4",
      trait: "Preschooler • High Energy",
      desc: "Leo is our resident paleontologist. He loves dinosaurs, digging in the sandbox, and is currently learning to ride his tricycle. He attends half-day preschool until 12 PM.",
      color: "border-secondary-container"
    },
    {
      initial: "M",
      name: "Maya, 18 Months",
      trait: "Toddler • Explorer",
      desc: "Maya is a curious observer who recently found her walking legs. She loves story time, music class, and is currently transitioning to a single afternoon nap.",
      color: "border-tertiary-fixed"
    }
  ],
  home: [
    { icon: "pets", title: "Pets", desc: "One golden retriever (Oliver). Extremely friendly and low maintenance." },
    { icon: "deck", title: "Outdoor Space", desc: "Large fenced backyard with a playset and a small vegetable garden." },
    { icon: "gavel", title: "House Rules", desc: "No shoes in the house. Limited screen time for Leo (30m daily). Nut-free home." }
  ],
  reviews: [
    {
      initial: "E",
      name: "Elena R.",
      duration: "Worked for 1.5 years",
      stars: 5,
      comment: "The Thompsons are truly wonderful. They respect your time, provide a very warm environment, and are so communicative. I only left because I'm moving states!"
    }
  ],
  location_desc: "Near Bergen St (F, G trains)"
};

export default function FamilyPublicProfile() {
  return (
    <div className="bg-surface min-h-screen pb-32">

      <main className="pt-24 max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="relative mb-24 animate-in fade-in duration-1000">
          <div className="h-64 md:h-96 w-full rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary to-primary-container relative shadow-2xl">
            <img 
              src={FAMILY.banner} 
              alt="Background" 
              className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay scale-110 hover:scale-100 transition-transform duration-10000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
          
          <div className="max-w-5xl mx-auto px-6">
            <div className="-translate-y-1/2 flex flex-col md:flex-row items-center md:items-end gap-8">
              <div className="relative group">
                <div className="w-44 h-44 md:w-56 md:h-56 rounded-full border-[8px] border-surface p-2 shadow-2xl overflow-hidden bg-white/10 backdrop-blur-3xl group-hover:scale-105 transition-all">
                  <img 
                    alt="Family Avatar" 
                    className="w-full h-full object-cover rounded-full" 
                    src={FAMILY.avatar} 
                  />
                </div>
                <div className="absolute bottom-4 right-4 bg-secondary-container text-on-secondary-container p-3 rounded-full shadow-2xl border-4 border-surface animate-bounce">
                  <MaterialIcon name="verified" className="text-xl" fill />
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left pb-4 space-y-3">
                <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4">
                  <h1 className="text-4xl md:text-6xl font-black text-primary tracking-tighter font-headline">{FAMILY.name}</h1>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black tracking-widest uppercase shadow-sm">Verified Family</span>
                </div>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-on-surface-variant font-black uppercase tracking-widest text-xs opacity-60">
                  <span className="flex items-center gap-2">
                    <MaterialIcon name="location_on" className="text-xl text-secondary" />
                    {FAMILY.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <MaterialIcon name="calendar_today" className="text-xl text-primary" />
                    Member since {FAMILY.memberSince}
                  </span>
                </div>
              </div>

              <div className="pb-4">
                <button className="bg-primary text-on-primary px-10 py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-4 group">
                  Apply to this Job
                  <MaterialIcon name="arrow_forward" className="group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* About Our Family */}
            <article className="bg-surface-container-lowest p-10 md:p-14 rounded-[3.5rem] shadow-sm relative overflow-hidden group hover:shadow-2xl transition-all">
              <div className="absolute top-0 right-0 w-48 h-48 bg-secondary-fixed/10 rounded-bl-full group-hover:bg-secondary-fixed/20 transition-colors"></div>
              <h2 className="text-3xl font-black text-primary mb-8 flex items-center gap-4 italic font-headline tracking-tighter">
                <MaterialIcon name="favorite" className="text-secondary text-4xl" fill />
                About Our Family
              </h2>
              <div className="space-y-6 text-on-surface-variant leading-relaxed text-xl font-medium opacity-80">
                {FAMILY.about.map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="mt-12 flex flex-wrap gap-4">
                {FAMILY.tags.map(tag => (
                  <span key={tag} className="px-6 py-3 rounded-2xl bg-surface-container text-primary font-black uppercase tracking-widest text-[10px] shadow-sm hover:bg-primary hover:text-white transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </article>

            {/* The Kids */}
            <section className="space-y-10">
              <h2 className="text-3xl font-black text-primary px-4 flex items-center gap-4 italic font-headline tracking-tighter">
                <MaterialIcon name="child_care" className="text-secondary text-4xl" />
                The Kids
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {FAMILY.kids.map(kid => (
                  <div key={kid.name} className={cn("bg-surface-container-low p-10 rounded-[3rem] border-b-[12px] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group", kid.color)}>
                    <div className="w-20 h-20 rounded-[1.5rem] bg-white mb-6 flex items-center justify-center text-primary text-4xl font-black shadow-inner group-hover:rotate-12 transition-transform">
                      {kid.initial}
                    </div>
                    <h3 className="text-2xl font-black text-primary mb-2 tracking-tight">{kid.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40 mb-6">{kid.trait}</p>
                    <p className="text-on-surface-variant leading-relaxed font-medium opacity-70 italic">{kid.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section className="bg-primary-container p-10 md:p-14 rounded-[4rem] text-white overflow-hidden relative group shadow-2xl">
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors"></div>
              <h2 className="text-3xl font-black mb-12 flex items-center gap-4 italic font-headline tracking-tighter">
                <MaterialIcon name="star" className="text-secondary-fixed text-4xl" fill />
                Past Nanny Reviews
              </h2>
              <div className="space-y-8">
                {FAMILY.reviews.map(review => (
                  <div key={review.name} className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-inner group/review">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-secondary-fixed text-primary font-black flex items-center justify-center text-xl shadow-lg group-hover/review:scale-110 transition-transform">
                          {review.initial}
                        </div>
                        <div>
                          <p className="font-black text-xl tracking-tight">{review.name}</p>
                          <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{review.duration}</p>
                        </div>
                      </div>
                      <div className="flex text-secondary-container">
                        {[...Array(review.stars)].map((_, i) => (
                          <MaterialIcon key={i} name="star" className="text-xl" fill />
                        ))}
                      </div>
                    </div>
                    <p className="text-white/80 italic leading-relaxed text-lg font-medium opacity-90 p-4 border-l-4 border-secondary-fixed/30 bg-white/5 rounded-r-2xl">
                    "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Info */}
          <aside className="lg:col-span-4 space-y-12">
            
            {/* Home Environment Card */}
            <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10 hover:shadow-2xl transition-all">
              <h3 className="text-2xl font-black text-primary mb-10 italic font-headline tracking-tighter">Our Home</h3>
              <div className="space-y-10">
                {FAMILY.home.map(item => (
                  <div key={item.title} className="flex items-start gap-6 group">
                    <div className="p-4 bg-primary-fixed/30 rounded-2xl text-primary shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform">
                      <MaterialIcon name={item.icon} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-black text-primary text-base tracking-tight">{item.title}</p>
                      <p className="text-on-surface-variant text-sm font-medium opacity-80 leading-relaxed italic">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map / Location */}
            <div className="bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10 group overflow-hidden">
              <h3 className="text-2xl font-black text-primary mb-6 italic font-headline tracking-tighter">Location</h3>
              <div className="h-56 w-full rounded-[2.5rem] mb-6 relative overflow-hidden shadow-inner border-4 border-white">
                <img 
                  alt="Map" 
                  className="w-full h-full object-cover grayscale opacity-40 group-hover:scale-110 transition-transform duration-1000" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAFHexVj4SqTDZDQyexQsjrqi_fhxtjwLmv7WoKOWI3WYX9OH83l-9cHRJKkNP39g5ePk1M01X6-51tg8ESc7Fo7JbFZd1bTnQPtAQWLkeS4kSrm8urVb3IEFDHALvz_OcgXdqljLpn9dHJ0lzYECiSWlO6S4YpH4E6ylL53KXLWPlT17N8wP_C2qWjAZKMFgh9tS2SWqj3u3yvYNCAX7hFdg_gpaT0y2fsR6I0ewdxr70s3QEk3IOecvbvwkwZZbS5QYl6eWIs1c" 
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl border-4 border-white animate-in zoom-in-50">
                    <MaterialIcon name="home" fill />
                  </div>
                </div>
              </div>
              <p className="text-on-surface-variant font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-3 opacity-60">
                <MaterialIcon name="train" className="text-xl text-secondary" />
                {FAMILY.location_desc}
              </p>
            </div>

            {/* Active Listing CTA */}
            <div className="bg-secondary-container p-10 rounded-[3rem] text-on-secondary-container shadow-2xl shadow-orange-900/10 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <h3 className="text-2xl font-black mb-3 italic tracking-tight font-headline">Active Listing</h3>
              <p className="text-sm font-bold mb-8 opacity-80 leading-relaxed italic">Seeking a Full-Time Creative Nanny for Leo & Maya starting next month.</p>
              <button className="w-full bg-on-secondary-container text-secondary-container py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:opacity-90 hover:-translate-y-1 transition-all">
                View Job Details
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
