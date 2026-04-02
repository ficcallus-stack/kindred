export const dynamic = "force-static";

import { MaterialIcon } from "@/components/MaterialIcon";

const docSections = [
  {
    id: "family-hub",
    title: "Family Hub",
    icon: "dashboard",
    color: "bg-indigo-50 text-indigo-600",
    description: "Your operational command center for managing your profile and seeing a high-level view of your care network.",
    features: [
      { name: "Morphing Profile Hero", detail: "Click 'Edit Profile' to instantly transform your dashboard header into an interactive editor. Change your bio, location, and family details without leaving the page." },
      { name: "Live Stat Badges", detail: "Real-time counters showing your active job listings and upcoming bookings status." },
      { name: "Elite Status Card", detail: "Quick toggle to manage your Kindred Elite subscription and view unlocked benefits like the $1M liability buffer." }
    ]
  },
  {
    id: "job-postings",
    title: "Job Postings",
    icon: "work_history",
    color: "bg-blue-50 text-blue-600",
    description: "The engine for finding new talent. Broadcast your needs to our elite network of caregivers.",
    features: [
      { name: "Job Broadcast", detail: "Create detailed listings specifying hours, rates, and specialized needs (e.g., CPR certified, special needs experience)." },
      { name: "Applicant Hub", detail: "Review incoming applications sidebar. View caregiver ratings, badges, and response times before initiating a chat." },
      { name: "Instant Accept", detail: "One-click hiring for caregivers you've worked with before or those with high verified ratings." }
    ]
  },
  {
    id: "bookings",
    title: "Bookings & Scheduling",
    icon: "calendar_today",
    color: "bg-teal-50 text-teal-600",
    description: "Manage your confirmed care schedule and track active sessions.",
    features: [
      { name: "Calendar View", detail: "A unified view of all upcoming care sessions. Filter by caregiver or time range." },
      { name: "Check-In / Check-Out", detail: "Caregivers log their start and end times directly. You get instant notifications for overtime or early arrivals." },
      { name: "Care Memories", detail: "Access logs and photos shared by caregivers during the session to see your family's highlights." }
    ]
  },
  {
    id: "billing-credits",
    title: "Billing & Credits",
    icon: "account_balance_wallet",
    color: "bg-purple-50 text-purple-600",
    description: "Centralized financial management and our unique platform rewards system.",
    features: [
      { name: "3D Credits Card", detail: "Monitor your accrued Platform Credits in real-time. Earn 15 credits for every $1 spent in-app." },
      { name: "Unified Ledger", detail: "A single auditable list combining your subscription payments, hiring escrows, and credit rewards." },
      { name: "Coming Soon: Credit Redemption", detail: "In Phase 3, you'll be able to apply your point balance directly at checkout for discounts on your hires." }
    ]
  },
  {
    id: "safety-security",
    title: "Safety & Support",
    icon: "shield",
    color: "bg-rose-50 text-rose-600",
    description: "Our commitment to your family's protection and 24/7 assistance.",
    features: [
      { name: "Escrow Protection", detail: "Your payments are held securely and only released to the caregiver after the booking is completed and you are satisfied." },
      { name: "Direct Concierge", detail: "Access 24/7 dedicated support for dispute resolution or manual refund processing." },
      { name: "Verification Badges", detail: "Understand what each caregiver badge means, from background checks to specialized medical training." }
    ]
  }
];

export default function HelpCenterPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 p-6 md:p-12">
      
      {/* Search/Hero Header */}
      <div className="text-center max-w-4xl mx-auto space-y-6">
        <h1 className="text-6xl font-black font-headline text-primary tracking-tighter italic">Guide to KindredCare</h1>
        <p className="text-on-surface-variant text-xl font-medium opacity-70 leading-relaxed">
          Master the Kindred platform. Explore our feature documentation to learn how to hire faster, pay safer, and manage your family's care network.
        </p>
      </div>

      {/* Feature Navigation Grid */}
      <div className="space-y-24">
        {docSections.map((section, idx) => (
          <div key={section.id} className={`flex flex-col lg:flex-row gap-12 items-start ${idx % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
            
            {/* Context Sidebar (Floating Effect) */}
            <div className="lg:w-1/3 space-y-6 sticky top-32">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-xl shadow-black/5 ${section.color}`}>
                <MaterialIcon name={section.icon} className="text-4xl" />
              </div>
              <h2 className="text-4xl font-black font-headline text-primary italic leading-none tracking-tighter">{section.title}</h2>
              <p className="text-on-surface-variant font-medium leading-relaxed opacity-80">
                {section.description}
              </p>
            </div>

            {/* Content Cards */}
            <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {section.features.map((feature, fIdx) => (
                <div key={fIdx} className="bg-white p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-12 h-12 bg-primary/5 rounded-full group-hover:scale-[10] transition-transform duration-700"></div>
                  <div className="relative z-10 space-y-4">
                    <h3 className="text-xl font-black font-headline text-primary italic group-hover:translate-x-1 transition-transform">{feature.name}</h3>
                    <p className="text-sm font-medium text-on-surface-variant leading-relaxed opacity-70">
                      {feature.detail}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Extra "Quick Link" Card */}
              <div className="md:col-span-2 bg-surface-container-low p-6 rounded-[2rem] border border-dashed border-outline-variant/20 flex items-center justify-between group">
                <span className="text-xs font-black uppercase tracking-widest text-primary/40">Documentation Index #{idx + 1}</span>
                <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                  View Path <MaterialIcon name="chevron_right" />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Support Footer */}
      <div className="bg-primary text-white rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[120px]"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-xl space-y-6 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-black font-headline italic tracking-tighter">Still have questions?</h2>
            <p className="text-lg opacity-80 font-medium leading-relaxed">
              Our Family Concierge team is available 24/7 to help you optimize your care search or resolve billing discrepancies.
            </p>
          </div>
          <a href="/dashboard/messages?tab=support" className="px-12 py-6 bg-white text-primary rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:scale-110 active:scale-95 transition-all inline-block text-center">
            Chat with Concierge
          </a>
        </div>
      </div>

    </div>
  );
}
