export const dynamic = "force-dynamic";
import { syncUser } from "@/lib/user-sync";
import MessageButton from "@/components/dashboard/MessageButton";
import { redirect } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import { db } from "@/db";
import { applications, jobs, users, nannyProfiles, bookings } from "@/db/schema";
import { eq, desc, or, and } from "drizzle-orm";
import Link from "next/link";

export default async function MyNanniesPage() {
  const user = await syncUser();
  if (!user) redirect("/login");

  // Fetch nannies the parent has hired (bookings) or who have applied
  const hiredNannies = await db.select({
    id: users.id,
    fullName: users.fullName,
    location: nannyProfiles.location,
    rate: nannyProfiles.hourlyRate,
    status: bookings.status,
    lastInteraction: bookings.createdAt,
    type: text('Hired'),
  })
  .from(bookings)
  .innerJoin(users, eq(bookings.caregiverId, users.id))
  .leftJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(eq(bookings.parentId, user.id))
  .orderBy(desc(bookings.createdAt));

  const applicants = await db.select({
    id: users.id,
    fullName: users.fullName,
    location: nannyProfiles.location,
    rate: nannyProfiles.hourlyRate,
    status: applications.status,
    lastInteraction: applications.createdAt,
    type: text('Applicant'),
  })
  .from(applications)
  .innerJoin(jobs, eq(applications.jobId, jobs.id))
  .innerJoin(users, eq(applications.caregiverId, users.id))
  .leftJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(eq(jobs.parentId, user.id))
  .orderBy(desc(applications.createdAt));

  // Merge and deduplicate
  const allNannies = [...hiredNannies, ...applicants].reduce((acc: any[], current) => {
    const x = acc.find(item => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/10 pb-10">
          <div className="space-y-2">
            <h1 className="text-4xl font-black font-headline tracking-tighter text-primary italic">My Nannies</h1>
            <p className="text-on-surface-variant font-medium opacity-60 italic">Caregivers you've hired or who have applied to your jobs.</p>
          </div>
          <div className="flex gap-4">
            <Link href="/browse" className="px-6 py-3 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-secondary transition-all flex items-center gap-2">
              <MaterialIcon name="person_search" />
              Find More
            </Link>
          </div>
        </header>

        {allNannies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allNannies.map((nanny: any) => (
              <div key={nanny.id} className="bg-surface-container-lowest p-6 rounded-[2rem] border border-outline-variant/10 hover:shadow-2xl hover:-translate-y-1 transition-all group">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container-low overflow-hidden shadow-inner">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${nanny.fullName}`} 
                      className="w-full h-full object-cover" 
                      alt={nanny.fullName}
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-headline font-black text-xl text-primary tracking-tight truncate leading-tight">{nanny.fullName}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{nanny.location || "Location Private"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 bg-surface-container-low rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Rate</p>
                    <p className="font-headline font-bold text-primary">${nanny.rate || '20'}/hr</p>
                  </div>
                  <div className="p-3 bg-surface-container-low rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Status</p>
                    <p className="font-headline font-bold text-secondary capitalize">{nanny.status || 'Active'}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link 
                    href={`/nannies/${nanny.id}`}
                    className="flex-1 py-3 bg-white border border-outline-variant/20 rounded-xl text-center font-bold text-[10px] uppercase tracking-widest hover:bg-surface-container-low transition-all"
                  >
                    Profile
                  </Link>
                  <MessageButton 
                    recipientId={nanny.id}
                    className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 bg-surface-container-low rounded-[3rem] border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center opacity-40 italic">
            <MaterialIcon name="diversity_1" className="text-6xl mb-6" />
            <h3 className="font-headline text-2xl font-black mb-2">No Nannies Yet</h3>
            <p className="max-w-xs mx-auto">Nannies who apply to your job or whom you hire will appear here for easy access.</p>
            <div className="flex gap-4 mt-8">
              <Link href="/dashboard/parent/post-job" className="px-8 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] not-italic shadow-xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all">
                Post Your First Job
              </Link>
              <Link href="/browse" className="px-8 py-4 bg-white border border-outline-variant/20 text-primary font-black uppercase tracking-widest text-[10px] not-italic rounded-2xl hover:bg-surface-container-low transition-all">
                Browse Caregivers
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// SQL helper for manual text injection in drizzle results
function text(val: string) {
  return val as any;
}
