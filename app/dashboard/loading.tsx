import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Skeleton width={220} height={32} />
          <Skeleton width={360} height={16} />
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton width={90} height={12} />
              <Skeleton width={120} height={28} className="mt-3" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SkeletonCard className="lg:col-span-2" />
          <SkeletonCard />
        </div>
      </div>
    </main>
  );
}
