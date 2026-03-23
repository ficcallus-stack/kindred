"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const NANNY = {
  name: "Sarah M.",
  location: "Upper West Side, NY",
  experience: "8+ Years Experience",
  rating: "4.9",
  reviewsCount: "124",
  rate: "$28 - $35",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgG-jd8t6GouUAJUig8WtLMx7gsHxGlpXHPrV7TjT4oISNHTDZ34WQSs-bJayH2qnRY_gz7LBDVTUb87_CEKAuqtRhZlcLUMKcUYZ71dR4XpOwxAW5an7hYHTzUDRGX3bQ5x36-eOrJAEGImOdQJSbpsXKPghZinDaUUcwX2jiLi4TxEn-4haAMc3RTXRitIeExO9wGjn7WebCeIU7MWJ49Jtlg-CexR5y9c1GY05LnqqvpGJCXekoRe4TOmGI9dEHhZB5qg_7tck",
  banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTtS3TmJTo0c89YqsAkD6lnaEO9e1MCxlCUq7l1HVEsUMWfT92Lpvl2ckb5TykJN8UrweRPkY9vnEkAC08_966a_R6q0FnhPDINya8bWFPPQZO86q1ArMuxcOERow6SeVw6cQom1wNmor3-jYEXoIgZxix-TDl0pD4IrVLBQZTWYPil8kCRvk4OiKk1rFCS4uYP79xbLQ3MjGqDIYO4SxGG3SrJZX3bYzDnPNa9YKv4uZTcSoHkahiivdm_BgreRk2P6Yobl7X8_4",
  about: "Hello! I’m Sarah, a dedicated childcare professional with a background in Early Childhood Development. I believe in creating a nurturing environment where children feel safe to explore their curiosity. Over the past 8 years, I've worked with families of all sizes, specializing in creative play and developmental milestones for toddlers and school-aged children.",
  skills: [
    { icon: "medical_services", label: "CPR & First Aid Certified" },
    { icon: "school", label: "Early Ed. Degree" },
    { icon: "restaurant", label: "Nutrition Planning" },
    { icon: "directions_car", label: "Clean Driving Record" },
    { icon: "translate", label: "Bilingual (ESL)" },
    { icon: "pets", label: "Pet Friendly" },
  ],
  verifications: [
    "Government Identity Verified",
    "Enhanced Background Check",
    "Global Care Standard Certified",
    "4x Verified Professional References"
  ],
  reviews: [
    { name: "Jessica D.", date: "October 2023", initial: "JD", rating: 5, comment: "Sarah has been a blessing to our family. She is punctual, incredibly patient with our 3-year-old, and always comes prepared with educational activities. We trust her completely.", color: "bg-secondary-fixed text-on-secondary-fixed" },
    { name: "Marcus T.", date: "September 2023", initial: "MT", rating: 5, comment: "Extremely professional and organized. She helped transition our toddler into a structured schedule which was a huge help for us as working parents.", color: "bg-tertiary-fixed text-on-tertiary-fixed" }
  ]
};

const SCHEDULE = [
  { day: "MON", morning: true, evening: true },
  { day: "TUE", morning: true, evening: false },
  { day: "WED", morning: true, evening: true },
  { day: "THU", morning: true, evening: false },
  { day: "FRI", morning: true, evening: true },
  { day: "SAT", morning: false, evening: false, night: true },
  { day: "SUN", morning: false, evening: false },
];

