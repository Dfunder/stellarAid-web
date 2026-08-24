import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';

export default function CommissionsLoading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950"
      aria-busy="true"
      aria-label="Loading commissions"
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-3">
          <Skeleton width={200} height={28} />
          <Skeleton width={320} height={16} />
        </div>

        {/* Summary tiles */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton width={70} height={10} />
              <Skeleton width={110} height={22} className="mt-2" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
