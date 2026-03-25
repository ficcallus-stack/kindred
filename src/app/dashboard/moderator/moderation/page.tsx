"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";

const REPORTS = [
  {
    id: "R-1",
    name: "Marcus Sterling",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlJQvGEzPpYQYjBWw02TRhiMi7y1MZVF92BjRdt483S6QYz7uNF0Bc4ZkTaUXVIUXSxmBSN69m3WLYw3R_Ziqr7wAgYwOEFulDKQNSMNtygpNiWAR1EoIKDtJHAnfMlDCKsvRd3b9xdhnZhlx_sznrhQ0XMvw4MMO5Rlb7fWJVOcaLyeVgiy4_Z1qIZGYuciPBFl0KTPCS1hJKlsoTbDvxbk3WUCsWwcMIL0dT-agDQ0eafL9QfiCfHeXJxKTmTUc0ahMpKpyRpGg",
    reason: "Inappropriate Bio",
    severity: "High",
    time: "2 hours ago",
    content: "...offering off-platform cash deals and requesting personal contact info before booking confirmation...",
  },
  {
    id: "R-2",
    name: "Elena Rodriguez",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf--Q6lEDa0wDxjkmntiZhWObj5S2QPhosB8yp9TbSVJiADrIfRncpCVXz_Mg7zoGTDW7iqJ8YyGwmt9OLA1CcFA8mtsxh2AGqthO2cN__0hRsbT93Mpnt0spMY_itD5LIFNyIYQMI1lUFLt8eCIFOdnGuUxAOh18F5WwyupDkhBlGMsO-tn5yU-3PIvVmoBAFy3LadHU59K1RYgyuZAVS7LJWK0FV3ckQ1AkuddpVmmwbLZcd3ULfwt4e9vPCKSsJu8mDXU-HzDE",
    reason: "Harassment",
    severity: "Medium",
    time: "5 hours ago",
    conversation: "Family: The Millers",
  },
];

const TICKETS = [
  {
    id: "T-1",
    name: "James Howell",
    avatar: "JH",
    role: "Verified Parent",
    issue: "Background Check Status",
    status: "Waiting for Mod",
  },
  {
    id: "T-2",
    name: "Kaitlyn Lowe",
    avatar: "KL",
    role: "Premium Caregiver",
    issue: "Account Access Issue",
    status: "In Progress",
  },
];

export default function ModerationPage() {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Left Column: Primary Feeds */}
      <div className="col-span-12 lg:col-span-8 space-y-12">
        {/* Section: Reported Content */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MaterialIcon name="report" className="text-error text-2xl font-fill" fill />
              <h3 className="text-2xl font-bold font-headline text-primary">Reported Content</h3>
            </div>
            <span className="bg-error-container text-error px-3 py-1 rounded-full text-xs font-bold tracking-wide">14 PENDING</span>
          </div>

          <div className="space-y-4">
            {REPORTS.map((report) => (
              <div key={report.id} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex gap-6 hover:shadow-md transition-shadow">
                <div className="relative shrink-0">
                  <img 
                    src={report.avatar} 
                    alt={report.name} 
                    className="w-20 h-24 object-cover rounded-2xl shadow-sm"
                  />
                  {report.severity === "High" && (
                    <div className="absolute -bottom-2 -right-2 bg-error text-white p-1 rounded-full text-[10px] shadow-sm">
                      <MaterialIcon name="priority_high" className="text-sm font-black" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-lg text-primary">{report.name}</h4>
                      <p className="text-xs text-on-surface-variant font-medium">Reported for: <span className="text-error font-bold">{report.reason}</span></p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{report.time}</span>
                  </div>

                  {report.content && (
                    <div className="bg-surface-container-low p-3 rounded-xl text-sm italic text-on-surface-variant mb-4 border-l-4 border-error/30 font-medium">
                      "{report.content}"
                    </div>
                  )}

                  {report.conversation && (
                    <div className="bg-surface-container-low p-3 rounded-xl text-sm text-on-surface-variant mb-4 flex items-center gap-2 font-medium">
                      <MaterialIcon name="forum" className="text-slate-400 text-lg" />
                      <span>Flagged in conversation with <span className="font-bold text-primary">{report.conversation}</span></span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-primary/95 transition-colors flex items-center gap-2 shadow-sm">
                      <MaterialIcon name="mail" className="text-sm" /> Message User
                    </button>
                    <button className="bg-surface-container-high text-on-surface px-4 py-2 rounded-xl text-xs font-bold hover:bg-surface-container-highest transition-colors border border-outline-variant/5">
                      Dismiss Flag
                    </button>
                    <button className="ml-auto bg-error/10 text-error px-4 py-2 rounded-xl text-xs font-bold hover:bg-error hover:text-white transition-all">
                      Suspend Account
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Support Tickets */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MaterialIcon name="confirmation_number" className="text-amber-600 text-2xl font-fill" fill />
              <h3 className="text-2xl font-bold font-headline text-primary">Support Tickets</h3>
            </div>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold tracking-wide">8 ACTIVE</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm border border-outline-variant/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low/30 border-b border-surface-container">
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Issue Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-medium">
                {TICKETS.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/5 flex items-center justify-center font-bold text-primary text-xs shadow-inner">
                          {ticket.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{ticket.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{ticket.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-on-surface">{ticket.issue}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold",
                        ticket.status === "Waiting for Mod" ? "text-amber-600" : "text-blue-600"
                      )}>
                        <div className={cn("w-2 h-2 rounded-full", ticket.status === "Waiting for Mod" ? "bg-amber-600" : "bg-blue-600")}></div>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary font-bold text-xs hover:underline mr-4">Open</button>
                      <button className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-sm">Resolve</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Right Column: Guidelines Sidebar */}
      <aside className="col-span-12 lg:col-span-4 space-y-8">
        <div className="sticky top-24 space-y-8">
          <div className="bg-primary text-white rounded-2xl p-8 overflow-hidden relative shadow-xl shadow-primary/10">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <MaterialIcon name="menu_book" className="text-amber-300 text-xl font-fill" fill />
                <h3 className="text-xl font-bold font-headline">Guidelines Reference</h3>
              </div>
              <ul className="space-y-4 text-sm font-medium text-blue-100/90 leading-relaxed">
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold shrink-0">01</span>
                  <p><span className="text-white font-bold">Zero Tolerance:</span> Direct contact info sharing before confirmed booking is a 1st warning offense.</p>
                </li>
                <li className="flex gap-3">
                  <span className="w-5 h-5 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold shrink-0">02</span>
                  <p><span className="text-white font-bold">Professionalism:</span> All caregivers must maintain current certifications; flag outdated CPR docs.</p>
                </li>
              </ul>
              <button className="mt-8 w-full bg-white/10 border border-white/20 py-3 rounded-xl text-xs font-bold hover:bg-white/20 transition-all uppercase tracking-widest">
                Full Policy Manual
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      </aside>
    </div>
  );
}
