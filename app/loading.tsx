import { Skeleton, SkeletonCard } from './components/ui/Skeleton';

export default function GlobalLoading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-gray-50 px-4 py-10 dark:bg-gray-950"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-3">
          <Skeleton width={280} height={32} />
          <Skeleton width={420} height={16} />
        </div>
        <SkeletonCard />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
