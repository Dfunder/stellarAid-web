import { describe, expect, it } from 'vitest'
import { formatDate, formatShortDate, shortAddress, truncateMiddle } from './format'

describe('truncateMiddle', () => {
  it('returns values at or below the truncation window unchanged', () => {
    expect(truncateMiddle('')).toBe('')
    expect(truncateMiddle('short')).toBe('short')
    // Exactly head (6) + tail (4) characters: nothing to cut.
    expect(truncateMiddle('1234567890')).toBe('1234567890')
  })

  it('keeps both ends of values longer than the window', () => {
    expect(truncateMiddle('ABCDEFGHIJK')).toBe('ABCDEF…HIJK')
    expect(truncateMiddle('ABCDEFGHIJKL')).toBe('ABCDEF…IJKL')
  })

  it('honours custom head and tail lengths', () => {
    expect(truncateMiddle('ABCDEFGHIJKL', 3, 2)).toBe('ABC…KL')
    // Window covers the whole value again, so nothing is cut.
    expect(truncateMiddle('ABCDE', 3, 2)).toBe('ABCDE')
  })
})

describe('formatDate', () => {
  it('formats a valid ISO date with the year', () => {
    expect(formatDate('2024-01-15T10:30:00.000Z')).toContain('2024')
  })

  it('lets callers override the default options', () => {
    const iso = '2024-01-15T10:30:00.000Z'
    const withLongMonth = formatDate(iso, { month: 'long' })
    expect(withLongMonth).toContain('2024')
    expect(withLongMonth).not.toBe(formatDate(iso))
  })

  it('returns a placeholder for an invalid date', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date')
    expect(formatDate('')).toBe('Invalid date')
  })
})

describe('formatShortDate', () => {
  it('formats a valid ISO date without a time component', () => {
    const formatted = formatShortDate('2024-01-15T10:30:00.000Z')
    expect(formatted).toContain('2024')
    expect(formatted).not.toContain(':')
  })

  it('returns a placeholder for an invalid date', () => {
    expect(formatShortDate('not-a-date')).toBe('Invalid date')
    expect(formatShortDate('')).toBe('Invalid date')
  })
})

describe('shortAddress', () => {
  it('keeps 10 leading and 8 trailing characters', () => {
    const key = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVW'
    expect(shortAddress(key)).toBe(`${key.slice(0, 10)}…${key.slice(-8)}`)
  })

  it('returns short values unchanged instead of overlapping', () => {
    expect(shortAddress('GABC')).toBe('GABC')
  })
})
