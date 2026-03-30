import { MaterialIcon } from "@/components/MaterialIcon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { users, nannyProfiles, reviews, bookings } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { cache } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { ReviewsSection } from "@/components/reviews/ReviewsSection";
import { syncUser } from "@/lib/user-sync";
import { ProfileGallery } from "@/components/profile/ProfileGallery";
import { NannyAvailability } from "@/components/profile/NannyAvailability";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export const dynamic = 'force-dynamic';

const getNanny = cache(async (id: string) => {
  const result = await db.select({
    id: users.id,
    name: users.fullName,
    profileImageUrl: users.profileImageUrl,
    location: nannyProfiles.location,
    experienceYears: nannyProfiles.experienceYears,
    hourlyRate: nannyProfiles.hourlyRate,
    isVerified: nannyProfiles.isVerified,
    bio: nannyProfiles.bio,
    email: users.email,
    photos: nannyProfiles.photos,
    availability: nannyProfiles.availability,
    education: nannyProfiles.education,
    responseTime: nannyProfiles.responseTime,
    lastActive: nannyProfiles.lastActive,
    activeJobsCount: nannyProfiles.activeJobsCount,
    specializations: nannyProfiles.specializations,
    logistics: nannyProfiles.logistics,
    coreSkills: nannyProfiles.coreSkills,
    certifications: nannyProfiles.certifications,
    videoUrl: nannyProfiles.videoUrl,
    maxTravelDistance: nannyProfiles.maxTravelDistance,
  })
  .from(users)
  .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(eq(users.id, id))
  .limit(1);
  return result[0] as any;
});

const getNannyReviews = cache(async (id: string) => {
  const result = await db.select({
    id: reviews.id,
    rating: reviews.rating,
    comment: reviews.comment,
    images: reviews.images,
    replyText: reviews.replyText,
    createdAt: reviews.createdAt,
    reviewer: {
      fullName: users.fullName,
    },
    totalAmount: bookings.totalAmount,
  })
  .from(reviews)
  .innerJoin(users, eq(reviews.reviewerId, users.id))
  .leftJoin(bookings, eq(reviews.bookingId, bookings.id))
  .where(eq(reviews.revieweeId, id))
  .orderBy(desc(reviews.createdAt));

  return result;
});

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const nanny = await getNanny(id);
  
  if (!nanny) return { title: 'Not Found' };
  
  const title = `${nanny.name} - Premium Childcare Excellence | KindredCare`;
  const description = nanny.bio || `Hire ${nanny.name}, a vetted caregiver with ${nanny.experienceYears} years of experience. Rate: $${nanny.hourlyRate}/hr`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      images: [nanny.profileImageUrl || nanny.photos?.[0] || ""],
    }
  };
}

