import { redirect } from "next/navigation";
import { syncUser } from "@/lib/user-sync";
import { getSupportConversations } from "@/lib/actions/support";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function SupportHubPage() {
  const user = await syncUser();
  if (!user) redirect("/login");

  const supportConvos = await getSupportConversations();

  return (
    <div className="bg-surface min-h-screen pb-20">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -mr-64 -mt-64" />
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 relative z-10">
          <div className="max-w-2xl space-y-8 animate-in slide-in-from-left-4 duration-1000">
             <div className="inline-flex items-center px-4 py-2 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[10px] font-black tracking-widest uppercase shadow-sm border border-outline-variant/10">
                <MaterialIcon name="support_agent" className="text-lg mr-2" fill /> 24/7 Priority Safety Support
             </div>
             <h1 className="font-headline text-6xl lg:text-8xl font-black text-primary tracking-tighter italic leading-none">
                Support Hub.<br/>
                <span className="text-secondary opacity-40">Safe. Secure.</span>
             </h1>
             <p className="text-lg text-on-surface-variant font-medium max-w-lg leading-relaxed italic opacity-70">
                Facing an issue or have a safety concern? Our dedicated moderation team is available around the clock to ensure your peace of mind.
             </p>
             <div className="pt-4 flex flex-wrap gap-6">
                <Link 
                  href="/dashboard/messages?tab=support"
                  className="px-10 py-5 bg-primary text-white font-black rounded-3xl shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:scale-95 transition-all uppercase tracking-widest text-xs flex items-center gap-3"
                >
                  <MaterialIcon name="chat" className="text-xl" fill />
                  Open Support Session
                </Link>
                <div className="flex items-center gap-4 px-8 py-5 bg-white border border-outline-variant/10 rounded-3xl shadow-sm">
                   <div className="w-10 h-10 rounded-full bg-secondary text-white flex items-center justify-center font-black shadow-lg shadow-secondary/20">A</div>
                   <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Alex</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Trusted Moderator Online</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Active Sessions */}
        <div className="lg:col-span-2 space-y-8">
           <header className="flex items-center justify-between">
              <h3 className="font-headline text-3xl font-black text-primary tracking-tighter italic">Active Sessions</h3>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{supportConvos.length} Threads</span>
           </header>

           <div className="space-y-4">
              {supportConvos.length > 0 ? supportConvos.map((convo: any) => (
                <Link
                  key={convo.id}
                  href={`/dashboard/messages/${convo.id}`}
                  className="flex items-center justify-between p-8 bg-white rounded-[2.5rem] border border-outline-variant/5 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center font-black text-xl shadow-lg border border-on-tertiary-container/10">
                      KC
                    </div>
                    <div>
                        <h4 className="font-headline text-xl font-bold text-primary group-hover:text-secondary transition-colors italic truncate max-w-[200px]">
                           {convo.title || "Support Request"}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium italic opacity-60 mt-1 truncate max-w-[250px]">
                           {convo.lastMessage?.content || "Conversation started..."}
                        </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest border border-green-100">Synchronized</span>
                     <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                        {new Date(convo.updatedAt).toLocaleDateString()}
                     </span>
                  </div>
                </Link>
              )) : (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                   <MaterialIcon name="support" className="text-6xl text-slate-300 mb-6" />
                   <h4 className="font-headline text-xl font-bold text-slate-400 italic">No active sessions found</h4>
                   <p className="text-sm text-slate-400 mt-2 px-10">All your real-time chats with moderators will appear here.</p>
                </div>
              )}
           </div>

           <div className="pt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "Identity Theft Protection", text: "Learn how we safeguard your sensitive data and personal identification documents.", icon: "verified_user", color: "text-primary" },
                { title: "Safe Payment Protocols", text: "Everything you need to know about secure escrow and platform-backed transactions.", icon: "payments", color: "text-secondary" }
              ].map((card, i) => (
                <div key={i} className="p-8 bg-white rounded-[2rem] border border-outline-variant/5 shadow-sm hover:shadow-xl transition-all group">
                   <MaterialIcon name={card.icon} className={`${card.color} text-4xl mb-6`} fill />
                   <h5 className="font-headline text-xl font-black text-primary mb-3 italic group-hover:text-secondary transition-colors">{card.title}</h5>
                   <p className="text-sm text-slate-500 font-medium leading-relaxed italic opacity-70">{card.text}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-10">
           <div className="p-8 bg-primary rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-[40px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
              <h4 className="font-headline text-2xl font-black italic tracking-tighter mb-6">Need Instant Answer?</h4>
              <div className="space-y-4">
                 <div className="relative">
                    <input className="w-full bg-white/10 border border-white/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder:text-white/40 outline-none focus:bg-white/20 transition-all" placeholder="Search safety database..." />
                    <MaterialIcon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                 </div>
              </div>
              <ul className="mt-8 space-y-4">
                 {['Verification delays', 'Payment failure logs', 'Background check status', 'Emergency contacts'].map((item, i) => (
                   <li key={i} className="flex items-center gap-3 group/item cursor-pointer">
                      <MaterialIcon name="chevron_right" className="text-secondary-fixed group-hover/item:translate-x-1 transition-transform" />
                      <span className="text-xs font-bold opacity-70 group-hover/item:opacity-100 transition-all">{item}</span>
                   </li>
                 ))}
              </ul>
           </div>

           <div className="p-8 bg-tertiary-fixed rounded-[2.5rem] border border-outline-variant/10 shadow-sm space-y-6">
              <header className="flex items-center gap-3">
                 <MaterialIcon name="safety_check" className="text-on-tertiary-fixed-variant text-2xl" fill />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-tertiary-fixed-variant">Safety Pillar Checklist</h4>
              </header>
              <div className="space-y-4">
                 {[
                   { t: "Physical Meetup Protocol", active: true },
                   { t: "Emergency Contact Sync", active: false },
                   { t: "ID Document Verification", active: true },
                   { t: "Home Safety Assessment", active: true }
                 ].map((check, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-on-tertiary-container/5">
                      <span className="text-[11px] font-bold text-primary italic">{check.t}</span>
                      <MaterialIcon 
                        name={check.active ? "check_circle" : "radio_button_unchecked"} 
                        className={check.active ? "text-secondary" : "text-slate-300"} 
                        fill={check.active} 
                      />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
