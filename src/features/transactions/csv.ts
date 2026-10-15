/**
 * Small CSV/sign helpers for the transaction export (#790).
 *
 * Money is a decimal string throughout the app, so sign detection inspects
 * the leading `-` and never calls `parseFloat`.
 */
export function isNegativeAmount(value: string): boolean {
  return value.trimStart().startsWith('-')
}

/**
 * Quotes one CSV cell: embedded quotes are doubled, CR/LF is folded away so
 * every row stays a single line, and a leading `=`, `+`, `-` or `@` is
 * prefixed with an apostrophe so spreadsheets never execute exported content.
 */
export function toCsvCell(value: string): string {
  const singleLine = value.replace(/\r?\n/g, ' ')
  const guarded = /^[=+\-@]/.test(singleLine) ? `'${singleLine}` : singleLine
  return `"${guarded.replace(/"/g, '""')}"`
}

/** Joins raw cell values into a CSV document (header row included by the caller). */
export function buildCsv(rows: string[][]): string {
  return rows.map((row) => row.map(toCsvCell).join(',')).join('\n')
}

/** Filesystem-safe export name: `transactions-YYYY-MM-DD.csv` (no spaces, commas or colons). */
export function csvFilename(now: Date = new Date()): string {
  return `transactions-${now.toISOString().slice(0, 10)}.csv`
}
