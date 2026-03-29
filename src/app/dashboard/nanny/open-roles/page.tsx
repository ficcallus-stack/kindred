import { getOpenJobs } from "./actions";
import JobBoard from "./JobBoard";

export default async function OpenRolesPage() {
  const initialJobs = await getOpenJobs({ limit: 10, offset: 0 });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Editorial Header Section */}
      <header className="mb-12">
        <h1 className="font-headline font-extrabold text-5xl md:text-6xl text-primary tracking-tighter mb-4 italic">Open Roles</h1>
        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl leading-relaxed font-medium">
          Discover bespoke opportunities with families who value premium care. Every role is curated to match your professional excellence.
        </p>
      </header>

      <JobBoard initialJobs={initialJobs} />
    </div>
  );
}
