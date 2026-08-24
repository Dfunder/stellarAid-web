import { Skeleton, SkeletonCard } from '../components/ui/Skeleton';

export default function ExploreLoading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950"
      aria-busy="true"
      aria-label="Loading explore page"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Skeleton width={240} height={36} />
          <Skeleton width={400} height={16} />
        </div>

        <SkeletonCard />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
