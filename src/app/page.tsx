import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MaterialIcon } from "@/components/MaterialIcon";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-surface font-body text-on-surface">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[850px] flex items-center overflow-hidden bg-surface">
          <div className="max-w-7xl mx-auto px-8 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="z-10 py-12">
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold text-primary leading-[1.1] mb-6">
                Bespoke Care for Your <span className="text-secondary italic">Little Ones</span>.
              </h1>
              <p className="text-on-surface-variant text-xl mb-10 max-w-lg leading-relaxed">
                Connecting elite families with the nation's most trusted, certified caregivers through an editorial-first experience.
              </p>
              
              {/* Primary Path Actions */}
              <div className="space-y-6">
                {/* Search by State/Area */}
                <div className="bg-surface-container-lowest p-2 rounded-2xl shadow-xl flex flex-col md:flex-row gap-2 max-w-2xl outline-variant/15 border border-outline-variant/15">
                  <div className="flex-1 flex items-center px-4 py-3 gap-3">
                    <MaterialIcon name="location_on" className="text-primary" />
                    <input
                      className="w-full border-none focus:ring-0 bg-transparent text-on-surface placeholder:text-on-surface-variant/60 font-medium"
                      placeholder="Search by State and Area (e.g. Austin, TX)"
                      type="text"
                    />
                  </div>
                  <button className="bg-secondary-container text-on-secondary-container px-8 py-4 rounded-xl font-bold text-lg hover:brightness-95 transition-all shadow-lg shadow-secondary-container/20">
                    Search
                  </button>
                </div>

                {/* Secondary Paths Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/browse"
                    className="flex-1 min-w-[200px] bg-primary text-white text-center py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="group" />
                    Browse All Nannies
                  </Link>
                  <Link
                    href="/register/nanny"
                    className="flex-1 min-w-[200px] bg-white border-2 border-primary text-primary text-center py-4 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                  >
                    <MaterialIcon name="person_add" />
                    Become a Nanny
                  </Link>
                </div>
              </div>
            </div>

            {/* Hero Image Integration */}
            <div className="relative h-[600px] hidden lg:block">
              <div className="absolute inset-0 bg-primary-container rounded-[3rem] rotate-3 translate-x-4 opacity-5"></div>
              <img
                alt="Nanny and child"
                className="absolute inset-0 w-full h-full object-contain z-20"
                src="https://lh3.googleusercontent.com/aida/ADBb0ui0tmMIY7ATManoT0OYoIHO7QeRF1eNSu7GhgmbmyuvVdPV9eWtC-VcpWcUalJCZCM2-3PCMma5Q7acjk-YG4QPgpuwVkPGIyAXwp6wLeDvhwzui9AK9kyg3LABDhaJhnNTfr44EuhcoHUJeVSx87ra07-H8x6TKuekZEvdO1hxc-XHb_GQZX5lgRD1MRHskbUQgpTrY3puv-EVt4s3YGwD8KrFlbRy8evqeVUJokBCiPlLocq1LKDsplZUEDGcIUeOvZ2KU7xbsw"
              />
              <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-6 rounded-2xl shadow-xl z-30 flex items-center gap-4 border border-outline-variant/10">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center">
                  <MaterialIcon name="verified_user" className="text-on-tertiary-fixed" fill />
                </div>
                <div>
                  <p className="text-sm font-bold text-primary">100% Background Checked</p>
                  <p className="text-xs text-on-surface-variant">Safety is our absolute priority</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="bg-surface-container-low py-12">
          <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-wrap items-center justify-between gap-8 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="flex items-center gap-2 font-headline font-bold text-xl text-primary">
                <MaterialIcon name="star" fill />
                <span>10,000+ Happy Families</span>
              </div>
              <div className="flex gap-12 items-center overflow-x-auto no-scrollbar">
                <span className="font-bold text-lg tracking-widest uppercase">TRUSTE</span>
                <span className="font-bold text-lg tracking-widest uppercase italic">The New York Times</span>
                <span className="font-bold text-lg tracking-widest uppercase">SafetyFirst</span>
                <span className="font-bold text-lg tracking-widest uppercase">CareCert</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA / Paths Section */}
        <section className="py-24 bg-surface max-w-7xl mx-auto px-8">
          <div className="bg-primary-container rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-container rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
              <div className="lg:w-1/2 text-center lg:text-left">
                <h2 className="font-headline text-4xl lg:text-5xl font-bold text-white mb-6">
                  Ready to find your match?
                </h2>
                <p className="text-on-primary-container text-lg leading-relaxed max-w-md">
                  Whether you're looking for the perfect nanny or looking to share your passion for childcare, we're here to help.
                </p>
              </div>
              <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                {/* Path 1 */}
                <div className="bg-surface-container-lowest p-8 rounded-3xl flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                  <MaterialIcon name="family_restroom" className="text-4xl text-primary mb-4" />
                  <h3 className="font-headline text-lg font-bold text-primary mb-2">I am looking for a Nanny</h3>
                  <p className="text-xs text-on-surface-variant mb-4">Browse all nannies or search by state.</p>
                  <Link href="/browse" className="mt-auto w-full bg-primary text-white py-3 rounded-xl font-bold shadow-md hover:brightness-110 text-center">
                    Find Care
                  </Link>
                </div>
                {/* Path 2 */}
                <div className="bg-secondary-fixed-dim p-8 rounded-3xl flex flex-col items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                  <MaterialIcon name="work" className="text-4xl text-on-secondary-fixed mb-4" />
                  <h3 className="font-headline text-lg font-bold text-on-secondary-fixed mb-2">
                    I am a Nanny looking for work
                  </h3>
                  <p className="text-xs text-on-secondary-fixed/70 mb-4">Create your profile and start applying.</p>
                  <Link href="/register/nanny" className="mt-auto w-full bg-on-secondary-fixed text-white py-3 rounded-xl font-bold shadow-md hover:brightness-110 text-center">
                    Apply Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
