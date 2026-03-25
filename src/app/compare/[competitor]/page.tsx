import { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQSchema from '@/components/seo/FAQSchema';
import { MaterialIcon } from '@/components/MaterialIcon';

export async function generateMetadata({ params }: { params: { competitor: string } }): Promise<Metadata> {
  const competitor = params.competitor.replace(/-/g, '.');
  const capitalized = competitor.charAt(0).toUpperCase() + competitor.slice(1);
  return {
    title: `Best Alternative to ${capitalized} in 2026 | KindredCare US`,
    description: `Tired of hidden fees on ${capitalized}? Discover why families are switching to KindredCare US for rigorous background checks and zero subscription models.`,
  };
}

export default function ComparePage({ params }: { params: { competitor: string } }) {
  const competitorRaw = params.competitor.replace(/-/g, '.');
  const competitor = competitorRaw.charAt(0).toUpperCase() + competitorRaw.slice(1);

  const faqs = [
    {
      question: `Is KindredCare safer than ${competitor}?`,
      answer: `Unlike some competitors, KindredCare mandates continuous federal and state criminal background checks before any caregiver can accept a booking.`
    },
    {
      question: `Does KindredCare charge monthly subscription fees like ${competitor}?`,
      answer: `No. KindredCare completely eliminates the subscription model. You only pay a transparent service fee when you successfully book a nanny.`
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Navbar />
      <FAQSchema faqs={faqs} />

      <main className="pt-32 pb-24 px-6 flex-1 max-w-5xl mx-auto w-full">
        <header className="text-center mb-20">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-error-container text-on-error-container text-xs font-bold tracking-widest uppercase mb-6 border border-error/20">
            Competitor Analysis
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary tracking-tighter mb-8 leading-tight">
            The #1 Alternative to <br/> <span className="text-error line-through decoration-4 decoration-error/50">{competitor}</span>
          </h1>
          <p className="text-on-surface-variant text-xl max-w-2xl mx-auto leading-relaxed">
            Stop paying monthly subscription fees just to message caregivers. Switch to KindredCare US and experience premium vetting, transparent pricing, and instant escrow payments.
          </p>
        </header>

        {/* Comparison Table */}
        <section className="bg-surface-container-lowest rounded-[3rem] p-10 border border-outline-variant/20 shadow-xl overflow-hidden mb-24">
          <div className="grid grid-cols-3 gap-6 items-center border-b border-outline-variant/20 pb-6 mb-6">
            <div className="font-bold text-lg text-on-surface-variant">Feature</div>
            <div className="font-headline text-2xl font-black text-primary text-center">KindredCare US</div>
            <div className="font-headline text-xl font-bold text-on-surface-variant text-center opacity-70">{competitor}</div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-6 items-center py-4 bg-surface-container-low rounded-2xl px-6">
              <div className="font-bold text-primary text-sm flex items-center gap-2"><MaterialIcon name="credit_card_off" className="text-secondary" /> Monthly Subscription Fees</div>
              <div className="text-center text-success font-black text-xl flex justify-center"><MaterialIcon name="close" className="text-error" /></div>
              <div className="text-center text-on-surface-variant flex justify-center opacity-50"><MaterialIcon name="check" /></div>
            </div>
            <div className="grid grid-cols-3 gap-6 items-center py-4 px-6">
              <div className="font-bold text-primary text-sm flex items-center gap-2"><MaterialIcon name="security" className="text-secondary" /> Mandatory Background Checks</div>
              <div className="text-center text-success font-black text-xl flex justify-center"><MaterialIcon name="check_circle" className="text-success" /></div>
              <div className="text-center text-on-surface-variant font-medium opacity-50 text-sm">Often Optional / Extra Cost</div>
            </div>
            <div className="grid grid-cols-3 gap-6 items-center py-4 bg-surface-container-low rounded-2xl px-6">
              <div className="font-bold text-primary text-sm flex items-center gap-2"><MaterialIcon name="support_agent" className="text-secondary" /> Dedicated Trust & Safety Team</div>
              <div className="text-center text-success font-black text-xl flex justify-center"><MaterialIcon name="check_circle" className="text-success" /></div>
              <div className="text-center text-on-surface-variant flex justify-center opacity-50"><MaterialIcon name="close" className="text-error" /></div>
            </div>
          </div>
        </section>

        {/* Dynamic FAQ Section */}
        <section className="bg-secondary/10 p-12 rounded-[3rem] text-primary">
          <h2 className="font-headline text-3xl font-bold mb-8 text-center border-b border-secondary/20 pb-8">Common Questions About Switching</h2>
          <div className="space-y-6 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-secondary/10">
                <h4 className="font-bold text-xl mb-3 flex items-start gap-4">
                  <MaterialIcon name="lightbulb" className="text-secondary shrink-0 mt-0.5" />
                  {faq.question}
                </h4>
                <p className="text-on-surface-variant leading-relaxed text-lg">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