export default function NannyPublicProfile() {
  return (
    <div className="bg-surface min-h-screen pb-32">
      <Navbar />

      <main className="pt-24 max-w-[1440px] mx-auto px-8 flex flex-col xl:flex-row gap-16 animate-in fade-in duration-1000">
        
        {/* Left Column: Content */}
        <div className="flex-1 space-y-16">
          
          {/* Hero Section */}
          <section className="flex flex-col md:flex-row gap-12 items-end md:items-center relative">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-primary/5 rounded-[2rem] translate-x-4 translate-y-4 -z-10 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform"></div>
              <img 
                src={NANNY.avatar} 
                className="w-72 h-96 object-cover rounded-[2rem] shadow-2xl border-4 border-white relative z-10 transition-transform duration-500 group-hover:scale-[1.02]" 
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 flex items-center gap-2 border border-outline-variant/10">
                <MaterialIcon name="verified" className="text-emerald-500" fill />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Verified Pro</span>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className="bg-tertiary-fixed text-on-tertiary-fixed px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">Top Rated Caregiver</span>
                <div className="flex items-center gap-2 bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/10">
                  <MaterialIcon name="star" className="text-secondary text-sm" fill />
                  <span className="font-black text-primary text-sm tracking-tight">{NANNY.rating}</span>
                  <span className="text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-40">({NANNY.reviewsCount} reviews)</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-primary font-headline tracking-tighter leading-none italic">{NANNY.name}</h1>
              
              <div className="flex flex-wrap gap-8 text-on-surface-variant font-black uppercase tracking-widest text-[10px] opacity-60">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="location_on" className="text-secondary text-xl" />
                  {NANNY.location}
                </div>
                <div className="flex items-center gap-3">
                  <MaterialIcon name="work_history" className="text-primary text-xl" />
                  {NANNY.experience}
                </div>
                <div className="flex items-center gap-3">
                  <MaterialIcon name="verified_user" className="text-primary text-xl" />
                  Fully Verified
                </div>
              </div>
            </div>
          </section>

          {/* About & Video */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-16">
            <article className="space-y-8">
              <h2 className="text-4xl font-black text-primary font-headline tracking-tighter italic flex items-center gap-4">
                <MaterialIcon name="person" className="text-secondary text-4xl" />
                About Me
              </h2>
              <p className="text-xl md:text-2xl text-on-surface-variant leading-relaxed font-medium opacity-80 italic">
                {NANNY.about}
              </p>
            </article>

            {/* Video Bento */}
            <div className="relative rounded-[3rem] overflow-hidden aspect-video group cursor-pointer shadow-2xl shadow-primary/10 border-8 border-white">
              <img 
                src={NANNY.banner} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80" 
              />
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all">
                <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <MaterialIcon name="play_arrow" className="text-primary text-5xl" fill />
                </div>
              </div>
              <div className="absolute bottom-10 left-10 text-white z-20">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Video Introduction</p>
                <p className="text-3xl font-black font-headline tracking-tighter italic">Meet Sarah in 60 Seconds</p>
              </div>
            </div>
          </div>

          {/* Skills Grid */}
          <section className="bg-surface-container-low p-12 md:p-16 rounded-[4rem] space-y-12 shadow-inner border border-white/50">
            <h3 className="text-3xl font-black text-primary font-headline tracking-tighter italic flex items-center gap-4">
              <MaterialIcon name="school" className="text-secondary text-4xl" />
              Skills & Certifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {NANNY.skills.map(skill => (
                <div key={skill.label} className="bg-white p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <MaterialIcon name={skill.icon} />
                  </div>
                  <span className="font-black text-primary text-xs uppercase tracking-widest">{skill.label}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Availability Calendar */}
          <section className="space-y-10">
            <div className="flex justify-between items-baseline px-4">
              <h3 className="text-3xl font-black text-primary font-headline tracking-tighter italic flex items-center gap-4">
                <MaterialIcon name="calendar_month" className="text-secondary text-4xl" />
                Weekly Availability
              </h3>
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 italic">Updated 2 hours ago</span>
            </div>
            
            <div className="grid grid-cols-7 gap-4">
              {SCHEDULE.map(day => (
                <div key={day.day} className="space-y-4">
                  <div className="text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{day.day}</div>
                  <div className={cn("h-24 rounded-[1.5rem] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-all", day.morning ? "bg-primary shadow-lg shadow-primary/20 rotate-2" : "border-2 border-outline-variant/20 opacity-20")}>
                    {day.morning && "Morning"}
                  </div>
                  <div className={cn("h-24 rounded-[1.5rem] flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-all", day.evening ? "bg-primary-container shadow-lg shadow-primary/20 -rotate-2" : "border-2 border-outline-variant/20 opacity-20")}>
                    {day.evening && "Evening"}
                  </div>
                  {day.night && (
                    <div className="h-24 bg-secondary-container rounded-[1.5rem] flex items-center justify-center text-on-secondary-container text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-950/10 rotate-1">
                      Nights
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="space-y-12">
            <h3 className="text-3xl font-black text-primary font-headline tracking-tighter italic flex items-center gap-4">
              <MaterialIcon name="reviews" className="text-secondary text-4xl" />
              What Parents Say
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {NANNY.reviews.map(review => (
                <div key={review.name} className="bg-surface-container-lowest p-10 rounded-[3.5rem] shadow-sm space-y-6 hover:shadow-2xl transition-all border border-outline-variant/5">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg", review.color)}>
                        {review.initial}
                      </div>
                      <div>
                        <p className="font-black text-primary text-xl tracking-tight">{review.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex text-secondary-container">
                      {[...Array(review.rating)].map((_, i) => <MaterialIcon key={i} name="star" className="text-lg" fill />)}
                    </div>
                  </div>
                  <p className="text-on-surface-variant leading-relaxed italic text-lg font-medium opacity-80 border-l-4 border-primary/10 pl-6">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
            <button className="w-full py-6 border-2 border-primary/10 rounded-[2rem] font-black uppercase tracking-widest text-[10px] text-primary hover:bg-surface-container-low transition-all active:scale-95">
              See All {NANNY.reviewsCount} Reviews
            </button>
          </section>
        </div>

        {/* Sidebar: Sticky Actions */}
        <aside className="xl:w-[24rem] space-y-12">
          <div className="sticky top-28 space-y-10">
            
            {/* Verification Card */}
            <div className="bg-primary text-on-primary p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors duration-700"></div>
              <h4 className="text-2xl font-black font-headline mb-8 relative z-10 italic tracking-tighter">Verification Checklist</h4>
              <ul className="space-y-6 relative z-10">
                {NANNY.verifications.map(check => (
                  <li key={check} className="flex items-center gap-4 group/item">
                    <MaterialIcon name="check_circle" className="text-tertiary-fixed text-2xl group-hover/item:scale-125 transition-transform" fill />
                    <span className="text-sm font-black uppercase tracking-widest opacity-80">{check}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Booking Actions */}
            <div className="bg-white p-10 rounded-[3.5rem] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] space-y-8 border border-outline-variant/5">
              <div className="flex justify-between items-baseline">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Nanny Rate</p>
                <div className="text-right">
                  <p className="text-4xl font-black text-primary tracking-tighter italic">{NANNY.rate}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-20">per hour</p>
                </div>
              </div>
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40 transition-all active:scale-95">
                  Schedule Interview
                </button>
                <button className="w-full bg-secondary-fixed text-on-secondary-fixed py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-secondary-container transition-all active:scale-95">
                  Message {NANNY.name.split(' ')[0]}
                </button>
              </div>
              <div className="pt-6 border-t border-outline-variant/10 flex items-center justify-center gap-3">
                <MaterialIcon name="bolt" className="text-orange-600 text-xl" fill />
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Typical response: 15 mins</span>
              </div>
            </div>

            {/* Guarantee Banner */}
            <div className="bg-tertiary-fixed/30 p-8 rounded-[2.5rem] border border-tertiary-fixed/50 group">
              <div className="flex gap-4">
                <MaterialIcon name="shield_with_heart" className="text-primary-container text-3xl group-hover:scale-110 transition-transform" fill />
                <div className="space-y-2">
                  <p className="font-black text-primary-container text-xs uppercase tracking-widest leading-none">KindredCare Guarantee</p>
                  <p className="text-xs text-on-surface-variant font-medium opacity-70 leading-relaxed italic">Every booking is protected by $1M liability insurance and 24/7 support.</p>
                </div>
              </div>
            </div>

          </div>
        </aside>

      </main>

      {/* Shared Footer Integration (Implicit via Navbar if present, otherwise manual) */}
    </div>
  );
}
