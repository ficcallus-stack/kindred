import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = {
  title: "Privacy Policy | KindredCare US",
  description: "Detailed information on how KindredCare US collects, uses, and protects your personal data as a family or caregiver on our platform.",
  alternates: {
    canonical: "https://kindredcareus.com/privacy",
  }
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-surface font-body text-on-surface antialiased min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Header Section */}
          <header className="mb-16 text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-xs font-bold tracking-widest uppercase mb-6">
              Trust & Transparency
            </div>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary tracking-tighter mb-6">Privacy Policy</h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              At KindredCare US (formerly Curated Care), we believe your privacy is as paramount as the care we provide. This comprehensive policy details how we legally handle, protect, and process your personal data.
            </p>
            <div className="mt-8 text-sm text-on-surface-variant font-medium">
              Effective Date: March 25, 2026
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Table of Contents - Sticky Sidebar */}
            <aside className="lg:col-span-4 h-fit sticky top-32 hidden lg:block">
              <div className="bg-surface-container-low rounded-3xl p-8">
                <h3 className="font-headline font-bold text-primary mb-6 text-xl">On this page</h3>
                <nav className="space-y-4">
                  <a className="block text-sm text-secondary font-bold border-l-2 border-secondary pl-4" href="#introduction">Introduction & Scope</a>
                  <a className="block text-sm text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#information-collection">Information Collection</a>
                  <a className="block text-sm text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#data-usage">How We Use Your Data</a>
                  <a className="block text-sm text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#data-security">Data Security & Retention</a>
                  <a className="block text-sm text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#third-party">Third-Party Service Providers</a>
                  <a className="block text-sm text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#your-rights">Your Legal Rights (CCPA & Privacy)</a>
                  <a className="block text-sm text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#contact">Contact Our Privacy Team</a>
                </nav>
              </div>

              <div className="mt-8 bg-primary-container rounded-3xl p-8 text-white overflow-hidden relative shadow-xl">
                <div className="relative z-10">
                  <h4 className="font-headline font-bold text-xl mb-3">Data Request?</h4>
                  <p className="text-sm text-on-primary-container mb-6 leading-relaxed">Our legal privacy team is available to honor data access or deletion requests.</p>
                  <a href="mailto:privacy@kindredcareus.com" className="block text-center bg-secondary-fixed text-on-secondary-fixed text-sm font-bold py-3 px-4 rounded-xl w-full transition-transform active:scale-95 shadow-md">
                    Email Privacy Officer
                  </a>
                </div>
                <MaterialIcon name="lock" className="absolute -bottom-6 -right-6 text-9xl opacity-5 rotate-12" />
              </div>
            </aside>

            {/* Policy Content */}
            <article className="lg:col-span-8 space-y-16">
              
              <section id="introduction" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">1. Introduction & Scope</h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed text-lg">
                  <p>
                    Welcome to KindredCare US. We deeply respect your privacy and are committed to protecting your personal data. This legally binding Privacy Policy informs you as to how we look after your personal data when you visit our website, use our marketplace services, undergo background checks, or interact with us in any digital capacity.
                  </p>
                  <p>
                    Our platform is designed to connect families with premium caregivers, and the integrity of this connection relies heavily on the strict, legally compliant data practices outlined below. This policy applies to all users (parents, guardians, and independent caregivers) residing in the United States.
                  </p>
                </div>
              </section>

              {/* Data Collection Feature Card */}
              <section id="information-collection" className="scroll-mt-32">
                <div className="bg-surface-container-lowest rounded-[3rem] p-10 border-l-8 border-secondary shadow-xl">
                  <h2 className="font-headline text-3xl font-bold text-primary mb-8 flex items-center gap-4">
                    <MaterialIcon name="person_search" className="text-secondary text-4xl" />
                    2. Information Collection
                  </h2>
                  <div className="space-y-8 text-on-surface-variant">
                    <p className="text-lg">We systematically collect, use, store, and transfer different categories of personal data essential for operating a trusted childcare marketplace:</p>
                    
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <li className="flex gap-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                        <MaterialIcon name="badge" className="text-primary text-3xl shrink-0" />
                        <div>
                          <span className="block font-black text-primary text-sm uppercase tracking-widest mb-1">Identity & Vetting Data</span>
                          <span className="text-sm leading-relaxed block">Legal First name, middle name, last name, date of birth, Social Security Number (SSN - encrypted and solely for background checks), and government-issued ID images.</span>
                        </div>
                      </li>
                      <li className="flex gap-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                        <MaterialIcon name="contact_mail" className="text-primary text-3xl shrink-0" />
                        <div>
                          <span className="block font-black text-primary text-sm uppercase tracking-widest mb-1">Contact Data</span>
                          <span className="text-sm leading-relaxed block">Residential address, billing address, active email address, and verified cellular telephone numbers.</span>
                        </div>
                      </li>
                      <li className="flex gap-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                        <MaterialIcon name="payments" className="text-primary text-3xl shrink-0" />
                        <div>
                          <span className="block font-black text-primary text-sm uppercase tracking-widest mb-1">Financial Data</span>
                          <span className="text-sm leading-relaxed block">Bank account routing numbers, tax routing information, and payment card details (processed securely via PCI-DSS compliant Stripe).</span>
                        </div>
                      </li>
                      <li className="flex gap-4 bg-surface-container-low p-6 rounded-2xl border border-outline-variant/10">
                        <MaterialIcon name="location_on" className="text-primary text-3xl shrink-0" />
                        <div>
                          <span className="block font-black text-primary text-sm uppercase tracking-widest mb-1">Location Data</span>
                          <span className="text-sm leading-relaxed block">Precise geolocation for matching nearby families and nannies, and IP address logging for anti-fraud measures.</span>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="data-usage" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">3. How We Use Your Data</h2>
                <div className="space-y-4 text-on-surface-variant leading-relaxed text-lg">
                  <p>
                    We will only use your personal data when the law allows us to. Most commonly, we use your personal data in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                    <li><strong>Contract Execution:</strong> Where we need to perform the contract we are about to enter into or have entered into with you (e.g., matching a nanny with a family).</li>
                    <li><strong>Safety & Trust:</strong> Conducting extensive Motor Vehicle (MVR), state, and continuous federal criminal background checks on caregivers.</li>
                    <li><strong>Legitimate Interests:</strong> For the running of our business, provision of administration and IT services, network security, and preventing fraud.</li>
                    <li><strong>Legal Obligation:</strong> Where we need to comply with a legal or regulatory obligation, including mandatory reporting to law enforcement or child protective services if necessary.</li>
                  </ul>
                </div>
              </section>

              <section id="data-security" className="scroll-mt-32">
                <div className="relative overflow-hidden bg-primary text-white rounded-[3rem] p-12 shadow-2xl">
                  <div className="relative z-10 max-w-xl">
                    <h2 className="font-headline text-3xl font-bold mb-6 flex items-center gap-4">
                      <MaterialIcon name="verified_user" className="text-tertiary-fixed text-4xl" />
                      4. Data Security & Retention
                    </h2>
                    <p className="text-on-primary-container mb-8 leading-relaxed text-lg">
                      We have engineered strict security measures to prevent your personal data from being accidentally lost, used, altered, or accessed in an unauthorized way. KindredCare utilizes enterprise-grade architecture.
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <MaterialIcon name="check_circle" className="text-tertiary-fixed shrink-0" />
                        <span className="text-base font-medium">AES-256 Encryption at rest and TLS 1.3 in transit across all databases.</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <MaterialIcon name="check_circle" className="text-tertiary-fixed shrink-0" />
                        <span className="text-base font-medium">Strict Identity-Aware Proxy (IAP) zero-trust access for all staff & engineers.</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <MaterialIcon name="check_circle" className="text-tertiary-fixed shrink-0" />
                        <span className="text-base font-medium">Immediate redaction of sensitive SSN/tax data post-background check verification.</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 h-full w-1/2 opacity-20 pointer-events-none">
                    <div className="w-full h-full bg-gradient-to-l from-transparent to-primary absolute inset-0 z-10"></div>
                  </div>
                </div>
              </section>

              <section id="third-party" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">5. Third-Party Service Providers</h2>
                <p className="text-on-surface-variant mb-8 leading-relaxed text-lg">
                  We meticulously vet external processors. We may share your personal data with the following categories of legally compliant third parties:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 shadow-sm">
                    <MaterialIcon name="account_balance" className="text-4xl text-primary mb-4" />
                    <h4 className="font-headline font-bold text-primary mb-2 text-xl">Payment Processors</h4>
                    <p className="text-sm text-on-surface-variant">Stripe Inc. handles all Escrow, Payouts, and Card info under PCI-DSS Level 1 compliance.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 shadow-sm">
                    <MaterialIcon name="policy" className="text-4xl text-primary mb-4" />
                    <h4 className="font-headline font-bold text-primary mb-2 text-xl">FCRA Background Checkers</h4>
                    <p className="text-sm text-on-surface-variant">Accredited consumer reporting agencies to perform SSN trace, sex offender registry, and watch-list searches.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 shadow-sm">
                    <MaterialIcon name="storage" className="text-4xl text-primary mb-4" />
                    <h4 className="font-headline font-bold text-primary mb-2 text-xl">Cloud Infrastructure</h4>
                    <p className="text-sm text-on-surface-variant">AWS, Neon Database, and Cloudflare host our data with SOC 2 Type II compliance.</p>
                  </div>
                  <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 shadow-sm">
                    <MaterialIcon name="map" className="text-4xl text-primary mb-4" />
                    <h4 className="font-headline font-bold text-primary mb-2 text-xl">Mapping & Geolocation</h4>
                    <p className="text-sm text-on-surface-variant">Mapbox processes anonymous coordinates to calculate precise driving distances for jobs.</p>
                  </div>
                </div>
              </section>

              <section id="your-rights" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">6. Your Legal Rights (CCPA & Privacy)</h2>
                <p className="text-on-surface-variant mb-8 leading-relaxed text-lg">
                  Under the California Consumer Privacy Act (CCPA) and other state-specific privacy laws, you possess fundamental rights regarding your personal information:
                </p>
                <div className="space-y-4">
                  <details className="group bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-primary text-lg list-none">
                      Right to Access & Portability
                      <MaterialIcon name="expand_more" className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-6 pb-6 text-base text-on-surface-variant leading-relaxed">
                      You have the right to request a formal copy of the specific pieces of personal information we have collected about you over the past 12 months, delivered in a readily usable electronic format.
                    </div>
                  </details>
                  <details className="group bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-primary text-lg list-none">
                      Right to Deletion (Right to be Forgotten)
                      <MaterialIcon name="expand_more" className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-6 pb-6 text-base text-on-surface-variant leading-relaxed">
                      You may request that we delete any of your personal information that we collected from you and retained, subject to certain exceptions (such as maintaining records for legal disputes, tax compliance, or completing a pending transaction).
                    </div>
                  </details>
                  <details className="group bg-surface-container-lowest border border-outline-variant/20 rounded-2xl overflow-hidden transition-all shadow-sm">
                    <summary className="flex justify-between items-center p-6 cursor-pointer font-bold text-primary text-lg list-none">
                      Right to Non-Discrimination
                      <MaterialIcon name="expand_more" className="group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-6 pb-6 text-base text-on-surface-variant leading-relaxed">
                      We will not discriminate against you for exercising any of your CCPA rights. We will not deny you goods or services, charge you different prices, or provide a different quality of service.
                    </div>
                  </details>
                </div>
              </section>

              <section id="contact" className="scroll-mt-32 bg-primary/5 border border-primary/10 rounded-[3rem] p-12 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1">
                  <h2 className="font-headline text-3xl font-bold text-primary mb-4">Questions or Data Requests?</h2>
                  <p className="text-on-surface-variant mb-8 text-lg">If you have any questions about this privacy policy, wish to execute a data deletion request, or contact our Data Protection Officer, please reach out via formal email.</p>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-primary font-bold text-lg">
                      <div className="w-12 h-12 bg-surface text-primary rounded-full flex items-center justify-center shadow-sm">
                        <MaterialIcon name="alternate_email" />
                      </div>
                      privacy@kindredcareus.com
                    </div>
                    <div className="flex items-center gap-4 text-on-surface-variant">
                      <div className="w-12 h-12 bg-surface text-secondary border border-secondary/20 rounded-full flex items-center justify-center shadow-sm">
                        <MaterialIcon name="location_on" />
                      </div>
                      123 Executive Care Plaza, Suite 500, New York, NY 10001
                    </div>
                  </div>
                </div>
              </section>

            </article>
          </div>
        </div>
      </main>
      
    </div>
  );
}
