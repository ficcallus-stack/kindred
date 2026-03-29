import { getUsers } from "../actions";
import CaregiversClient from "./CaregiversClient";

export default async function CaregiversPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string; role?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = params.search || "";
  const role = params.role || "";

  const data = await getUsers(page, search, role);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-3xl font-headline font-extrabold text-[#031f41] tracking-tight italic">User Management</h2>
          <p className="text-slate-500 mt-1 italic">Review, monitor, and manage roles for the Curated Caregiver community.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-[#031f41] text-xs uppercase tracking-widest hover:bg-white transition-colors">Export CSV</button>
          <button className="px-5 py-2.5 rounded-xl bg-gradient-to-br from-[#031f41] to-[#1d3557] text-white font-bold text-xs uppercase tracking-widest shadow-md shadow-[#031f41]/10 hover:opacity-90 transition-all flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">person_add</span>
            Add New User
          </button>
        </div>
      </div>

      <CaregiversClient initialData={data} search={search} role={role} page={page} />
    </div>
  );
}
