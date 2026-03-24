export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-surface-container-high" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-on-surface-variant text-xs font-black uppercase tracking-widest animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
