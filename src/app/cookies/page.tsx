import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = {
  title: "Cookie Policy | KindredCare US",
  description: "Learn how and why KindredCare US uses cookies to track performance, secure accounts, and optimize the caregiver marketplace experience.",
  alternates: {
    canonical: "https://kindredcareus.com/cookies",
  }
};

export default function CookiePolicyPage() {
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 px-6 flex-1">
        {/* Hero Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase text-secondary bg-secondary/10 rounded-full border border-secondary/20">
            Legal Transparency
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-6 tracking-tight font-headline">Cookie Policy</h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            At KindredCare US, we believe in being entirely crystalline about how we collect and use data related to you. This policy provides detailed information about how we deploy server-side sessions and tracking cookies on our premium platform.
          </p>
          <div className="mt-8 text-sm text-outline font-medium">Last Updated: March 25, 2026</div>
        </div>

        {/* Bento Layout for Cookie Types */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          
          {/* Essential Cookies */}
          <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
              <MaterialIcon name="security" className="text-primary text-4xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary mb-3 font-headline">Essential Platform Cookies</h3>
              <p className="text-on-surface-variant text-base leading-relaxed mb-6">
                These are strictly necessary cryptographic cookies for the marketplace to function and cannot be switched off under any circumstances. They are solely activated in response to service requests such as logging into your Clerk Auth account, storing your Firebase UID, or holding Stripe session tokens for checkout securely.
              </p>
              <div className="flex items-center text-xs font-black text-primary uppercase tracking-widest border border-outline-variant/20 w-fit px-3 py-1.5 rounded-lg">
                <span className="w-2 h-2 bg-success rounded-full mr-2 shadow-sm animate-pulse"></span> Mandatory / Active
              </div>
            </div>
          </div>

          {/* Performance Cookies */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/20">
            <div className="bg-secondary/10 p-4 rounded-2xl inline-block mb-6 border border-secondary/20">
              <MaterialIcon name="analytics" className="text-secondary text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-headline">Performance</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              These lightweight modules allow us to count programmatic visits and traffic sources via completely anonymized analytical endpoints so we can massively optimize our Next.js architecture and Vercel edge functions.
            </p>
          </div>

          {/* Functional Cookies */}
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/20">
            <div className="bg-primary-container p-4 rounded-2xl inline-block mb-6 shadow-inner">
              <MaterialIcon name="settings_suggest" className="text-on-primary-container text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-primary mb-3 font-headline">Functional Memory</h3>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Enable the dynamic interface to provide immensely enhanced functionality and personalization, strictly like storing your preferred Nanny filters (e.g., matching "Bilingual" or "CPR Certified") to avoid repetitive selecting.
            </p>
          </div>

          {/* Targeting Cookies */}
          <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-error-container p-4 rounded-2xl border border-error/20">
              <MaterialIcon name="ads_click" className="text-on-error-container text-4xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary mb-3 font-headline">Targeting & Ad Retargeting</h3>
              <p className="text-on-surface-variant text-base leading-relaxed mb-6">
                These extremely specific cookies may be injected throughout our client-side by validated marketing intelligence partners. They may be exclusively utilized by Google or Meta Pixel to orchestrate a profile of your demographic interests to safely show you KinderCare caregiver ad blocks on generic external applications safely.
              </p>
              <button disabled className="text-sm font-black uppercase text-outline flex items-center gap-1 opacity-50 cursor-not-allowed">
                Preferences (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Content Section */}
        <div className="max-w-3xl mx-auto space-y-16">
          <section>
            <h2 className="text-3xl font-bold text-primary mb-4 font-headline">1. What practically are cookies?</h2>
            <div className="h-1.5 w-16 bg-secondary mb-8 rounded-full shadow-sm"></div>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-6">
              Cookies are incredibly small JSON text files that are temporarily or persistently stored securely inside your browser caching system that allow KindredCare US or a PCI-compliant third party to identify your active JWT authenticated sessions. Cookies can be invoked to extract, transmit and cache essential bits of non-identifiable telemetry across diverse applications.
            </p>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start bg-surface-container-low p-4 rounded-2xl">
                <MaterialIcon name="check_circle" className="text-secondary mr-4 text-xl shrink-0 mt-0.5" />
                <span className="text-on-surface-variant">To enable rigorous functionality of Server Actions and Escrow workflows natively.</span>
              </li>
              <li className="flex items-start bg-surface-container-low p-4 rounded-2xl">
                <MaterialIcon name="check_circle" className="text-secondary mr-4 text-xl shrink-0 mt-0.5" />
                <span className="text-on-surface-variant">To automatically shield End-Users globally from CSRF cyber-attacks effectively.</span>
              </li>
              <li className="flex items-start bg-surface-container-low p-4 rounded-2xl">
                <MaterialIcon name="check_circle" className="text-secondary mr-4 text-xl shrink-0 mt-0.5" />
                <span className="text-on-surface-variant">To reliably cache rigorous Parent booking filter preferences.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold text-primary mb-4 font-headline">2. Contextual Telemetry Constraints</h2>
            <div className="h-1.5 w-16 bg-secondary mb-8 rounded-full shadow-sm"></div>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              Whenever you execute requests into our API boundaries, we silently place a matrix of encoded `HttpOnly` security cookies locally inside your architecture to stop cross-site scripting vulnerabilities. We utilize both short-living session-tokens natively alongside persistent authorization artifacts.
            </p>
            <div className="bg-secondary/10 p-8 rounded-3xl border border-secondary/20 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <MaterialIcon name="verified_user" className="text-9xl" />
              </div>
              <h4 className="font-bold text-primary mb-3 text-lg font-headline">Editorial Safety Note</h4>
              <p className="font-medium text-on-surface-variant leading-relaxed text-base italic relative z-10 w-4/5">
                "Your cryptographic security is our foundational priority. We inherently process cookie-borne data with the exact same intensive vigilance we demand from our elite childcare providers—with categorical professional integrity and a zero-trust architecture focus."
              </p>
            </div>
          </section>

          <section className="bg-primary text-on-primary p-12 rounded-[3.5rem] relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <h2 className="text-4xl font-extrabold mb-6 font-headline tracking-tight">Your Direct Choices Regarding Telemetry</h2>
              <p className="text-on-primary-container text-lg leading-relaxed mb-10 w-11/12 md:w-3/4">
                If you systematically prefer to forcibly delete historical cache metrics entirely or enforce your modern browser to strictly reject non-essential payloads moving forward, navigate simply to your core browser's security console. Please be aware that violently rejecting essential JSON-Web-Tokens forcefully will totally disable login capabilities and caregiver matching entirely.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-secondary-fixed text-on-secondary-fixed px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:shadow-lg hover:-translate-y-0.5 transition-all">
                  Launch Settings
                </button>
                <button className="border border-on-primary-container/30 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-colors">
                  Reject Advertising Trackers
                </button>
              </div>
            </div>
            <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-primary-container rounded-full blur-[80px] opacity-40"></div>
            <div className="absolute -left-12 -top-12 w-64 h-64 bg-secondary-fixed rounded-full blur-[100px] opacity-10"></div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
