export default function DashboardLoading() {
  return (
    <div className="p-8 lg:p-12 animate-in fade-in duration-700 max-w-6xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="rounded-[2.5rem] bg-surface-container-low p-10 md:p-14 animate-pulse">
        <div className="h-10 w-2/3 bg-surface-container-high rounded-2xl mb-4" />
        <div className="h-6 w-1/2 bg-surface-container-high rounded-xl mb-8" />
        <div className="flex gap-4">
          <div className="h-12 w-32 bg-surface-container-high rounded-2xl" />
          <div className="h-12 w-32 bg-surface-container-high rounded-2xl" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-3xl p-8 animate-pulse">
              <div className="h-6 w-1/3 bg-surface-container-high rounded-xl mb-4" />
              <div className="h-4 w-2/3 bg-surface-container-high rounded-lg mb-2" />
              <div className="h-4 w-1/2 bg-surface-container-high rounded-lg" />
            </div>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-3xl p-8 h-48 animate-pulse">
              <div className="h-6 w-1/2 bg-surface-container-high rounded-xl mb-4" />
              <div className="h-4 w-full bg-surface-container-high rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
