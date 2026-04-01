export default function PricingPage() {
  return (
    <div className="bg-surface font-body text-on-surface min-h-screen pt-32 pb-24 px-8 max-w-4xl mx-auto">
      <h1 className="text-5xl font-black font-headline text-primary tracking-tighter mb-12 italic">Transparent Pricing</h1>
      
      <div className="space-y-12">
        <section className="bg-white p-10 rounded-3xl shadow-xl border border-outline-variant/10">
          <h2 className="text-3xl font-bold font-headline mb-4 text-primary">For Families</h2>
          <div className="space-y-6 text-lg text-on-surface-variant">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <span>Standard Booking Escrow</span>
              <span className="font-bold text-primary">$5.00</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <span>Platform Service Fee</span>
              <span className="font-bold text-primary">2.5%</span>
            </div>
            <div className="flex justify-between items-center pb-4 pt-4 mt-8 bg-secondary-container/20 px-6 rounded-2xl">
              <div>
                <span className="font-bold text-primary block text-xl">Kindred Premium</span>
                <span className="text-sm">Waives all booking & escrow fees</span>
              </div>
              <span className="font-black text-2xl text-primary">$23/mo</span>
            </div>
          </div>
        </section>

        <section className="bg-white p-10 rounded-3xl shadow-xl border border-outline-variant/10">
          <h2 className="text-3xl font-bold font-headline mb-4 text-primary">For Caregivers</h2>
          <div className="space-y-6 text-lg text-on-surface-variant">
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <span>Registration & Background Check</span>
              <span className="font-bold text-emerald-600 uppercase tracking-widest text-sm">Free</span>
            </div>
            <div className="flex justify-between items-center border-b border-outline-variant/10 pb-4">
              <span>Booking Match Commission</span>
              <span className="font-bold text-primary">15%</span>
            </div>
            <div className="flex justify-between items-center pb-4 pt-4 mt-8 bg-tertiary-container/20 px-6 rounded-2xl">
              <div>
                <span className="font-bold text-primary block text-xl">Optional Upgrades</span>
                <span className="text-sm">Featured Profile & Instant Payouts</span>
              </div>
              <span className="font-black text-xl text-primary">Starting at $1.99</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
