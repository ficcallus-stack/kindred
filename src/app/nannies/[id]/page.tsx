import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function NannyPublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch nanny with profile
  const result = await db.select({
    id: users.id,
    name: users.fullName,
    location: nannyProfiles.location,
    experienceYears: nannyProfiles.experienceYears,
    hourlyRate: nannyProfiles.hourlyRate,
    isVerified: nannyProfiles.isVerified,
    bio: nannyProfiles.bio,
    email: users.email,
  })
  .from(users)
  .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(eq(users.id, id))
  .limit(1);

  if (result.length === 0) {
    notFound();
  }

  const nanny = result[0];

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
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nanny.name}`} 
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
                  <span className="font-black text-primary text-sm tracking-tight">4.9</span>
                  <span className="text-on-surface-variant text-xs font-black uppercase tracking-widest opacity-40">(Verified)</span>
                </div>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black text-primary font-headline tracking-tighter leading-none italic">{nanny.name}</h1>
              
              <div className="flex flex-wrap gap-8 text-on-surface-variant font-black uppercase tracking-widest text-[10px] opacity-60">
                <div className="flex items-center gap-3">
                  <MaterialIcon name="location_on" className="text-secondary text-xl" />
                  {nanny.location || "Location pending"}
                </div>
                <div className="flex items-center gap-3">
                  <MaterialIcon name="work_history" className="text-primary text-xl" />
                  {nanny.experienceYears}+ Years Experience
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
                {nanny.bio || "No bio provided yet."}
              </p>
            </article>

            {/* Video Bento Placeholder */}
            <div className="relative rounded-[3rem] overflow-hidden aspect-video group cursor-pointer shadow-2xl shadow-primary/10 border-8 border-white">
              <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px] group-hover:backdrop-blur-[1px] transition-all">
                <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <MaterialIcon name="play_arrow" className="text-primary text-5xl" fill />
                </div>
              </div>
              <div className="absolute bottom-10 left-10 text-white z-20">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-2">Video Introduction</p>
                <p className="text-3xl font-black font-headline tracking-tighter italic">Meet {nanny.name.split(' ')[0]} in 60 Seconds</p>
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
              {[
                { icon: "medical_services", label: "CPR & First Aid Certified" },
                { icon: "restaurant", label: "Nutrition Planning" },
                { icon: "directions_car", label: "Clean Driving Record" },
              ].map(skill => (
                <div key={skill.label} className="bg-white p-6 rounded-[2rem] flex flex-col gap-4 shadow-sm group hover:shadow-xl hover:-translate-y-1 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-primary-fixed/30 flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-12 transition-transform">
                    <MaterialIcon name={skill.icon} />
                  </div>
                  <span className="font-black text-primary text-xs uppercase tracking-widest">{skill.label}</span>
                </div>
              ))}
            </div>
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
                {[
                  "Government Identity Verified",
                  "Enhanced Background Check",
                  "4x Verified Professional References"
                ].map(check => (
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
                  <p className="text-4xl font-black text-primary tracking-tighter italic">${nanny.hourlyRate}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-20">per hour</p>
                </div>
              </div>
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-br from-primary to-primary-container text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:-translate-y-1 hover:shadow-primary/40 transition-all active:scale-95">
                  Schedule Interview
                </button>
                <button className="w-full bg-secondary-fixed text-on-secondary-fixed py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-secondary-container transition-all active:scale-95">
                  Message {nanny.name.split(' ')[0]}
                </button>
              </div>
              <div className="pt-6 border-t border-outline-variant/10 flex items-center justify-center gap-3">
                <MaterialIcon name="bolt" className="text-orange-600 text-xl" fill />
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Typical response: 15 mins</span>
              </div>
            </div>
          </div>
        </aside>

      </main>
    </div>
  );
}
