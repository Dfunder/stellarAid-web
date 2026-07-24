import { clsx } from 'clsx';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  rounded?: string;
  className?: string;
}

export function Skeleton({ width, height, rounded = 'rounded-lg', className }: SkeletonProps) {
  return (
    <div
      className={clsx('animate-pulse bg-neutral-200 dark:bg-neutral-700', rounded, className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={clsx('space-y-3 p-4 rounded-xl border border-neutral-200 dark:border-neutral-700', className)}>
      <Skeleton width="100%" height={20} rounded="rounded" />
      <Skeleton width="75%" height={14} rounded="rounded" />
      <Skeleton width="50%" height={14} rounded="rounded" />
    </div>
  );
}
