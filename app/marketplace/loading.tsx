import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';

export default function MarketplaceLoading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950"
      aria-busy="true"
      aria-label="Loading marketplace"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Skeleton width={260} height={36} />
          <Skeleton width={420} height={16} />
        </div>

        {/* Filter bar */}
        <Skeleton width="100%" height={48} rounded="rounded-xl" />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
