"use client";

import { redirect, useParams } from "next/navigation";
import Link from "next/link";
import { MaterialIcon } from "@/components/MaterialIcon";
import { use, useState, useEffect } from "react";
import { getJobApplications } from "../../actions";
import { cn } from "@/lib/utils";
import { BookingModal } from "@/components/profile/BookingModal";

export default function JobApplicationsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [job, setJob] = useState<any>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedNanny, setSelectedNanny] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchData() {
        try {
            const apps = await getJobApplications(id);
            setApplicants(apps);
            
            if (apps.length > 0) {
                setJob(apps[0].job);
            } else {
                // Future improvement: Explicitly fetch job by ID if no applicants exist
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    fetchData();
  }, [id]);

  if (loading) return (
      <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
  );

  // Fallback for when data exists but job wasn't correctly populated
  if (!loading && applicants.length > 0 && !job) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-surface-container-low">
              <p className="text-primary font-black uppercase tracking-widest text-xs">Synchronizing Data...</p>
          </div>
      );
  }

  const handleHireClick = (nanny: any, app: any) => {
    setSelectedNanny({
        nanny,
        app
    });
    setIsModalOpen(true);
  };

  return (
    <main className="min-h-screen bg-surface-container-low p-8 lg:p-12 animate-in fade-in duration-700">
      <style dangerouslySetInnerHTML={{ __html: `
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            vertical-align: middle;
        }
        .asymmetric-clip { border-radius: 1.5rem 0.75rem 1.5rem 0.75rem; }
      `}} />

      {(selectedNanny && job) && (
          <BookingModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            nanny={{
                id: selectedNanny.nanny.id,
                name: selectedNanny.app.caregiver.fullName,
                hourlyRate: selectedNanny.nanny.hourlyRate,
                weeklyRate: selectedNanny.nanny.weeklyRate
            }}
            jobContext={{
                id: job.id,
                title: job.title,
                applicationId: selectedNanny.app.id,
                budget: job.budget,
                duration: job.duration,
                location: job.location
            }}
          />
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-8 lg:gap-12">
        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          {/* Header */}
          <header className="space-y-4">
            <Link 
              href="/dashboard/parent/jobs" 
              className="flex items-center gap-2 text-on-surface-variant text-sm font-medium hover:text-primary transition-colors group w-fit"
            >
              <MaterialIcon name="arrow_back" className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Job Postings</span>
            </Link>
            <h1 className="text-4xl lg:text-5xl font-extrabold font-headline text-primary tracking-tight italic">
              Applicants for: {job?.title || "Your Job Posting"}
            </h1>
            <p className="text-on-surface-variant text-xl opacity-60">
              Reviewing {applicants.length} applications for the household.
            </p>
          </header>

          {/* Applicant List */}
          <div className="flex flex-col gap-8">
            {applicants.length > 0 ? applicants.map((app) => {
              const nanny = app.caregiver?.nannyProfile;
              const cgUser = app.caregiver;
              
              return (
                <article key={app.id} className="bg-white p-8 asymmetric-clip shadow-sm hover:shadow-xl transition-all group overflow-hidden border border-outline-variant/10 relative">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Identity & Photo */}
                    <div className="relative shrink-0">
                      <div className="w-32 h-40 bg-surface-container asymmetric-clip overflow-hidden shadow-inner border border-outline-variant/5">
                        <img 
                          src={cgUser?.profileImageUrl || "https://images.unsplash.com/photo-1544144433-d50aff500b91?q=80&w=2070&auto=format&fit=crop"} 
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000" 
                          alt={cgUser?.fullName || "Caregiver"} 
                        />
                      </div>
                      {app.avgRating >= 4.5 && (
                        <div className="absolute -bottom-2 -right-2 bg-secondary-fixed-dim text-on-secondary-fixed px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-lg">
                          Top Choice
                        </div>
                      )}
                    </div>

                    {/* Meta Detail Area */}
                    <div className="flex-grow space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-black font-headline text-primary italic uppercase tracking-tighter">
                            {cgUser?.fullName?.split(' ')[0]} {cgUser?.fullName?.split(' ')[1]?.[0]}.
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                             <span className="bg-tertiary-fixed text-on-tertiary-fixed text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 font-label">
                                <MaterialIcon name="verified" size={14} fill />
                                Global Professional
                             </span>
                             <span className="bg-surface-container text-on-surface-variant text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 font-label">
                                <MaterialIcon name="check_circle" size={14} />
                                Verified
                             </span>
                          </div>
                        </div>

                        {/* Ratings & Rates Pillar */}
                        <div className="text-right space-y-1">
                           <div className="flex items-center justify-end gap-1 mb-1">
                              {[...Array(5)].map((_, i) => (
                                <MaterialIcon 
                                  key={i} 
                                  name="star" 
                                  size={16} 
                                  className={i < Math.round(app.avgRating) ? "text-secondary" : "text-outline-variant"} 
                                  fill={i < Math.round(app.avgRating)}
                                />
                              ))}
                              <span className="text-sm font-bold ml-1 text-primary">{app.avgRating.toFixed(1)}</span>
                           </div>
                           <div className="flex flex-col items-end">
                              <span className="text-lg font-black text-primary italic">${nanny?.weeklyRate || '1.2k'}<span className="text-[10px] font-medium text-on-surface-variant/60 not-italic ml-1 font-label">Retainer</span></span>
                              <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest font-label">${nanny?.hourlyRate || '25'}/hr Adhoc</span>
                           </div>
                        </div>
                      </div>

                      <p className="text-on-surface-variant leading-relaxed text-sm italic font-medium opacity-80 border-l-2 border-secondary/20 pl-4 py-1">
                        "{app.message || "I specialize in creative developmental play and Montessori-based routines..."}"
                      </p>

                      <div className="flex items-center gap-4 pt-2">
                         <div className="text-[11px] font-black text-secondary uppercase tracking-widest font-label">
                            {nanny?.experienceYears || 0} Years Experience
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Floor */}
                  <div className="mt-8 pt-8 border-t border-outline-variant/10 flex items-center justify-between">
                    <div className="flex gap-4">
                      {app.status === 'accepted' ? (
                          <div className="bg-primary/10 text-primary px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 font-label">
                              Hired <MaterialIcon name="check_circle" size={16} fill />
                          </div>
                      ) : (
                        <button 
                            onClick={() => handleHireClick(nanny, app)}
                            className="bg-secondary-fixed-dim text-on-secondary-fixed px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-95 transition-all shadow-lg shadow-secondary/10 font-label"
                        >
                            Hire
                        </button>
                      )}
                      
                      <button className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:scale-95 hover:bg-primary-container transition-all shadow-lg shadow-primary/10 font-label">
                        Message
                      </button>
                      <Link 
                         href={`/dashboard/nanny/profile/${app.caregiverId}`}
                         className="bg-white border border-outline-variant text-primary px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-surface-container transition-all font-label"
                      >
                        View Profile
                      </Link>
                    </div>
                    <button className="text-error/40 hover:text-error hover:bg-error-container/20 p-2.5 rounded-full transition-all" title="Reject Application">
                      <MaterialIcon name="block" />
                    </button>
                  </div>
                </article>
              );
            }) : (
              <div className="py-40 bg-white/40 asymmetric-clip border border-dashed border-outline-variant/30 flex flex-col items-center justify-center text-center">
                  <MaterialIcon name="person_search" className="text-6xl text-outline-variant mb-6" />
                  <p className="font-headline font-black text-3xl text-primary/30 italic uppercase tracking-tighter">Quiet on the horizon</p>
                  <p className="text-sm text-on-surface-variant/40 mt-4 font-bold tracking-widest uppercase font-label">No applications received yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Insight Sidebar */}
        {job && (
            <div className="col-span-12 lg:col-span-4 space-y-8">
            {/* Mini Summary */}
            <section className="bg-primary p-8 asymmetric-clip text-on-primary shadow-2xl shadow-primary/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-primary-container/60 mb-6 font-label">Managed Posting</h4>
                <div className="space-y-6 relative z-10">
                <div>
                    <div className="text-3xl font-black font-headline italic leading-none">{job.title}</div>
                    <div className="text-on-primary-container text-xs font-bold mt-2 uppercase tracking-widest opacity-80 font-label">Active Residence</div>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs font-bold text-on-primary-container/90 font-label">
                        <MaterialIcon name="schedule" size={20} className="text-on-primary-container/40" />
                        {job.duration || "Adhoc Support"}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-on-primary-container/90 font-label">
                        <MaterialIcon name="location_on" size={20} className="text-on-primary-container/40" />
                        {job.location?.split(',')[0] || "Cedar Falls"}
                    </div>
                </div>
                </div>
            </section>

            {/* Stats Bento */}
            <section className="bg-white p-8 asymmetric-clip border border-outline-variant/10 shadow-sm space-y-8">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 font-label">Applicant Insights</h4>
                <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-5 asymmetric-clip">
                    <div className="text-3xl font-black text-primary italic tracking-tighter">{applicants.length}</div>
                    <div className="text-[9px] uppercase font-black text-on-surface-variant/60 tracking-widest font-label">Total</div>
                </div>
                <div className="bg-secondary-container/10 p-5 asymmetric-clip">
                    <div className="text-3xl font-black text-secondary italic tracking-tighter">
                    {applicants.filter(a => new Date(a.createdAt).toDateString() === new Date().toDateString()).length}
                    </div>
                    <div className="text-[9px] uppercase font-black text-secondary tracking-widest font-label">New Today</div>
                </div>
                </div>
            </section>

            {/* Safety Module */}
            <section className="bg-surface-dim/20 p-8 asymmetric-clip border border-outline-variant/10">
                <div className="flex items-start gap-4">
                <MaterialIcon name="security" size={32} className="text-secondary opacity-40" />
                <div>
                    <h4 className="font-black text-primary text-sm uppercase tracking-tighter italic mb-2">Kindred Safety Protocols</h4>
                    <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    Hiring a candidate signals extreme interest. Ensure a video interview is completed before sharing detailed house logistics beyond your mobile number.
                    </p>
                </div>
                </div>
            </section>
            </div>
        )}
      </div>
    </main>
  );
}
