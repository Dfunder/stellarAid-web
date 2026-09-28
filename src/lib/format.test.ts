import { describe, it, expect } from 'vitest'
import { formatDate, formatShortDate, truncateMiddle } from './format'

describe('truncateMiddle', () => {
  it('returns short inputs unchanged (no overlapping output)', () => {
    expect(truncateMiddle('abc')).toBe('abc')
    expect(truncateMiddle('1234567890')).toBe('1234567890')
  })

  it('returns the value unchanged at the head+tail boundary', () => {
    expect(truncateMiddle('1234567890')).toHaveLength(10)
    expect(truncateMiddle('1234567890')).toBe('1234567890')
  })

  it('truncates long inputs with an ellipsis between the ends', () => {
    expect(truncateMiddle('GABC12WXYZ89LMNOP')).toBe('GABC12\u2026MNOP')
  })

  it('respects custom head and tail lengths', () => {
    expect(truncateMiddle('GABC12WXYZ89LMNOP', 4, 3)).toBe('GABC\u2026NOP')
  })

  it('uses DEFAULT_HEAD_LENGTH=6 and DEFAULT_TAIL_LENGTH=4', () => {
    const truncated = truncateMiddle('GABCDEFGHIJKLMNOPQRSTUVWXYZ01')
    expect(truncated.startsWith('GABCDE')).toBe(true)
    expect(truncated.endsWith('YZ01')).toBe(true)
    expect(truncated).toHaveLength(11)
    expect(truncated).toBe('GABCDE\u2026YZ01')
  })

  it('handles empty strings', () => {
    expect(truncateMiddle('')).toBe('')
  })
})

describe('formatDate', () => {
  it('returns "Invalid date" for malformed input', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date')
  })

  it('formats a valid ISO date', () => {
    expect(formatDate('2026-09-28T12:00:00Z')).not.toBe('Invalid date')
  })
})

describe('formatShortDate', () => {
  it('returns "Invalid date" for malformed input', () => {
    expect(formatShortDate('nope')).toBe('Invalid date')
  })

  it('formats a valid ISO date', () => {
    expect(formatShortDate('2026-09-28T12:00:00Z')).not.toBe('Invalid date')
  })
})