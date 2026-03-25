"use client";

import { MaterialIcon } from "@/components/MaterialIcon";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function TicketDetailPage({ params }: { params: { id: string } }) {
  const ticketId = params.id;

  return (
    <div className="flex gap-8">
      {/* Conversation Thread */}
      <div className="flex-1 space-y-8">
        {/* User Metadata Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10 flex items-center gap-8">
          <div className="relative">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXw3Mq2uT8Gn0guPzKo30nxdRKK727CywioQkhiacthhJr68Z4l81xG7PuionYc5KHkH0MiNr0vPj3IVfM-oW4s_xjhZOZGwErJDXiCNdTeAk9X1FS-2AGMSwRMsF-JtB53iYr1bT0ZNX65bq-scIpEEayMYLv6J676GezIUwqRqecwgwHrlh6e68W8Mx431K6riQfyz-Tt1MvaBsypM9zkUsawUlnQSfIEGoBd2UrC42FuN0Ur4KkJS2fUxBbsOrCzPjt9IaqzIs" 
              alt="Elena" 
              className="w-16 h-16 rounded-2xl object-cover shadow-sm" 
            />
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
              <MaterialIcon name="verified" className="text-secondary text-xl font-fill" fill />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-headline text-xl font-bold text-primary">Elena Rodriguez</h2>
              <span className="px-2 py-0.5 bg-secondary-fixed text-on-secondary-fixed text-[10px] font-bold uppercase tracking-wider rounded">Nanny</span>
            </div>
            <p className="text-xs text-on-surface-variant mb-3 italic">Member since Jan 2023 • Top-Rated Status</p>
            <div className="flex gap-6">
              <div className="text-xs">
                <span className="text-on-surface-variant block mb-0.5">Identity</span>
                <span className="font-bold text-primary flex items-center gap-1"><MaterialIcon name="check_circle" className="text-emerald-500 text-sm" /> Verified</span>
              </div>
              <div className="text-xs">
                <span className="text-on-surface-variant block mb-0.5">Background Check</span>
                <span className="font-bold text-error flex items-center gap-1"><MaterialIcon name="error" className="text-error text-sm" /> Expired</span>
              </div>
            </div>
          </div>
        </section>

        {/* Conversation History */}
        <section className="space-y-6">
          {/* User Message */}
          <div className="flex items-start gap-4">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6Dg822OWsWYJDaooFNIV489f-6wRDUk_Qga5ZGWTQr6QMaSCC5VOd3LhzMHSyEMqZQSqc9P5tBEf-4ynjVSDg70F4kS-64Z2GXWWKsjtd1e1sREGT6S7Ck7UvsrH3VCjNAU7Y9E5yc_J6JimyFAfVACQuDnlIGSpdEhjMmVFtbTdhzshMhv1CWWu-SAScCgJLOFn5dF8gOmp2Wdiojnvx0DDmvBcERYuBd0XX6lXTrdAx1w3WY6fBFUg7gAsxRnjHxYYW1MitxHg" alt="Elena" className="w-10 h-10 rounded-full object-cover mt-1 shadow-sm" />
            <div className="flex-1">
              <div className="bg-surface-container-lowest p-6 rounded-2xl rounded-tl-none shadow-sm border border-outline-variant/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-primary">Elena Rodriguez</span>
                  <span className="text-xs text-on-surface-variant font-medium">Today, 09:42 AM</span>
                </div>
                <p className="text-on-surface mb-6 leading-relaxed font-medium text-sm">
                  Hello support team. I've tried to upload my renewed background check three times now, but the system keeps showing an "Invalid Document" error. I am losing potential bookings because my badge is currently marked as expired. Can you please help me resolve this?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="group relative overflow-hidden rounded-xl bg-slate-100 cursor-zoom-in border border-outline-variant/10">
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <MaterialIcon name="zoom_in" className="text-white text-3xl" />
                    </div>
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1-A_HuphMW9lqTFrSSy5bAa1hikRVgvWBQPswMP6XJXlPxQgwSraU7Xq-qwk8o_cX79i593DIrkXAgU_iCy6MDQBhThjoC55_74K_gSpJ1DOdiHQfCt1mbYoaG8wMHk6iIBLmmDZ2C2VBO2XPK2mxpbJsjErqCnL9-kyBXwV4Ad-h6y6bNlg1Mlpa5ZZtoOLXhQxtwFK-sJMhJQFCnBZqOwq6b5M-NQMlJ2k76Z6Wy3408WMabflu9rqBXRGkc-5iYYIPTyft3ts" alt="Doc" className="w-full h-24 object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Moderator Response */}
          <div className="flex items-start gap-4 flex-row-reverse">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-white font-bold text-sm shadow-sm">SJ</div>
            <div className="flex-1 text-right">
              <div className="bg-primary text-white p-6 rounded-2xl rounded-tr-none shadow-md text-left inline-block max-w-[85%]">
                <div className="flex justify-between items-center mb-2 gap-8">
                  <span className="font-bold text-blue-100 text-sm">Sarah (Moderator)</span>
                  <span className="text-[10px] text-blue-200/60 font-medium">10:15 AM</span>
                </div>
                <p className="leading-relaxed font-medium text-sm">
                  Hi Elena, I can see the error in our logs. It appears to be a timeout during document scanning. I am investigating if this is platform-wide or specific to your file format. Please hold on.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Reply Area */}
        <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-md border border-outline-variant/10">
          <textarea 
            rows={4} 
            placeholder="Type your response to Elena..." 
            className="w-full bg-surface-container-low border-none rounded-xl focus:ring-2 focus:ring-primary/20 placeholder:text-on-surface-variant/40 text-sm font-medium resize-none p-4"
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-2">
              <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-low rounded-lg transition-colors">attach_file</button>
              <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-low rounded-lg transition-colors">mood</button>
            </div>
            <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm shadow-sm hover:translate-y-[-1px] transition-all">
              Send Reply
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Sidebar Panel (Right Column) */}
      <aside className="w-[380px] space-y-6">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-sm relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 right-0 w-24 h-24 bg-secondary-container/5 rounded-bl-[4rem] -mr-8 -mt-8"></div>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXw3Mq2uT8Gn0guPzKo30nxdRKK727CywioQkhiacthhJr68Z4l81xG7PuionYc5KHkH0MiNr0vPj3IVfM-oW4s_xjhZOZGwErJDXiCNdTeAk9X1FS-2AGMSwRMsF-JtB53iYr1bT0ZNX65bq-scIpEEayMYLv6J676GezIUwqRqecwgwHrlh6e68W8Mx431K6riQfyz-Tt1MvaBsypM9zkUsawUlnQSfIEGoBd2UrC42FuN0Ur4KkJS2fUxBbsOrCzPjt9IaqzIs" 
                alt="Profile" 
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-white shadow-md" 
              />
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-lg shadow-sm border-2 border-white">
                <MaterialIcon name="verified" className="text-[14px] font-fill" fill />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-primary leading-tight">Elena Rodriguez</h3>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mt-0.5">Premium Parent</p>
              <div className="flex items-center gap-1 mt-1">
                <MaterialIcon name="star" className="text-amber-500 text-sm font-fill" fill />
                <span className="text-xs font-bold text-on-surface">4.9 (24 Reviews)</span>
              </div>
            </div>
          </div>
          <div className="space-y-3 text-sm font-medium">
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-xs">Member Since</span>
              <span className="font-bold text-primary">Oct 2022</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
              <span className="text-on-surface-variant text-xs">Total Bookings</span>
              <span className="font-bold text-primary">112</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-on-surface-variant text-xs">Location</span>
              <span className="font-bold text-primary">New York, NY</span>
            </div>
          </div>
        </div>

        {/* Active Engagement Card */}
        <div className="bg-surface-container p-6 rounded-3xl space-y-4 border border-outline-variant/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Current Booking</p>
              <h5 className="font-extrabold text-primary text-base">Full-Day Support</h5>
            </div>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-1 rounded-md">IN PROGRESS</span>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-surface-container-lowest rounded-2xl shadow-sm">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0Du4cPkIxjET6YFrxZ7q37beFZMa1__wIfWTLiMU5aFFN5V_QncmyWNFa323fkHPsqKRHFhgYWhI5PHQyd9R2re3LBREWEmSi3CHKgY2Oqh6ed6GQBLpkozVz5bia7-sU6PAAYyQiOORZCJpaTFYBpy3grY6p1VrmNQWtNfuBqAEA5PRTiq_Z7Gcb58GfLCn27Kqn4RRBRir7FGtQF5VxKn0c3kbVkL2FNHSgj0mQ2LD4E2HJ3EF1iOkpy8Tj5JJgjC8ObT8nwd4" 
              alt="Caregiver" 
              className="w-12 h-12 rounded-xl object-cover shadow-inner" 
            />
            <div>
              <p className="text-xs font-bold text-primary">Clara Montes</p>
              <p className="text-[10px] text-on-surface-variant font-medium">Verified Caregiver</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/5 rounded-2xl">
              <p className="text-[10px] font-bold text-primary/60 uppercase">Date</p>
              <p className="text-xs font-extrabold text-primary">June 14, 2024</p>
            </div>
            <div className="p-3 bg-primary/5 rounded-2xl">
              <p className="text-[10px] font-bold text-primary/60 uppercase">Rate</p>
              <p className="text-xs font-extrabold text-primary">$35.00/hr</p>
            </div>
          </div>
          
          <button className="w-full py-3 bg-surface-container-high rounded-xl text-xs font-bold text-primary hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 border border-outline-variant/10">
            <MaterialIcon name="edit_calendar" className="text-sm" /> Adjust Terms
          </button>
        </div>

        {/* Safety & Trust Indicators */}
        <div className="bg-error-container/10 p-6 rounded-3xl space-y-4 border border-error/5">
          <div className="flex items-center gap-2">
            <MaterialIcon name="security" className="text-error text-[20px] font-fill" fill />
            <h4 className="text-xs font-black text-error uppercase tracking-widest">Trust Indicators</h4>
          </div>
          <ul className="space-y-3 text-[11px] font-medium text-on-surface-variant">
            <li className="flex items-center gap-2">
              <MaterialIcon name="check_circle" className="text-emerald-500 text-[16px]" />
              <span>Phone Verified: <span className="font-bold text-on-surface">+1 (212) •••-4491</span></span>
            </li>
            <li className="flex items-center gap-2">
              <MaterialIcon name="check_circle" className="text-emerald-500 text-[16px]" />
              <span>Payment: <span className="font-bold text-on-surface">Amex ending in 4002</span></span>
            </li>
          </ul>
        </div>

        {/* Actions Footer */}
        <div className="pt-4 border-t border-outline-variant/10 flex flex-col gap-3">
          <button className="flex items-center justify-between px-4 py-3 bg-surface-container-high rounded-xl text-sm font-bold text-on-surface hover:bg-surface-container-highest transition-colors">
            <span>Internal Notes</span>
            <MaterialIcon name="chevron_right" className="text-slate-400" />
          </button>
          <button className="flex items-center justify-between px-4 py-3 bg-red-50 text-red-700 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
            <span>Resolve Ticket</span>
            <MaterialIcon name="task_alt" className="text-lg" />
          </button>
        </div>
      </aside>
    </div>
  );
}
