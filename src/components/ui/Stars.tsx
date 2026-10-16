const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

const SIZE_CLASSES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
} as const

export type StarsSize = keyof typeof SIZE_CLASSES

/** Rounds to the nearest half and clamps to `[0, 5]`, so 4.3 -> 4.5 and 7 -> 5. */
export function quantiseRating(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(Math.min(5, Math.max(0, value)) * 2) / 2
}

/** How lit star `index` (1-based) is for `value`: 0 (empty), 0.5 (half) or 1 (full). */
export function starFill(index: number, value: number): 0 | 0.5 | 1 {
  const lit = quantiseRating(value) - (index - 1)
  if (lit >= 1) return 1
  if (lit >= 0.5) return 0.5
  return 0
}

export interface StarIconProps {
  className?: string
  /** `true` paints the star with the current text colour; `false` draws only its outline. */
  filled?: boolean
}

/** A single star. The only copy of the star path in the app. */
export function StarIcon({ className = 'h-4 w-4', filled = true }: StarIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={filled ? undefined : 1.25}
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  )
}

export interface StarsProps {
  /** Rating from 0 to 5. Clamped and rounded to half-star precision. */
  value: number
  size?: StarsSize
  className?: string
}

/**
 * Read-only five-star rating. Only as many stars as the rating are filled; the rest are drawn as outlines, so the
 * rating is also readable without colour (WCAG 1.4.1). Exposed to assistive tech as one image with a text label.
 */
export default function Stars({ value, size = 'md', className = '' }: StarsProps) {
  const rounded = quantiseRating(value)
  const sizeClass = SIZE_CLASSES[size]

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rounded.toFixed(1)} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const fill = starFill(index, rounded)
        return (
          <span key={index} data-fill={fill} className={`relative inline-block ${sizeClass}`}>
            <StarIcon className={`absolute inset-0 ${sizeClass} text-line`} filled={false} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: fill === 1 ? '100%' : '50%' }}>
                <StarIcon className={`${sizeClass} text-gold`} />
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}
