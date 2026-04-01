"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

interface Step5Props {
  data: any;
  onEdit: (step: number) => void;
  onSubmit: () => void;
  onBack: () => void;
}

const TOP_MATCHES = [
  { name: "Sarah B.", rating: 4.9, bio: "Certified Newborn Care Specialist with 8+ years experience...", img: "https://lh3.googleusercontent.com/fife/ALSFd3llt62V2rZt5Z-N1T1o3V4Y8Z2M2E7U7V7l7Y7z7r7_7v7x7p7m7t7_7t7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7" },
  { name: "Michael K.", rating: 5.0, bio: "Former elementary teacher specializing in homework help...", img: "https://lh3.googleusercontent.com/fife/ALSFd3llt62V2rZt5Z-N1T1o3V4Y8Z2M2E7U7V7l7Y7z7r7_7v7x7p7m7t7_7t7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7" },
  { name: "Jess R.", rating: 4.8, bio: "Bilingual caregiver with extensive special needs training...", img: "https://lh3.googleusercontent.com/fife/ALSFd3llt62V2rZt5Z-N1T1o3V4Y8Z2M2E7U7V7l7Y7z7r7_7v7x7p7m7t7_7t7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7-7v7w7r7_7r7" },
];

export default function Step5({ data, onEdit, onSubmit, onBack }: Step5Props) {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const TIMES = ["early_morning", "morning", "late_morning", "midday", "early_afternoon", "late_afternoon", "evening", "late_evening"];

  return (
    <div className="flex flex-col gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Headline */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
         <span className="px-4 py-1.5 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/10">Double-Checking the Circle</span>
         <h1 className="text-4xl md:text-5xl font-black font-headline text-primary tracking-tight leading-none">
            Finalizing your Kindred request
         </h1>
         <p className="text-on-surface-variant text-lg">
            Review your details and see your potential matches before going live.
         </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Summary Details (8/12) */}
        <div className="lg:col-span-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Left Column: Core Info */}
             <div className="space-y-6">
                <section className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                       <MaterialIcon name="description" className="text-primary" />
                    </div>
                    <button onClick={() => onEdit(3)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-all">Edit</button>
                  </div>
                  <h3 className="font-headline font-bold text-primary text-xl mb-4">Job Description</h3>
                  <p className="text-sm text-on-surface-variant leading-relaxed line-clamp-4">
                    {data.description || "No description provided."}
                  </p>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -z-10 group-hover:scale-125 transition-transform duration-700"></div>
                </section>

                <section className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                         <MaterialIcon name="family_restroom" className="text-secondary" />
                      </div>
                      <button onClick={() => onEdit(1)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-all">Edit</button>
                   </div>
                   <h3 className="font-headline font-bold text-primary text-xl mb-6">Family Dynamics</h3>
                   <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/5">
                         <MaterialIcon name="child_care" className="text-secondary" />
                         <span className="font-bold text-sm tracking-tight">{data.childCount || 1} Child{data.childCount > 1 ? 'ren' : ''}</span>
                      </div>
                      <div className="flex items-center gap-3 bg-surface-container-low px-4 py-3 rounded-2xl border border-outline-variant/5">
                         <MaterialIcon name="location_on" className="text-secondary" />
                         <span className="font-bold text-sm tracking-tight">{data.location || "Pending..."}</span>
                      </div>
                   </div>
                </section>
             </div>

             {/* Right Column: Schedule & Rate */}
             <div className="space-y-6">
                <section className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm relative overflow-hidden group">
                  <div className="flex justify-between items-center mb-6">
                    <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center">
                       <MaterialIcon name="schedule" className="text-tertiary" />
                    </div>
                    <button onClick={() => onEdit(2)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-all">Edit</button>
                  </div>
                  <h3 className="font-headline font-bold text-primary text-xl mb-4">Availability & Pay</h3>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 block">Daily Rate</span>
                       <span className="text-2xl font-black font-headline text-primary tracking-tighter">${data.minRate}-${data.maxRate}/hr</span>
                    </div>
                    <div className="w-[1px] h-10 bg-outline-variant/20"></div>
                    <div className="space-y-1">
                       <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 block">Type</span>
                       <span className="text-lg font-bold text-on-surface-variant">{data.scheduleType === 'recurring' ? 'Recurring' : 'One-time'}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {DAYS.map((day) => (
                      <div key={day} className="flex flex-col gap-0.5">
                        {TIMES.map(timeId => (
                          <div
                            key={timeId}
                            className={cn(
                              "h-1.5 rounded-[1px] transition-all duration-500",
                              data.schedule?.[`${day}-${timeId}`] ? "bg-secondary scale-110" : "bg-surface-container-high"
                            )}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-surface-container-lowest p-8 rounded-[2rem] border border-outline-variant/10 shadow-sm">
                   <div className="flex justify-between items-center mb-6">
                      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                         <MaterialIcon name="verified_user" className="text-primary" />
                      </div>
                      <button onClick={() => onEdit(3)} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-all">Edit</button>
                   </div>
                   <h3 className="font-headline font-bold text-primary text-xl mb-4">Certifications</h3>
                   <div className="flex flex-wrap gap-2">
                       {data.certs?.cpr && (
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                          <MaterialIcon name="medical_services" className="text-sm" /> CPR
                        </span>
                      )}
                      {data.certs?.first_aid && (
                        <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                          <MaterialIcon name="healing" className="text-sm" /> First Aid
                        </span>
                      )}
                      {data.requestVideo && (
                        <span className="px-4 py-2 bg-secondary/10 text-secondary text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-2 border border-secondary/20">
                          <MaterialIcon name="videocam" className="text-sm" /> Video Request
                        </span>
                      )}
                   </div>
                </section>
             </div>
          </div>

          {/* Premium Upgrades Banner */}
          {(data.isFeatured || data.isBoosted) && (
             <div className="bg-secondary text-white p-6 rounded-[2rem] shadow-xl shadow-secondary/20 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
                <div className="relative z-10 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                   <MaterialIcon name="auto_awesome" className="text-3xl" fill />
                </div>
                <div className="relative z-10 flex-1 text-center md:text-left">
                   <h4 className="font-headline font-black text-xl mb-1">Premium Performance Enabled</h4>
                   <p className="text-sm text-white/80 font-medium leading-relaxed">
                      {data.isFeatured && data.isBoosted 
                        ? "Your job is Featured & Instant-Boosted. Expect 3x faster applications!" 
                        : data.isFeatured ? "Featured listing active. You'll stay at the top of the dashboard." : "Instant SMS Boost active. Nearby nannies are being notified."}
                   </p>
                </div>
                <MaterialIcon name="rocket_launch" className="absolute -bottom-4 -right-4 text-7xl opacity-10 group-hover:rotate-12 transition-transform duration-700" />
             </div>
          )}
        </div>

        {/* Talent Preview Sidebar (4/12) */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-surface-container-low p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-8">
                 <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgb(34,197,94)]"></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Live Match Potential</span>
              </div>
              <h3 className="font-headline text-2xl font-black text-primary mb-2">Kindred Circle Near You</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed mb-10">We found <strong>12+ verified caregivers</strong> matching your specific requirements in your area code.</p>

              <div className="space-y-6">
                 {TOP_MATCHES.map((match, i) => (
                    <div key={i} className="flex gap-4 items-center group">
                       <div className="w-14 h-14 rounded-2xl overflow-hidden relative shrink-0 border-2 border-white shadow-md">
                          <img src={match.img} alt={match.name} className="w-full h-full object-cover blur-[4px] opacity-70 transition-all group-hover:blur-0 group-hover:opacity-100 duration-1000" />
                          <div className="absolute inset-0 bg-primary/20 mix-blend-color group-hover:bg-transparent transition-colors"></div>
                       </div>
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="font-bold text-sm text-primary">{match.name.split(' ')[0]} ***</span>
                             <div className="flex items-center text-[10px] text-amber-500 font-bold">
                                <MaterialIcon name="star" className="text-sm" fill /> {match.rating}
                             </div>
                          </div>
                          <p className="text-[10px] text-on-surface-variant leading-relaxed italic line-clamp-1">"{match.bio}"</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-10 pt-8 border-t border-outline-variant/20">
                 <p className="text-[10px] font-bold text-on-surface-variant text-center uppercase tracking-widest mb-6">Security Clearance</p>
                 <div className="grid grid-cols-4 gap-4 grayscale opacity-40">
                    <MaterialIcon name="gpp_good" className="text-xl mx-auto" fill />
                    <MaterialIcon name="verified" className="text-xl mx-auto" fill />
                    <MaterialIcon name="security" className="text-xl mx-auto" fill />
                    <MaterialIcon name="shield" className="text-xl mx-auto" fill />
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-4">
              <button 
                onClick={onSubmit}
                className="w-full py-6 bg-primary text-on-primary rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-primary/20 hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-4 group"
              >
                Post Job to Kindred Circle
                <MaterialIcon name="campaign" className="group-hover:rotate-12 transition-transform" />
              </button>
              <button 
                onClick={onBack}
                className="w-full py-4 text-on-surface-variant font-bold text-xs hover:bg-surface-container-high rounded-2xl transition-all"
              >
                Go Back
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
