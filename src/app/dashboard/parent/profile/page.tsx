import { syncUser } from "@/lib/user-sync";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { parentProfiles, children } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import ParentProfileForm from "@/components/dashboard/ParentProfileForm";

export default async function FamilyProfilePage() {
  const user = await syncUser();
  if (!user) {
    redirect("/login");
  }
  const userId = user.id;

  // 1. Fetch Existing Profile
  const profile = await db.query.parentProfiles.findFirst({
    where: eq(parentProfiles.id, userId),
  });

  // 2. Fetch Kids
  const myChildren = await db.query.children.findMany({
    where: eq(children.parentId, userId),
  });

  return (
    <main className="p-6 lg:p-12 max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <section className="space-y-4">
        <div className="flex items-center gap-4 text-secondary font-black text-xs tracking-[0.3em] uppercase opacity-70">
          <MaterialIcon name="family_restroom" className="text-sm" fill />
          Family Settings
        </div>
        <h1 className="font-headline text-5xl font-black text-primary tracking-tighter leading-none italic">
          Curate Your <span className="text-secondary-container">Family Home</span>
        </h1>
        <p className="text-on-surface-variant text-lg font-medium opacity-60 leading-relaxed italic max-w-2xl">
          Your profile is the first thing elite caregivers see. Make it warm, authentic, and detailed to find the best match.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Profile Details Form */}
        <div className="lg:col-span-8 space-y-12">
           <ParentProfileForm 
              initialProfile={{
                familyName: profile?.familyName || user.fullName || "",
                bio: profile?.bio || "",
                location: profile?.location || "",
                familyPhoto: profile?.familyPhoto || ""
              }}
              userId={userId}
           />
        </div>

        {/* Child Profiles Manager - Sidebar Style */}
        <div className="lg:col-span-4 space-y-8">
           <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-outline-variant/10">
              <h3 className="font-headline text-2xl font-black text-primary mb-8 tracking-tighter italic leading-none">Little Ones</h3>
              
              <div className="space-y-4 mb-8">
                 {myChildren.map((child) => (
                   <div key={child.id} className="flex items-center gap-4 p-4 bg-surface rounded-2xl hover:bg-surface-container-low transition-all group">
                     <img 
                       src={child.photoUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${child.name}`} 
                       className="w-12 h-12 rounded-xl object-cover shadow-sm"
                       alt={child.name}
                     />
                     <div>
                       <p className="font-black text-primary text-sm tracking-tight">{child.name}, {child.age}</p>
                       <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{child.type}</p>
                     </div>
                     <button className="ml-auto p-2 opacity-0 group-hover:opacity-100 hover:text-error transition-all">
                       <MaterialIcon name="delete" className="text-lg" />
                     </button>
                   </div>
                 ))}
              </div>

              <button className="w-full py-4 border-2 border-dashed border-outline-variant/30 rounded-2xl flex items-center justify-center gap-2 text-on-surface-variant hover:border-primary hover:text-primary transition-all font-black uppercase tracking-widest text-[10px]">
                <MaterialIcon name="add" className="text-sm" />
                Add Child
              </button>
           </section>

           {/* Quick Trust Guide */}
           <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-1000"></div>
              <h4 className="font-headline text-xl font-black italic tracking-tight mb-4 relative z-10">Verification Tip</h4>
              <p className="text-sm font-medium opacity-70 leading-relaxed italic relative z-10">
                Verified families get **3x more applications** from elite nannies. Update your ID to boost your trust score.
              </p>
              <button className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative z-10">
                Learn More
              </button>
           </div>
        </div>
      </div>
    </main>
  );
}
