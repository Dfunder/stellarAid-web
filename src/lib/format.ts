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
 * Standard display form for Stellar addresses and transaction hashes (10 leading and 8 trailing characters), so
 * the same value renders identically on every screen.
 */
export function shortAddress(value: string): string {
  return truncateMiddle(value, 10, 8)
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

/**
 * Returns true when a decimal money string represents a negative amount.
 * Money is a decimal string throughout the app, so we inspect the leading
 * sign character rather than coercing with `parseFloat`.
 */
export function isNegativeAmount(value: string): boolean {
  return value.trim().startsWith('-')
}

/**
 * Escapes a single value for safe inclusion in a CSV cell:
 * - strips CR/LF so a value cannot break onto a new row,
 * - prefixes formula-leading characters (`= + - @`) with `'` to defuse
 *   CSV/formula injection in spreadsheet apps,
 * - doubles embedded quotes and wraps the result in quotes.
 */
export function escapeCsvCell(value: unknown): string {
  let cell = String(value ?? '').replace(/[\r\n]+/g, ' ')
  if (/^[=+\-@]/.test(cell)) cell = `'${cell}`
  return `"${cell.replace(/"/g, '""')}"`
}

/**
 * Builds a CSV document (CRLF line endings, as Excel expects) from a 2D
 * array of cells, escaping each cell with {@link escapeCsvCell}.
 */
export function buildCsv(rows: unknown[][]): string {
  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
}