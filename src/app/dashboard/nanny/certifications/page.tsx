import { MaterialIcon } from "@/components/MaterialIcon";

export default function CertificationsPage() {
  return (
    <>
      {/* Hero Section: Intentional Asymmetry */}
      <section className="relative mb-16">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="lg:w-3/5 z-10">
            <nav className="flex gap-2 items-center mb-6 text-sm font-medium text-on-surface-variant">
              <span>Certifications</span>
              <MaterialIcon name="chevron_right" className="text-sm" />
              <span className="text-primary">Global Standards</span>
            </nav>
            <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary leading-tight tracking-tight mb-6">
              Elevate Your Care to <span className="text-secondary italic">Global Standards</span>
            </h1>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8 max-w-2xl">
              Join our elite intensive program designed to refine your professional practice. Transition from a local caregiver to an internationally certified household management expert.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                className="px-8 py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95 text-center"
                href="#enrollment-options"
              >
                View Enrollment Options
              </a>
              <button className="px-8 py-4 bg-white text-primary font-bold rounded-xl border border-outline-variant/30 hover:bg-surface-container-low transition-all">
                Download Syllabus
              </button>
            </div>
          </div>
          <div className="lg:w-2/5 relative">
            <div className="relative w-full aspect-[4/5] asymmetric-clip overflow-hidden shadow-2xl z-0">
              <img
                alt="Professional caregiver smiling"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIhxOyq2kkWWMCOhnVJHAMIDv0X3eCxYlNX5tA2wfW9pSP6PFLm5O5HBy79QR8JoUdhRE1mCRkaqk4a9FATVZtSf8UFsMhxZtmH7fDxYez6dKR_kN6DEJjdSwF17RnESBCW-6TYAhFlYEizVisWImZD1xokwpCIdKp2hOeycz4E4rz2dDj39i6QmDbFwR8iptnlo9qGz4vMueAkPnincSGwnssKXNcs08XNtsQhHIH3SpAnJ6M-z1wUtvOlJLG6rsrbkl_38E-rdw"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-tertiary-fixed rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xl border-4 border-white">
              <MaterialIcon name="workspace_premium" className="text-5xl text-on-tertiary-fixed mb-2" fill />
              <span className="text-xs font-bold uppercase tracking-widest text-on-tertiary-fixed leading-tight">Global Care Badge</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enrollment Options: Pricing Paths */}
      <section className="mb-20" id="enrollment-options">
        <div className="flex flex-col items-center mb-10 text-center">
          <h2 className="font-headline text-3xl font-extrabold text-primary mb-2">Professional Pathways</h2>
          <p className="text-on-surface-variant">Choose the enrollment level that fits your career goals</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col justify-between hover:border-outline transition-colors">
            <div>
              <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center mb-6">
                <MaterialIcon name="how_to_reg" className="text-primary" />
              </div>
              <h3 className="font-headline text-xl font-bold text-primary mb-2">Registration Fee</h3>
              <div className="text-4xl font-extrabold mb-4 text-primary font-headline">$65</div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Required for all active caregivers. Covers essential background check and professional onboarding.
              </p>
            </div>
            <button className="w-full py-4 bg-surface-container text-primary font-bold rounded-xl hover:bg-surface-container-high transition-all">
              Pay Fee Only
            </button>
          </div>

          <div className="bg-primary text-on-primary p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden md:scale-105 z-10">
            <div className="absolute top-4 right-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Best Value
            </div>
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
                <MaterialIcon name="stars" className="text-white" fill />
              </div>
              <h3 className="font-headline text-xl font-bold mb-2">Elite Bundle</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold font-headline">$209</span>
                <span className="text-on-primary/60 line-through text-sm font-bold">$240</span>
              </div>
              <p className="text-on-primary/80 text-sm leading-relaxed mb-6">
                Complete your professional profile. Includes Registration Fee ($65) and the Global Care Program ($175), saving you $31.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-xs font-medium">
                  <MaterialIcon name="check_circle" className="text-secondary text-sm" fill />
                  Background Check & Identity Verification
                </li>
                <li className="flex items-center gap-2 text-xs font-medium">
                  <MaterialIcon name="check_circle" className="text-secondary text-sm" fill />
                  2-Week Global Standards Training
                </li>
                <li className="flex items-center gap-2 text-xs font-medium">
                  <MaterialIcon name="check_circle" className="text-secondary text-sm" fill />
                  Professional 'Global Care' Badge
                </li>
              </ul>
            </div>
            <button className="w-full py-4 bg-white text-primary font-bold rounded-xl hover:bg-on-primary/90 transition-all flex items-center justify-center gap-2">
              Enroll in Elite Bundle <MaterialIcon name="arrow_forward" className="text-sm" />
            </button>
          </div>

          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col justify-between hover:border-outline transition-colors">
            <div>
              <div className="w-12 h-12 bg-surface-container rounded-xl flex items-center justify-center mb-6">
                <MaterialIcon name="school" className="text-primary" />
              </div>
              <h3 className="font-headline text-xl font-bold text-primary mb-2">Standards Program</h3>
              <div className="text-4xl font-extrabold mb-4 text-primary font-headline">$175</div>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                Standalone 2-week intensive certification. Does not include the mandatory registration/background check fee.
              </p>
            </div>
            <button className="w-full py-4 bg-surface-container text-primary font-bold rounded-xl hover:bg-surface-container-high transition-all">
              Enroll in Program
            </button>
          </div>
        </div>
      </section>

      {/* Benefits Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-3xl shadow-sm flex flex-col md:flex-row gap-8 items-center border border-outline-variant/5">
          <div className="w-32 h-32 flex-shrink-0 bg-primary/5 rounded-full flex items-center justify-center border-2 border-dashed border-primary/20">
            <MaterialIcon name="verified" className="text-6xl text-primary" fill />
          </div>
          <div>
            <h3 className="font-headline text-2xl font-bold text-primary mb-3">The Professional Advantage</h3>
            <p className="text-on-surface-variant leading-relaxed">
              Instantly build trust with a permanent certification badge displayed on your public profile. Certified caregivers receive 3x more inquiries from high-net-worth families.
            </p>
          </div>
        </div>
        <div className="bg-surface-container-low p-8 rounded-3xl">
          <MaterialIcon name="visibility" className="text-secondary text-4xl mb-4" />
          <h4 className="font-headline text-xl font-bold text-primary mb-2">Visibility</h4>
          <p className="text-on-surface-variant text-sm">Priority placement in search results for families filtering by 'Expert'.</p>
        </div>
      </div>

      {/* Curriculum */}
      <section className="mb-20">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="font-headline text-3xl font-extrabold text-primary mb-4">The 2-Week Journey</h2>
          <div className="w-20 h-1 bg-secondary rounded-full"></div>
        </div>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border-l-8 border-primary flex gap-8 items-start">
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-xs font-bold uppercase text-primary">Week</span>
              <span className="text-4xl font-black text-primary">01</span>
            </div>
            <div className="flex-grow">
              <h3 className="font-headline text-xl font-bold text-primary mb-3">Advanced Development</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {["Pediatric First Aid", "Cognitive Milestones", "Nutritional Planning", "Conflict Resolution"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-on-surface-variant text-sm">
                    <MaterialIcon name="check_circle" className="text-secondary text-lg" fill />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
