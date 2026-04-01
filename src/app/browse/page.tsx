import { db } from "@/db";
import { users, nannyProfiles, parentProfiles } from "@/db/schema";
import { eq, and, sql, lte, desc } from "drizzle-orm";
import BrowseFilters from "@/components/BrowseFilters";
import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { LocationModal } from "@/components/browse/LocationModal";
import { getServerUser } from "@/lib/get-server-user";

export default async function BrowseNannies({ 
  searchParams 
}: { 
  searchParams: Promise<{ location?: string, rate?: string, lat?: string, lng?: string, distance?: string, page?: string, skip?: string }> 
}) {
  const user = await getServerUser();
  const userId = user?.uid;
  const params = await searchParams;
  const isSkipped = params.skip === "true";
  
  let lat = params.lat ? parseFloat(params.lat) : undefined;
  let lng = params.lng ? parseFloat(params.lng) : undefined;
  let locationLabel = params.location || "";

  // Fallback to logged-in user's stored location if no search lat/lng in URL AND not skipped
  if (userId && (!lat || !lng) && !isSkipped) {
    const parent = await db.query.parentProfiles.findFirst({
      where: eq(parentProfiles.id, userId),
    });
    if (parent?.latitude && parent?.longitude) {
      lat = parseFloat(parent.latitude);
      lng = parseFloat(parent.longitude);
      locationLabel = parent.location || locationLabel;
    }
  }

  const maxRateFilter = params.rate ? parseInt(params.rate) : 100;
  const searchDistance = params.distance ? parseInt(params.distance) : 50;
  const page = params.page ? parseInt(params.page) : 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  // We only use distance calculation if coordinates are present AND we didn't skip discovery
  const useProximity = !!(lat && lng && !isSkipped);

  const distanceSql = useProximity
    ? sql`
        (3959 * acos(
          cos(radians(${lat})) * cos(radians(${nannyProfiles.latitude})) *
          cos(radians(${nannyProfiles.longitude}) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(${nannyProfiles.latitude}))
        ))
      `
    : undefined;

  // Fetch nannies with profiles
  const nannies = await db.select({
    id: users.id,
    name: users.fullName,
    email: users.email,
    profileImageUrl: users.profileImageUrl,
    location: nannyProfiles.location,
    experienceYears: nannyProfiles.experienceYears,
    hourlyRate: nannyProfiles.hourlyRate,
    isVerified: nannyProfiles.isVerified,
    isOccupied: nannyProfiles.isOccupied,
    maxTravelDistance: nannyProfiles.maxTravelDistance,
    bio: nannyProfiles.bio,
    distance: distanceSql ? sql<number>`${distanceSql}`.as('distance') : sql`0`.as('distance'),
  })
  .from(users)
  .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(
    and(
      eq(users.role, "caregiver"),
      distanceSql ? lte(distanceSql, searchDistance) : (locationLabel ? sql`LOWER(${nannyProfiles.location}) LIKE LOWER(${'%' + locationLabel + '%'})` : undefined),
      params.rate ? lte(sql`CAST(${nannyProfiles.hourlyRate} AS NUMERIC)`, maxRateFilter) : undefined
    )
  )
  .orderBy(distanceSql ? sql`${distanceSql} ASC` : desc(nannyProfiles.experienceYears))
  .limit(limit)
  .offset(offset);

  return (
    <div className="bg-surface min-h-screen">
      <Navbar />
      <LocationModal />

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto">
        {/* Banner Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4 leading-tight">
                Exceptional Care for <br/><span className="text-secondary">Exceptional Families.</span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed font-medium opacity-60 italic">
                {(locationLabel && useProximity)
                  ? `Discover vetted, local caregivers near ${locationLabel}. Expertly matched for safety and connection.`
                  : "Discover vetted, elite caregivers from around the nation, curated for your family's unique rhythm."
                }
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link 
                href="/dashboard/parent/post-job"
                className="bg-secondary text-white px-8 py-5 rounded-2xl font-black uppercase tracking-[0.1em] text-[11px] flex items-center justify-center shadow-lg shadow-secondary/20 hover:bg-orange-800 transition-all font-label"
              >
                <MaterialIcon name="person_search" className="mr-2" />
                Let nannies find me instead
              </Link>
              <p className="text-[10px] text-on-surface-variant text-center px-4 font-black uppercase tracking-widest opacity-40">Post your needs & get applications</p>
            </div>
          </div>
        </section>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar Filters */}
          <aside className="lg:w-80 shrink-0">
             <BrowseFilters initialLocation={useProximity ? locationLabel : ""} initialRate={maxRateFilter} />
          </aside>

          {/* Nanny Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8 px-2">
              <p className="text-on-surface-variant font-black uppercase tracking-widest text-[10px] opacity-40">
                Found <span className="text-primary font-bold">{nannies.length} results</span> {useProximity ? `near ${locationLabel || "Your Location"}` : "Nationwide"}
              </p>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary cursor-pointer hover:opacity-80 transition-opacity font-label">
                Sort by: Recommended <MaterialIcon name="expand_more" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
              {nannies.map((nanny, i) => (
                <div 
                  key={nanny.id} 
                  className="group bg-surface-container-lowest rounded-[3rem] p-8 shadow-[0_8px_48px_rgba(29,53,87,0.06)] hover:shadow-[0_16px_64px_rgba(29,53,87,0.12)] transition-all duration-500 relative overflow-hidden ring-1 ring-primary/5"
                >
                  <div className="flex gap-10 mb-8">
                    {/* Image (Half width of top section) */}
                    <div className="w-1/2 aspect-square relative flex-shrink-0">
                      <div className={cn(
                        "w-full h-full rounded-[48px_16px_48px_16px] overflow-hidden shadow-2xl ring-8 transition-all group-hover:scale-[1.03] group-hover:rotate-1",
                        nanny.isVerified ? "ring-secondary-fixed/5" : "ring-surface-variant/5",
                        nanny.isOccupied && "grayscale-[30%] opacity-90"
                      )}>
                        <img 
                          src={nanny.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${nanny.name}`} 
                          alt={nanny.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {nanny.isVerified && (
                        <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-2xl z-20">
                          <MaterialIcon name="verified" className="text-secondary text-xl" style={{ fontVariationSettings: "'FILL' 1" }} />
                        </div>
                      )}
                    </div>
                    
                    {/* Content Right (Name, Badge) */}
                    <div className="w-1/2 flex flex-col justify-center gap-4">
                      <div className={cn(
                        "inline-flex items-center px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full w-fit",
                        nanny.isOccupied 
                          ? "bg-error-container text-error" 
                          : "bg-tertiary-fixed/20 text-on-tertiary-fixed"
                      )}>
                        <div className={cn("w-1.5 h-1.5 rounded-full mr-2", nanny.isOccupied ? "bg-error" : "bg-on-tertiary-fixed animate-pulse")} />
                        {nanny.isOccupied ? "Occupied" : "Available Now"}
                      </div>
                      <h3 className="font-headline text-4xl font-black text-primary tracking-tighter italic leading-none group-hover:text-secondary transition-colors">{nanny.name}</h3>
                      <div className="flex flex-col gap-1">
                      </div>
                    </div>
                  </div>

                  {/* Location (Full width below image row) */}
                  <div className="mb-10 bg-surface-container-low/50 p-6 rounded-[2rem] border border-primary/5">
                    <p className="text-on-surface-variant text-sm font-bold flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm flex-shrink-0">
                        <MaterialIcon name="location_on" className="text-secondary text-xl" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-primary font-black italic text-lg leading-tight">
                          {(nanny as any).distance > 0 ? `${(nanny as any).distance.toFixed(1)} miles away` : (nanny.location || "Nearby")}
                        </span>
                        <span className="text-xs font-medium opacity-60 mt-1 uppercase tracking-widest">{nanny.location || "Verified Service Area"}</span>
                      </div>
                    </p>
                    {(nanny as any).distance > 0 && (nanny.maxTravelDistance || 25) >= (nanny as any).distance && !nanny.isOccupied && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl border border-green-100">
                           <MaterialIcon name="direct_route" className="text-[14px]" /> Within Reach
                        </div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="p-1">
                      <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] opacity-30 mb-2">Expertise</p>
                      <p className="font-headline font-black text-primary italic leading-none text-2xl">{nanny.experienceYears}+ YRS</p>
                    </div>
                    <div className="p-1">
                      <p className="text-[10px] uppercase font-black text-on-surface-variant tracking-[0.2em] opacity-30 mb-2">Hourly Rate</p>
                      <p className="font-headline font-black text-primary italic leading-none text-2xl">${nanny.hourlyRate}<span className="text-xs font-medium opacity-40 ml-1">/hr</span></p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-10">
                    <span className="px-4 py-2 bg-secondary-fixed/10 text-secondary text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center border border-secondary/5">
                      <MaterialIcon name="security" className="text-[14px] mr-2" /> Identity Verified
                    </span>
                    {nanny.isVerified && (
                      <span className="px-4 py-2 bg-tertiary-fixed/10 text-tertiary text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center border border-tertiary/5">
                        <MaterialIcon name="public" className="text-[14px] mr-2" /> Global Care
                      </span>
                    )}
                  </div>

                  <div className="pt-2">
                    <Link 
                      href={`/nannies/${nanny.id}`}
                      className={cn(
                        "w-full block py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] transition-all text-center shadow-2xl",
                        nanny.isOccupied 
                         ? "bg-outline-variant text-on-surface-variant cursor-not-allowed opacity-50" 
                         : "bg-primary text-white shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-98"
                      )}
                    >
                      {nanny.isOccupied ? "Fully Booked" : "View Comprehensive Profile"}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {nannies.length === 0 && (
              <div className="py-48 flex flex-col items-center justify-center text-center opacity-40 italic">
                <div className="w-24 h-24 rounded-full bg-surface-container-low flex items-center justify-center mb-8">
                  <MaterialIcon name="location_searching" className="text-4xl text-primary animate-pulse" />
                </div>
                <h3 className="text-4xl font-black font-headline text-primary italic tracking-tight mb-4">No results in this reach</h3>
                <p className="text-xl max-w-md mx-auto leading-relaxed">We couldn't find any caregivers within 50 miles of your current location. Try adjusting your filters.</p>
              </div>
            )}
            
            {/* Pagination */}
            {nannies.length === limit && (
              <div className="mt-20 flex justify-center">
                 <Link 
                   href={`/browse?page=${page + 1}${lat ? `&lat=${lat}` : ''}${lng ? `&lng=${lng}` : ''}`}
                   className="px-16 py-6 bg-white border-2 border-primary text-primary rounded-[2rem] font-black uppercase tracking-[0.3em] text-[12px] hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/10 active:scale-95"
                 >
                   Discover More Local Care
                 </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
