import { describe, expect, it } from 'vitest'
import { truncateMiddle } from './format'

describe('truncateMiddle', () => {
  it('returns the full value when it fits within head + tail', () => {
    expect(truncateMiddle('GC4PQ', 6, 4)).toBe('GC4PQ')
  })

  it('returns short Stellar keys unchanged', () => {
    expect(truncateMiddle('GABC12WXYZ89')).toBe('GABC12WXYZ89')
  })

  it('truncates the middle of a long value', () => {
    expect(truncateMiddle('GABCDEF0123456789WXYZ')).toBe('GABCDE\u2026WXYZ')
  })

  it('honours custom head and tail lengths', () => {
    expect(truncateMiddle('GABCDEF0123456789WXYZ', 10, 8)).toBe('GABCDEF012\u2026FG0123WXYZ')
  })

  it('never produces overlapping output for inputs shorter than head + tail', () => {
    expect(truncateMiddle('abcdefgh'.repeat(2), 18, 4)).toBe('abcdefghabcdefgh')
    expect(truncateMiddle('abc', 10, 8)).toBe('abc')
  })
})