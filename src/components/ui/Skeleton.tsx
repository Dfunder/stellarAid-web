interface SkeletonProps {
  /** Width of the skeleton */
  width?: string | number
  /** Height of the skeleton */
  height?: string | number
  /** Border radius */
  radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'
  /** Additional CSS classes */
  className?: string
}

const RADIUS_CLASSES = {
  none: '',
  sm: 'rounded-sm',
  md: 'rounded-control',
  lg: 'rounded-card',
  full: 'rounded-full',
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  radius = 'md',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-line relative overflow-hidden ${RADIUS_CLASSES[radius]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
    </div>
  )
}

export function SkeletonText({ lines = 3, className = '', ...props }: { lines?: number; className?: string } & Omit<SkeletonProps, 'height'>) {
  return (
    <div className={`flex flex-col gap-2 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={props.height ?? '1rem'} width={i === lines - 1 ? '60%' : '100%'} radius={props.radius} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-card border border-line bg-surface p-6 shadow-card animate-pulse ${className}`} aria-hidden="true">
      <div className="flex items-start gap-4">
        <Skeleton width={80} height={80} radius="card" />
        <div className="flex-1 space-y-3">
          <Skeleton width="40%" height="1.25rem" radius="sm" />
          <Skeleton width="60%" height="1rem" radius="sm" />
          <Skeleton width="80%" height="1rem" radius="sm" />
          <Skeleton width="100%" height="1rem" radius="sm" />
        </div>
      </div>
    </div>
  )
}

export function SkeletonTableRow({ columns = 4, className = '' }: { columns?: number; className?: string }) {
  return (
    <tr className={`animate-pulse ${className}`} aria-hidden="true">
      {Array.from({ length: columns }, (_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height="1rem" width="80%" radius="sm" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonList({ items = 5, className = '' }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`} aria-hidden="true">
      {Array.from({ length: items }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}

export function SkeletonGrid({ columns = 3, rows = 2, className = '' }: { columns?: number; rows?: number; className?: string }) {
  return (
    <div className={`grid gap-6 ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }} aria-hidden="true">
      {Array.from({ length: columns * rows }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}