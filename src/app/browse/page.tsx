import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { db } from "@/db";
import { users, nannyProfiles } from "@/db/schema";
import { eq, and, sql, gte, lte } from "drizzle-orm";

export default async function BrowseNannies({ searchParams }: { searchParams: Promise<{ location?: string, rate?: string }> }) {
  const params = await searchParams;
  const locationFilter = params.location || "";
  const maxRateFilter = params.rate ? parseInt(params.rate) : 100;

  // Fetch nannies with profiles
  const nannies = await db.select({
    id: users.id,
    name: users.fullName,
    email: users.email,
    location: nannyProfiles.location,
    experienceYears: nannyProfiles.experienceYears,
    hourlyRate: nannyProfiles.hourlyRate,
    isVerified: nannyProfiles.isVerified,
    bio: nannyProfiles.bio,
  })
  .from(users)
  .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(
    and(
      eq(users.role, "caregiver"),
      locationFilter ? sql`LOWER(${nannyProfiles.location}) LIKE LOWER(${'%' + locationFilter + '%'})` : undefined,
      params.rate ? lte(nannyProfiles.hourlyRate, sql`${maxRateFilter}`) : undefined
    )
  );

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />

      <div className="flex pt-20">
        {/* Side Filter Shell */}
        <aside className="h-[calc(100vh-5rem)] w-80 sticky top-20 left-0 hidden lg:flex flex-col p-8 space-y-10 bg-surface-container-low border-r border-outline-variant/10 overflow-y-auto">
          <div>
            <h2 className="text-primary font-headline text-2xl font-black tracking-tighter">Filters</h2>
            <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-widest opacity-60">Refine your search</p>
          </div>
          
          <div className="space-y-10">
            {/* Location (Simple Text for now) */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
                <MaterialIcon name="location_on" className="text-secondary" />
                <span>Location</span>
              </div>
              <form action="/browse" method="get">
                <input 
                  name="location"
                  defaultValue={locationFilter}
                  placeholder="Enter city..."
                  className="w-full bg-white border-2 border-transparent rounded-[1.5rem] shadow-sm py-4 px-6 text-on-surface font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                />
              </form>
            </div>

            {/* Rate Range */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
                <MaterialIcon name="payments" className="text-secondary" />
                <span>Max Rate (${maxRateFilter}/hr)</span>
              </div>
              <div className="px-2">
                <Link href={`/browse?rate=${maxRateFilter}`} scroll={false}>
                  <input 
                    className="w-full accent-primary h-2 rounded-full cursor-pointer" 
                    max="100" min="15" step="5" type="range" 
                    value={maxRateFilter}
                    onChange={() => {}} // Controlled by URL in Next.js usually, but let's keep it simple for now
                  />
                </Link>
                <div className="flex justify-between text-[10px] font-black text-slate-400 mt-2 uppercase tracking-wider">
                  <span>$15/hr</span>
                  <span>$100/hr</span>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest text-xs">
                <MaterialIcon name="stars" className="text-primary" />
                <span>Experience</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["1-3 yrs", "4-7 yrs", "8-12 yrs", "12+ yrs"].map((years, i) => (
                  <button 
                    key={years} 
                    className={cn(
                      "rounded-2xl p-3 text-xs font-black transition-all",
                      i === 2 ? "bg-white text-primary shadow-sm" : "bg-transparent text-on-surface-variant/40 hover:bg-white/50"
                    )}
                  >
                    {years}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Link href="/browse" className="mt-auto py-6 text-primary font-black uppercase tracking-widest text-[10px] hover:underline underline-offset-8 text-center opacity-60 hover:opacity-100 transition-all">
            Reset All Filters
          </Link>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 bg-surface p-8 md:p-12 lg:p-20">
          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-black font-headline text-primary tracking-tighter leading-none italic">
                Browse <span className="text-orange-600">Caregivers</span>
              </h1>
              <p className="text-on-surface-variant text-xl font-medium opacity-60 max-w-lg italic">
                Find the perfect match for your family's unique rhythm and needs.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-surface-container-low p-2 rounded-[2rem]">
              <span className="text-[10px] font-black text-slate-400 px-6 uppercase tracking-widest">Sort By</span>
              <button className="bg-white shadow-xl px-8 py-3 rounded-2xl text-primary font-black text-xs uppercase tracking-widest">Recommended</button>
            </div>
          </header>

          {/* Nanny Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
            {nannies.length > 0 ? nannies.map((nanny, i) => (
              <div key={nanny.id} className="group bg-surface-container-lowest p-8 rounded-[3rem] shadow-[0_4px_32px_rgba(3,31,65,0.04)] hover:shadow-[0_40px_80px_-15px_rgba(3,31,65,0.1)] transition-all flex flex-col items-center text-center relative overflow-hidden border border-outline-variant/5">
                
                {/* Identity Verified Badge */}
                {nanny.isVerified && (
                  <div className="absolute top-8 left-8 z-20">
                    <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-sm border border-emerald-50 scale-90 group-hover:scale-100 transition-transform">
                      <MaterialIcon name="check_circle" className="text-emerald-500 text-sm" style={{ fontVariationSettings: "'FILL' 1" }} />
                      <span className="text-emerald-900 text-[10px] font-black uppercase tracking-widest">Verified</span>
                    </div>
                  </div>
                )}

                <div className="w-full aspect-[4/4.5] mb-8 relative">
                  <div className={cn("absolute inset-0 bg-secondary-fixed/5 rounded-[3rem] scale-105 transition-transform group-hover:rotate-0", i % 2 === 0 ? "-rotate-3" : "rotate-3")}></div>
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nanny.name}`} 
                    alt={nanny.name} 
                    className="w-full h-full object-cover rounded-[3rem] shadow-xl relative z-10 transition-transform duration-700 group-hover:scale-[1.02] group-hover:-rotate-1" 
                  />
                </div>

                <div className="space-y-4 w-full">
                  <div>
                    <h3 className="text-3xl font-black text-primary font-headline tracking-tighter leading-none mb-2">{nanny.name}</h3>
                    <p className="text-on-surface-variant text-sm font-black uppercase tracking-widest opacity-40 flex items-center justify-center gap-2">
                      <MaterialIcon name="location_on" className="text-secondary text-base" />
                      {nanny.location || "Location pending"}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2">
                    <span className="bg-surface-container-low text-on-surface-variant text-[10px] font-black px-4 py-1.5 rounded-xl border border-outline-variant/15 uppercase tracking-widest">
                      {nanny.experienceYears}+ Years Exp.
                    </span>
                  </div>

                  <div className="pt-4 flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-black text-primary tracking-tighter italic">${nanny.hourlyRate}</span>
                    <span className="text-slate-400 font-black text-[10px] uppercase tracking-widest">/hr</span>
                  </div>

                  <Link 
                    href={`/nannies/${nanny.id}`}
                    className="w-full block bg-primary text-on-primary font-black uppercase tracking-[0.2em] text-[10px] py-6 rounded-[2rem] shadow-2xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 text-center"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-40 flex flex-col items-center justify-center text-center opacity-30 italic">
                <MaterialIcon name="search_off" className="text-8xl mb-6" />
                <h3 className="text-3xl font-black font-headline text-primary">No Caregivers Found</h3>
                <p className="text-xl">Try adjusting your filters or search keywords.</p>
              </div>
            )}
          </div>

          {/* CTA Banner */}
          <section className="mt-24 bg-primary-container rounded-[4rem] p-12 md:p-20 relative overflow-hidden text-on-primary shadow-2xl shadow-primary/40 group">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-secondary rounded-full opacity-10 blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
              <div className="max-w-2xl space-y-6">
                <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter italic leading-none">
                  Not finding your <span className="text-orange-600 block">perfect match?</span>
                </h2>
                <p className="text-on-primary-container text-xl leading-relaxed font-medium opacity-80 italic">
                  Let the right care come to you. Post a custom job listing and allow our top-tier nannies to apply directly.
                </p>
              </div>
              <div className="flex flex-col gap-6 min-w-[280px]">
                <Link 
                  href="/dashboard/parent/post-job"
                  className="bg-secondary text-on-secondary px-10 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:shadow-orange-950/20 hover:-translate-y-2 transition-all active:scale-95 text-center"
                >
                  Post a Job Listing
                </Link>
                <p className="text-center text-[10px] font-black uppercase tracking-widest opacity-40">Free to post • Cancel anytime</p>
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>
  );
}