export default async function NannyPublicProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const nanny = await getNanny(id);
  const currentUser = await syncUser().catch(() => null);

  let hasBookedBefore = false;
  if (currentUser) {
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.caregiverId, id),
        eq(bookings.parentId, currentUser.id)
      ),
    });
    hasBookedBefore = !!booking;
  }

  if (!nanny) {
    notFound();
  }

  const nannyReviews = await getNannyReviews(id);
  const avgRating = nannyReviews.length > 0 
    ? (nannyReviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0) / nannyReviews.length).toFixed(1)
    : "0";

  const displayName = nanny.name.split(' ')[0] + (nanny.name.split(' ')[1] ? ` ${nanny.name.split(' ')[1][0]}.` : "");

  return (
    <div className="bg-surface min-h-screen font-body text-on-surface antialiased">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Profile Header Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          
          {/* Profile Info & Main Photo */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-surface-container-low p-8 rounded-[2rem]">
            <div className="relative group">
              <img 
                src={nanny.profileImageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nanny.name}`} 
                alt={nanny.name}
                className="w-full aspect-square object-cover rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-[0.75rem] rounded-bl-[0.75rem] shadow-[0_32px_48px_-12px_rgba(3,31,65,0.06)] transition-all duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute -bottom-4 -right-4 bg-primary text-on-primary p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-2">
                  <MaterialIcon name="star" className="text-secondary-fixed-dim" fill />
                  <span className="font-black text-lg tracking-tighter">{avgRating}</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 uppercase">
                    <MaterialIcon name="verified" className="text-[12px]" fill /> Verified Identity
                  </span>
                  {nanny.isVerified && (
                  <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 uppercase">
                    <MaterialIcon name="public" className="text-[12px]" /> Global Care Professional
                  </span>
                  )}
                </div>
                <h1 className="text-6xl font-black font-headline text-primary tracking-tighter leading-none italic">{displayName}</h1>
                <p className="text-xl text-on-surface-variant font-black uppercase tracking-widest opacity-60 italic">Elite Childcare Specialist • {nanny.location || "Brooklyn, NY"}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-outline-variant/15 pt-6">
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase font-black tracking-[0.2em] mb-1 opacity-40">Rate</p>
                  <p className="text-3xl font-black text-primary italic tracking-tighter">${nanny.hourlyRate}<span className="text-sm font-normal text-on-surface-variant italic">/hr</span></p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase font-black tracking-[0.2em] mb-1 opacity-40">Experience</p>
                  <p className="text-3xl font-black text-primary italic tracking-tighter">{nanny.experienceYears}<span className="text-sm font-normal text-on-surface-variant italic"> yrs</span></p>
                </div>
                <div>
                  <p className="text-on-surface-variant text-[10px] uppercase font-black tracking-[0.2em] mb-1 opacity-40">Response</p>
                  <p className="text-3xl font-black text-primary italic tracking-tighter">{nanny.responseTime || "15"}<span className="text-sm font-normal text-on-surface-variant italic"> min</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Booking Card */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <div className="bg-surface-container-lowest p-8 rounded-[2rem] shadow-[0_32px_48px_-12px_rgba(3,31,65,0.06)] border border-white/50 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-headline text-primary">Quick Booking</h3>
                <span className="bg-secondary-fixed text-on-secondary-fixed px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">New Client Offer</span>
              </div>
              <p className="text-on-surface-variant text-sm leading-relaxed opacity-80">
                {nanny.name.split(' ')[0]} is currently available for weekend support and evening concierge care.
              </p>
              <Link 
                href={`/nannies/${nanny.id}/book/schedule`}
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-4 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Book {nanny.name.split(' ')[0]} Now <MaterialIcon name="calendar_today" fill />
              </Link>
              
              <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                <div className="flex items-start gap-4">
                  <MaterialIcon name="security" className="text-secondary text-2xl" fill />
                  <p className="text-[10px] text-on-surface-variant leading-relaxed font-black uppercase tracking-widest opacity-60">KindredCare Trust Guarantee included with every booking.</p>
                </div>
                <div className="flex items-start gap-4">
                  <MaterialIcon name="chat_bubble" className="text-secondary text-2xl" fill />
                  <p className="text-[10px] text-on-surface-variant leading-relaxed font-black uppercase tracking-widest opacity-60">Average response time: Under 15 minutes.</p>
                </div>
                
                {/* Travel Range Widget */}
                <div className="pt-6 border-t border-outline-variant/10">
                  <div className="flex justify-between items-center mb-4">
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-40">Travel Range</span>
                     <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
                        <MaterialIcon name="speed" className="text-[10px] text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">Highly Mobile</span>
                     </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                       <p className="text-xs font-bold text-on-surface-variant italic">Willing to travel up to:</p>
                       <p className="text-lg font-black italic text-primary">{nanny.maxTravelDistance || 25} Miles</p>
                    </div>
                    <div className="relative h-2 w-full bg-surface-container-low rounded-full overflow-hidden">
                       <div className="absolute inset-y-0 left-0 bg-primary/20 w-full" />
                       <div className="absolute inset-y-0 left-0 bg-primary w-2/3 shadow-[0_0_10px_rgba(3,31,65,0.4)]" />
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-secondary text-center opacity-60">
                       Home Based in {nanny.location?.split(',')[0] || "Brooklyn"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Grid (Bento Style) */}
        <section className="mb-24">
          <ProfileGallery photos={nanny.photos || []} name={nanny.name} />
        </section>

        {/* Content Split: Bio & Skills vs Video */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
          <div className="lg:col-span-7 space-y-12">
            <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm space-y-6">
              {nanny.isOccupied && (
                <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl flex items-center gap-3">
                  <MaterialIcon name="pending_actions" className="text-orange-500" fill />
                  <div>
                    <p className="text-[10px] font-black uppercase text-orange-900 leading-none">Currently Hired</p>
                    <p className="text-[9px] font-bold text-orange-700 leading-tight">{nanny.name.split(' ')[0]} is currently supporting another family. You can still message her or book for a future date.</p>
                  </div>
                </div>
              )}
              <h3 className="font-headline text-2xl font-black italic text-primary leading-none">Ready for your family?</h3>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold font-headline text-primary tracking-tighter italic uppercase">About {nanny.name.split(' ')[0]}</h2>
              <div className="space-y-4 text-lg text-on-surface-variant leading-relaxed opacity-80 italic">
                {nanny.bio ? (nanny.bio as string).split('\n').map((p: string, i: number) => <p key={i}>{p}</p>) : (
                  <p>Dedicated professional with a heart for childcare and community building.</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black font-headline text-primary uppercase tracking-[0.3em] opacity-40">Specialized Skills</h3>
              <div className="flex flex-wrap gap-3">
                {((nanny.coreSkills as string[]) || ["CPR & First Aid", "Montessori Certified"]).map((skill: string) => (
                  <span key={skill} className="bg-tertiary-fixed-dim/20 text-on-tertiary-fixed-variant px-5 py-3 rounded-2xl font-black text-[10px] border border-tertiary-fixed/30 flex items-center gap-2 uppercase tracking-widest hover:bg-tertiary-fixed-dim/40 transition-colors">
                    <MaterialIcon name="check_circle" className="text-sm text-tertiary" /> {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28">
              <h3 className="text-xl font-bold font-headline text-primary mb-6">Introduction Video</h3>
              <div className="relative aspect-[9/16] max-h-[600px] w-full bg-primary-container rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
                {nanny.videoUrl ? (
                   <video 
                     src={nanny.videoUrl} 
                     controls 
                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                   />
                ) : (
                  <>
                    <img 
                      className="w-full h-full object-cover opacity-60 transition-transform duration-1000 group-hover:scale-110" 
                      src="https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1000&auto=format&fit=crop" 
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-on-primary p-12 text-center">
                      <div className="w-20 h-20 bg-secondary-fixed text-on-secondary-fixed rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 mb-6 shadow-2xl">
                        <MaterialIcon name="play_arrow" className="text-4xl" fill />
                      </div>
                      <p className="font-black tracking-[0.3em] uppercase text-xs">Watch Introduction</p>
                      <p className="text-[10px] font-medium opacity-60 mt-2">60 Seconds • High Definition</p>
                    </div>
                  </>
                )}
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <p className="text-xs font-black text-white italic tracking-tight opacity-90 leading-relaxed">
                    "Hi, I'm {nanny.name.split(' ')[0]}! I can't wait to meet your family and create a nurturing environment..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Availability Matrix */}
        <section className="mb-24">
          <NannyAvailability availability={nanny.availability} />
        </section>

        {/* Reviews Section */}
        <ReviewsSection 
          nannyId={nanny.id} 
          initialReviews={nannyReviews} 
          currentUserId={currentUser?.id}
          hasBookedBefore={hasBookedBefore}
        />
      </main>
    </div>
  );
}
