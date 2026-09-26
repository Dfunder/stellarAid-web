import { useMemo, useState } from 'react'
import { Skeleton } from '@/components/ui'
import type { ArtistProfileExtended } from '../types'
import type { Review } from '@/types'

export interface ProfileReviewsTabProps {
  profile: ArtistProfileExtended
}

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

/** Star fills are quantised to halves, so a rating never renders as a sliver. */
const STAR_STEPS = [0, 0.5, 1]

const STAR_SIZE_CLASSES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const

const RATING_SIZES = ['sm', 'md', 'lg'] as const
export type RatingSize = (typeof RATING_SIZES)[number]

export const REVIEW_SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'highest', label: 'Highest rated' },
  { value: 'lowest', label: 'Lowest rated' },
] as const
export type ReviewSort = (typeof REVIEW_SORT_OPTIONS)[number]['value']

const REVIEWS_PER_PAGE = 5
const LONG_REVIEW_CHARS = 280

/** Round to the nearest half so 4.3 -> 4.5 and 4.2 -> 4.0. */
function quantise(value: number): number {
  const clamped = Math.min(5, Math.max(0, value))
  return Math.round(clamped * 2) / 2
}

function starFill(index: number, value: number): string {
  // index is 1-based; how much of this star is lit.
  const lit = Math.min(1, Math.max(0, value - (index - 1)))
  const step = STAR_STEPS.reduce((best, s) => (Math.abs(s - lit) < Math.abs(best - lit) ? s : best))
  if (step === 0) return 'text-line'
  if (step === 1) return 'text-gold fill-current'
  return 'text-line'
}

export interface StarRatingProps {
  /** Raw average, e.g. 4.3. Rendered at half-star precision. */
  value: number
  size?: RatingSize
  /** Append the numeric average next to the stars. */
  showValue?: boolean
  /** Placeholder shown while the average is still unknown. */
  isLoading?: boolean
  className?: string
}

/**
 * Read-only star rating (#740).
 *
 * Fractional averages round to the nearest half so the same average always
 * renders identically wherever it is used. Sizes share one class map for the
 * same reason, and the numeric value is opt-in.
 */
export function StarRating({
  value,
  size = 'md',
  showValue = false,
  isLoading = false,
  className = '',
}: StarRatingProps) {
  if (isLoading) {
    // Reserve the same box as the loaded state so nothing shifts on arrival.
    return (
      <span className={`inline-flex items-center gap-1 ${className}`} aria-hidden="true">
        <Skeleton width={size === 'lg' ? '1.25rem' : '1rem'} height={size === 'lg' ? '1.25rem' : '1rem'} radius="full" />
        <Skeleton width="2rem" height="0.75rem" radius="full" />
      </span>
    )
  }

  const rounded = quantise(value)

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="inline-flex items-center gap-0.5" role="img" aria-label={`${rounded.toFixed(1)} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} className={`${STAR_SIZE_CLASSES[size]} ${starFill(i, rounded)}`} viewBox="0 0 20 20" aria-hidden="true">
            <path d={STAR_PATH} />
          </svg>
        ))}
      </span>
      {showValue && <span className="text-caption-sm font-bold text-foreground">{rounded.toFixed(1)}</span>}
    </span>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-caption-sm font-semibold text-success">
      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 1.5l2.2 1.6 2.7-.2.9 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.9 2.6-2.7-.2L10 18.5l-2.2-1.6-2.7.2-.9-2.6L2 12.9l1-2.5-1-2.5 2.2-1.6.9-2.6 2.7.2L10 1.5zm3.7 6.1a.8.8 0 00-1.2-1.06L9 10.2 7.7 8.9a.8.8 0 10-1.1 1.16l1.9 1.9a.8.8 0 001.2 0l4-3.86z"
          clipRule="evenodd"
        />
      </svg>
      Verified purchase
    </span>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.comment.length > LONG_REVIEW_CHARS

  return (
    <article className="flex flex-col gap-3 rounded-card border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-muted text-caption-sm font-bold text-foreground">
            {review.authorId.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-caption font-semibold text-foreground">{review.authorId}</p>
            <p className="text-caption-sm text-muted">
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <StarRating value={review.rating} size="sm" showValue />
      </div>

      {review.comment && (
        <div className="pl-11">
          <p className={`text-body text-foreground/90 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
            "{review.comment}"
          </p>
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="mt-1 text-caption-sm font-semibold text-primary hover:underline"
              aria-expanded={expanded}
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Only genuine purchases carry the verified flag. */}
      <div className="pl-11">
        <VerifiedBadge />
      </div>
    </article>
  )
}

export default function ProfileReviewsTab({ profile }: ProfileReviewsTabProps) {
  const reviews = profile.reviews || []
  const [sort, setSort] = useState<ReviewSort>('recent')
  const [page, setPage] = useState(1)

  const sorted = useMemo(() => {
    const copy = [...reviews]
    if (sort === 'highest') return copy.sort((a, b) => b.rating - a.rating)
    if (sort === 'lowest') return copy.sort((a, b) => a.rating - b.rating)
    return copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
  }, [reviews, sort])

  const pageCount = Math.max(1, Math.ceil(sorted.length / REVIEWS_PER_PAGE))
  const safePage = Math.min(page, pageCount)
  const visible = sorted.slice((safePage - 1) * REVIEWS_PER_PAGE, safePage * REVIEWS_PER_PAGE)

  function changeSort(next: ReviewSort) {
    setSort(next)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h3 font-bold text-foreground">Client Reviews & Testimonials</h2>
        <p className="text-body text-muted">
          Feedback from clients who completed commissions and purchases with {profile.displayName}.
        </p>
      </div>

      {/* Review summary header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-gold/15 text-gold">
            <span className="text-display font-bold">{profile.rating.toFixed(1)}</span>
          </div>
          <div>
            <StarRating value={profile.rating} size="lg" />
            <p className="mt-1 text-caption text-muted">
              Based on {profile.reviewCount} verified on-chain commission deliveries
            </p>
          </div>
        </div>

        {/* Sorting only applies once there is something to sort. */}
        {reviews.length > 1 && (
          <label className="flex items-center gap-2 text-caption text-muted">
            Sort by
            <select
              value={sort}
              onChange={(e) => changeSort(e.target.value as ReviewSort)}
              className="rounded-control border border-line bg-surface px-3 py-1.5 text-caption-sm text-foreground"
              aria-label="Sort reviews"
            >
              {REVIEW_SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-12 text-center">
          <p className="text-body font-semibold text-foreground">No reviews yet</p>
          <p className="mt-1 text-caption text-muted">
            Be the first client to complete a commission with this artist!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((rev) => (
            <ReviewCard key={rev.id} review={rev} />
          ))}

          {pageCount > 1 && (
            <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Reviews pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="rounded-control border border-line px-3 py-1.5 text-caption-sm font-semibold text-foreground disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-caption-sm text-muted">
                Page {safePage} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage === pageCount}
                className="rounded-control border border-line px-3 py-1.5 text-caption-sm font-semibold text-foreground disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}
