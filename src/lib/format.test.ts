import { describe, expect, it } from 'vitest'
import { formatDate, formatShortDate, truncateMiddle } from './format'

describe('truncateMiddle', () => {
  it('returns the full value when it fits within head + tail', () => {
    expect(truncateMiddle('GC4PQ', 6, 4)).toBe('GC4PQ')
  })

  it('returns a value exactly at head + tail unchanged', () => {
    expect(truncateMiddle('GABC12WXYZ')).toBe('GABC12WXYZ')
  })

  it('truncates the middle of a long value', () => {
    expect(truncateMiddle('GABCDEF0123456789WXYZ')).toBe('GABCDE\u2026WXYZ')
  })

  it('honours custom head and tail lengths', () => {
    expect(truncateMiddle('GABCDEF0123456789WXYZ', 10, 8)).toBe('GABCDEF012\u20266789WXYZ')
  })

  it('never produces overlapping output for inputs shorter than head + tail', () => {
    expect(truncateMiddle('abcdefgh'.repeat(2), 18, 4)).toBe('abcdefghabcdefgh')
    expect(truncateMiddle('abc', 10, 8)).toBe('abc')
  })
})

describe('formatDate', () => {
  const iso = '2024-03-15T10:30:00Z'
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }

  it('renders the same text as toLocaleDateString with the documented defaults', () => {
    const expected = new Date(iso).toLocaleDateString(undefined, defaultOptions)
    expect(formatDate(iso)).toBe(expected)
  })

  it('forwards caller-provided options over the defaults', () => {
    const expected = new Date(iso).toLocaleDateString(undefined, {
      ...defaultOptions,
      year: '2-digit',
    })
    expect(formatDate(iso, { year: '2-digit' })).toBe(expected)
  })

  it('returns Invalid date for garbage input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date')
  })
})

describe('formatShortDate', () => {
  const iso = '2024-03-15T10:30:00Z'
  const shortOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }

  it('renders the same text as toLocaleDateString without time parts', () => {
    const expected = new Date(iso).toLocaleDateString(undefined, shortOptions)
    expect(formatShortDate(iso)).toBe(expected)
  })

  it('omits the time part', () => {
    expect(formatShortDate(iso)).not.toMatch(/\d{1,2}:\d{2}/)
  })

  it('returns Invalid date for garbage input', () => {
    expect(formatShortDate('nope')).toBe('Invalid date')
  })
})
