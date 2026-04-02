import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MaterialIcon } from "@/components/MaterialIcon";

export const metadata: Metadata = {
  title: "Terms of Service | KindredCare US",
  description: "Read the comprehensive Terms of Service for KindredCare US. Understand our 12-point policy governing marketplace usage, payments, and liability.",
  alternates: {
    canonical: "https://kindredcareus.com/terms",
  }
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-surface font-body text-on-surface selection:bg-secondary-fixed min-h-screen flex flex-col">
      <Navbar />

      <main className="pt-32 pb-24 px-6 flex-1">
        <div className="max-w-4xl mx-auto">
          
          {/* Editorial Header Section */}
          <header className="mb-20 text-center relative max-w-3xl mx-auto">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-5 pointer-events-none">
              <MaterialIcon name="gavel" className="text-[120px]" />
            </div>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary tracking-tighter mb-6 relative z-10">
              Terms of Service
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Last Updated: March 25, 2026. Please read these terms carefully before using KindredCare US. Our goal is to ensure a safe, legally transparent marketplace for families and caregivers.
            </p>
          </header>

          {/* Terms Navigation Chips (Bento-style layout) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3 border border-outline-variant/10">
              <MaterialIcon name="verified_user" className="text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Eligibility</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3 border border-outline-variant/10">
              <MaterialIcon name="handshake" className="text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Marketplace</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3 border border-outline-variant/10">
              <MaterialIcon name="payments" className="text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Payments</span>
            </div>
            <div className="bg-surface-container-low p-4 rounded-xl flex items-center justify-center gap-3 border border-outline-variant/10">
              <MaterialIcon name="shield" className="text-secondary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Liability</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Sticky TOC Sidebar */}
            <aside className="lg:col-span-4 h-fit sticky top-32 hidden lg:block">
              <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
                <h3 className="font-headline font-bold text-primary mb-6 text-xl">Quick Links</h3>
                <nav className="space-y-3">
                  <a className="block text-xs font-bold uppercase tracking-widest text-secondary border-l-2 border-secondary pl-4" href="#section-1">1. Acceptance</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-2">2. Eligibility</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-3">3. Marketplace Nature</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-4">4. Vetting Constraints</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-5">5. User Conduct</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-6">6. Content Usage</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-7">7. Payments & Fees</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-8">8. Refunds</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-9">9. Warranties</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-10">10. Liability Limits</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-11">11. Indemnity</a>
                  <a className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors pl-4 border-l-2 border-transparent" href="#section-12">12. Arbitration</a>
                </nav>
              </div>
            </aside>

            {/* Content Canvas */}
            <article className="lg:col-span-8 space-y-20">
              
              {/* Section 1: Introduction */}
              <section id="section-1" className="scroll-mt-32 relative group">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-tertiary-fixed p-4 rounded-2xl rotate-[-3deg] group-hover:rotate-0 transition-transform duration-500 shadow-md">
                    <MaterialIcon name="info" className="text-on-tertiary-fixed text-4xl" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-headline text-3xl font-bold text-primary mb-6">1. Acceptance of Terms</h2>
                    <div className="text-on-surface-variant text-lg leading-relaxed space-y-4">
                      <p>By accessing or using the KindredCare US platform (including web and mobile applications), you agree to be bound by these exhaustive Terms of Service. These terms constitute a legally binding agreement between you and KindredCare US Inc. regarding your use of our platform and services.</p>
                      <p>If you do not agree to every clause within these terms, you must expressly exit the platform and desist from using our services.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Eligibility (Asymmetric Layout) */}
              <section id="section-2" className="scroll-mt-32 bg-surface-container-low rounded-[3rem] p-10 md:p-14 relative overflow-hidden border border-outline-variant/10 shadow-[0_32px_48px_-12px_rgba(3,31,65,0.05)]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/30 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                <div className="relative z-10 max-w-2xl">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-primary-container p-4 rounded-2xl shadow-inner">
                      <MaterialIcon name="group_add" className="text-on-primary-container text-2xl" />
                    </div>
                    <h2 className="font-headline text-3xl font-bold text-primary">2. Strict Eligibility</h2>
                  </div>
                  <ul className="space-y-6">
                    <li className="flex gap-4 items-start">
                      <MaterialIcon name="check_circle" className="text-secondary shrink-0 mt-1" />
                      <p className="text-on-surface-variant text-lg">You must be at least exactly eighteen (18) years of age to register, create an account, or execute contracts on our platform.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                      <MaterialIcon name="check_circle" className="text-secondary shrink-0 mt-1" />
                      <p className="text-on-surface-variant text-lg">Caregivers definitively affirm they hold valid legal documentation to work as W-2 or 1099 contractors within the United States.</p>
                    </li>
                    <li className="flex gap-4 items-start">
                      <MaterialIcon name="check_circle" className="text-secondary shrink-0 mt-1" />
                      <p className="text-on-surface-variant text-lg">You have not been previously suspended or removed from our Services for violations of trust or safety protocols.</p>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 3 & 4: Marketplace Rules (Bento-style Highlight) */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div id="section-3" className="scroll-mt-32 bg-surface-container-lowest p-8 rounded-[2rem] border-l-8 border-secondary shadow-lg">
                  <div className="mb-6">
                    <MaterialIcon name="storefront" className="text-4xl text-primary" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-primary mb-4">3. Nature of Marketplace</h3>
                  <p className="text-on-surface-variant mb-6 text-base leading-relaxed">
                    KindredCare US solely operates as a digital venue connecting Families ("Parents") and independent childcare providers ("Caregivers"). <strong>We are NOT an employer, an employment agency, or a referral agency.</strong> Caregivers are strictly independent contractors. Parents are exclusively responsible for compliance with all applicable tax, wage, and employment laws.
                  </p>
                </div>
                
                <div id="section-4" className="scroll-mt-32 bg-primary-container p-8 rounded-[2rem] text-on-primary shadow-xl">
                  <div className="mb-6">
                    <MaterialIcon name="security" className="text-4xl text-secondary-fixed" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-4">4. Vetting Constraints</h3>
                  <p className="text-on-primary-container mb-6 text-base leading-relaxed">
                    While KindredCare US implements comprehensive third-party background checks (FCRA compliant), we do not guarantee the absolute accuracy of these reports. The ultimate hiring decision and duty of continuous safety assessment rests absolutely with the Family. 
                  </p>
                </div>
              </section>

              {/* Section 5: User Conduct */}
              <section id="section-5" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">5. User Conduct & Prohibited Acts</h2>
                <div className="space-y-4 text-on-surface-variant text-lg leading-relaxed">
                  <p>Users agree to conduct themselves with superlative ethical standards. You expressly agree NOT to:</p>
                  <ul className="list-disc pl-6 space-y-2 marker:text-primary">
                    <li>Solicit caregivers to bypass the KindredCare US platform to avoid service/escrow fees.</li>
                    <li>Utilize the platform to discriminate against protected classes under federal or state law.</li>
                    <li>Provide falsified credentials, references, or CPR certifications.</li>
                    <li>Harass, stalk, or abuse any other marketplace participant.</li>
                  </ul>
                </div>
              </section>

              {/* Section 6: Content Rights */}
              <section id="section-6" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">6. Content Ownership & Licenses</h2>
                <div className="text-on-surface-variant text-lg leading-relaxed">
                  <p>When you post reviews, images, or profile text ("User Content"), you grant KindredCare US a non-exclusive, worldwide, royalty-free, irrevocable license to use, reproduce, and display such content for marketing and operational purposes. However, you retain ultimate ownership of your raw User Content.</p>
                </div>
              </section>

              {/* Section 7 & 8: Financials */}
              <section className="bg-surface-container-low p-10 rounded-[3rem] border border-outline-variant/20 shadow-sm">
                <div className="space-y-12">
                  <div id="section-7" className="scroll-mt-32 flex flex-col md:flex-row gap-8">
                    <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg font-headline font-black text-xl">
                      07
                    </div>
                    <div>
                      <h4 className="font-headline text-2xl font-bold text-primary mb-2">Payments & Escrow</h4>
                      <p className="text-on-surface-variant text-lg leading-relaxed">KindredCare charges a nominal platform processing fee distinct to each booking. All executed payments flow through secured escrow gateways (Stripe PCI-DSS). Caregivers are paid immediately upon a mutually agreed completion of a booking. Circumvention of these authorized payment gateways results in instant, permanent account banishment.</p>
                    </div>
                  </div>
                  <div id="section-8" className="scroll-mt-32 flex flex-col md:flex-row gap-8">
                    <div className="h-16 w-16 bg-primary text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg font-headline font-black text-xl">
                      08
                    </div>
                    <div>
                      <h4 className="font-headline text-2xl font-bold text-primary mb-2">Cancellations & Refunds</h4>
                      <p className="text-on-surface-variant text-lg leading-relaxed">Cancellations initialized more than 48 hours prior to a scheduled session may receive a complete reimbursement (excluding non-refundable gateway fees). Cancellations triggered under 24 hours incur a 50% penalty to compensate the Caregiver's reserved time.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 9: Disclaimers */}
              <section id="section-9" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">9. Broad Disclaimers of Warranties</h2>
                <div className="text-on-surface-variant text-lg leading-relaxed p-6 bg-error-container/20 border-l-4 border-error text-error rounded-r-2xl font-medium">
                  THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE." KINDREDCARE US EXPLICITLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING FITNESS FOR A PARTICULAR PURPOSE. WE DO NOT WARRANT THAT PROFILES ARE COMPLETE, BACKGROUND CHECKS ARE INFALLIBLE, OR THAT FAMILIES WILL MEET CAREGIVER EXPECTATIONS.
                </div>
              </section>

              {/* Section 10: Limitation of Liability */}
              <section id="section-10" className="scroll-mt-32 mt-8">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">10. Strict Limitation of Liability</h2>
                <div className="text-on-surface-variant text-lg leading-relaxed">
                  <p>In no event shall KindredCare US Inc., its executives, or affiliates be legally liable for any indirect, incidental, special, consequential, or punitive damages arising from the use of the platform. Under no circumstance will the total, cumulative liability to you exceed the total service fees you have remitted directly to the platform in the preceding six (6) months.</p>
                </div>
              </section>

              {/* Section 11: Indemnification */}
              <section id="section-11" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">11. Indemnification</h2>
                <div className="text-on-surface-variant text-lg leading-relaxed">
                  <p>You agree to legally defend, indemnify, and hold harmless KindredCare US and its agents from any claims, suits, losses, liabilities, damages, or expenses (including exhaustive attorney's fees) arising out of your negligence, violation of these terms, or misconduct transpiring during a childcare booking.</p>
                </div>
              </section>

              {/* Section 12: Arbitration */}
              <section id="section-12" className="scroll-mt-32">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">12. Dispute Resolution & Arbitration</h2>
                <div className="text-on-surface-variant text-lg leading-relaxed border border-primary/20 bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm font-medium">
                  <p>Please read this section critically. Any disputes arising from these Terms or your use of the marketplace shall be resolved by binding, confidential arbitration administered by the American Arbitration Association (AAA), rather than in a court of law. **YOU AGREE TO WAIVE YOUR RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT.** Arbitration shall occur within the State of Delaware.</p>
                </div>
              </section>

              {/* Support CTA */}
              <section className="bg-primary/5 border border-primary/10 p-12 rounded-[3.5rem] text-center shadow-sm">
                <h2 className="font-headline text-3xl font-bold text-primary mb-6">Questions about these clauses?</h2>
                <p className="text-on-surface-variant text-lg mb-10 max-w-2xl mx-auto">Our legal and support teams are available to help clarify any section of this agreement to ensure you feel legally confident using our platform.</p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <a href="/dashboard/support" className="bg-primary text-white px-10 py-4 text-xs font-black uppercase tracking-widest rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all inline-block">
                    Contact Support
                  </a>
                  <button className="bg-surface-container-high text-primary px-10 py-4 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-surface-container-highest transition-all">
                    Download PDF
                  </button>
                </div>
              </section>

            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
