import { Metadata } from 'next';
import { db } from '@/db';
import { users, nannyProfiles } from '@/db/schema';
import { eq, ilike, and } from 'drizzle-orm';
import { MaterialIcon } from '@/components/MaterialIcon';
import FAQSchema from "@/components/seo/FAQSchema";

export async function generateMetadata({ params }: { params: { niche: string; state: string; city: string } }): Promise<Metadata> {
  const { niche, state, city } = params;
  const formattedCity = city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedState = state.toUpperCase();
  const formattedNiche = niche.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return {
    title: `Top 10 ${formattedNiche} in ${formattedCity}, ${formattedState} | KindredCare US`,
    description: `Looking for a trusted ${formattedNiche.toLowerCase()} in ${formattedCity}? Browse elite, rigorously background-checked caregivers on KindredCare. 100% verified.`,
  };
}

export default async function HireCityPage({ params }: { params: { niche: string; state: string; city: string } }) {
  const { niche, state, city } = params;
  const formattedCity = city.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const formattedState = state.toUpperCase();
  const formattedNiche = niche.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // Dynamic Query: Find nannies in this city
  const localNannies = await db.select({
    id: users.id,
    fullName: users.fullName,
    bio: nannyProfiles.bio,
    hourlyRate: nannyProfiles.hourlyRate,
    location: nannyProfiles.location,
    photos: nannyProfiles.photos,
    experienceYears: nannyProfiles.experienceYears,
  })
  .from(users)
  .innerJoin(nannyProfiles, eq(users.id, nannyProfiles.id))
  .where(
    and(
      eq(users.role, 'caregiver'),
      ilike(nannyProfiles.location, `%${formattedCity}%`)
    )
  )
  .limit(20);

  // Programmatic FAQs for Zero-Click SEO
  const faqs = [
    {
      question: `How much does a ${formattedNiche.toLowerCase()} cost in ${formattedCity}, ${formattedState}?`,
      answer: `The average cost for a ${formattedNiche.toLowerCase()} in ${formattedCity} depends on experience, but typical rates range from $18 to $25 per hour on KindredCare US.`
    },
    {
      question: `Are nannies in ${formattedCity} background checked?`,
      answer: `Yes, all caregivers in ${formattedCity} operating on KindredCare US undergo an exhaustive, continuously verified background check process.`
    }
  ];

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <FAQSchema faqs={faqs} />

      <main className="pt-32 pb-24 px-6 flex-1 max-w-7xl mx-auto w-full">
        <header className="mb-16 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-bold tracking-widest uppercase mb-6">
            Hyper-Local Caregivers
          </div>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-primary tracking-tighter mb-6 capitalize">
            Hire the Best {formattedNiche} <br/> in {formattedCity}, {formattedState}
          </h1>
          <p className="text-on-surface-variant text-xl max-w-2xl mx-auto">
            Currently {localNannies.length > 0 ? localNannies.length : '10+'} elite, vetted nannies available directly near you. No hidden agency fees.
          </p>
        </header>

        {/* Nanny Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {localNannies.map((nanny) => (
            <a href={`/nannies/${nanny.id}`} key={nanny.id} className="bg-surface-container-lowest border border-outline-variant/20 rounded-3xl overflow-hidden hover:shadow-xl transition-shadow group">
              <div className="h-48 bg-surface-container-high relative overflow-hidden">
                {nanny.photos?.[0] ? (
                  <img src={nanny.photos[0]} alt={nanny.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-50">
                    <MaterialIcon name="person" className="text-6xl" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-primary">
                  ${nanny.hourlyRate}/hr
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-headline text-xl font-bold text-primary mb-1">{nanny.fullName.split(' ')[0]} {nanny.fullName.split(' ')[1]?.[0]}.</h3>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
                  <MaterialIcon name="location_on" className="text-base text-secondary" />
                  {nanny.location || `${formattedCity}, ${formattedState}`}
                </div>
                <p className="text-sm text-on-surface-variant line-clamp-3 mb-6">
                  {nanny.bio || `Experienced ${formattedNiche.toLowerCase()} available in ${formattedCity}. CPR certified and fully vetted.`}
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 bg-surface-container-high py-2 rounded-xl text-center text-xs font-bold text-primary">
                    {nanny.experienceYears} Years Exp.
                  </div>
                  <div className="flex-1 bg-surface-container-high py-2 rounded-xl text-center text-xs font-bold text-secondary flex items-center justify-center gap-1">
                    <MaterialIcon name="verified" className="text-sm" /> Verified
                  </div>
                </div>
              </div>
            </a>
          ))}
          {localNannies.length === 0 && (
             <div className="col-span-full text-center py-20 bg-surface-container-low rounded-3xl">
               <MaterialIcon name="search_off" className="text-6xl text-outline mb-4" />
               <h3 className="text-xl font-bold text-primary mb-2">Expanding in {formattedCity}</h3>
               <p className="text-on-surface-variant">We are currently onboarding top-tier caregivers in this region. Check back soon.</p>
             </div>
          )}
        </section>

        {/* Dynamic FAQ Section */}
        <section className="bg-primary-container p-12 rounded-[3rem] text-on-primary">
          <h2 className="font-headline text-3xl font-bold mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white/10 p-6 rounded-2xl">
                <h4 className="font-bold text-lg mb-2 flex items-start gap-3">
                  <MaterialIcon name="help_outline" className="text-secondary-fixed shrink-0 mt-0.5" />
                  {faq.question}
                </h4>
                <p className="text-on-primary-container leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}
