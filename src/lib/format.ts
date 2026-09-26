const DEFAULT_HEAD_LENGTH = 6
const DEFAULT_TAIL_LENGTH = 4
const ELLIPSIS = '\u2026'

/**
 * Shortens a long identifier for display by keeping both ends, e.g. a Stellar
 * public key becomes `GABC12\u2026WXYZ89`.
 */
export function truncateMiddle(
  value: string,
  headLength: number = DEFAULT_HEAD_LENGTH,
  tailLength: number = DEFAULT_TAIL_LENGTH,
): string {
  if (value.length <= headLength + tailLength) return value
  return `${value.slice(0, headLength)}${ELLIPSIS}${value.slice(value.length - tailLength)}`
}

/**
 * Formats an ISO date string to a readable format.
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    ...options,
  })
}

/**
 * Formats an ISO date string to a short date format.
 */
export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Invalid date'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}