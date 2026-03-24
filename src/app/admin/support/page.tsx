import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata = {
  title: "Support | Kindred Core Admin",
};

export default function AdminSupportPage() {
  return (
    <div className="p-10 max-w-4xl space-y-10">
      <header>
        <h1 className="text-3xl font-black text-[#002B5B] tracking-tight">Support</h1>
        <p className="text-slate-400 text-sm font-bold mt-1">Help and documentation</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: "Documentation", desc: "API references and integration guides", icon: "description", href: "#" },
          { title: "Status Page", desc: "View current platform health and uptime", icon: "monitor_heart", href: "#" },
          { title: "Contact Engineering", desc: "Report bugs or request features", icon: "bug_report", href: "mailto:engineering@kindredcare.us" },
          { title: "Security", desc: "Report security vulnerabilities", icon: "security", href: "#" },
        ].map((card) => (
          <a
            key={card.title}
            href={card.href}
            className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group block"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#F8F9FE] flex items-center justify-center mb-6 group-hover:bg-[#002B5B]/5 transition-colors">
              <MaterialIcon name={card.icon} className="text-2xl text-[#002B5B]" />
            </div>
            <h3 className="font-black text-[#002B5B] text-lg mb-2 tracking-tight">{card.title}</h3>
            <p className="text-sm text-slate-400 font-medium">{card.desc}</p>
          </a>
        ))}
      </div>

      <section className="bg-[#002B5B] rounded-3xl p-12 text-white text-center relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-black tracking-tight">Need immediate help?</h2>
          <p className="text-white/70 font-medium">Our support team is available 24/7 for critical issues.</p>
          <button className="px-8 py-4 bg-white text-[#002B5B] font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl hover:shadow-2xl transition-all mt-4">
            Open Support Ticket
          </button>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl" />
      </section>
    </div>
  );
}
