import { describe, expect, it } from 'vitest'
import { clampIndex, getAdjacentIndices, normalizeImageList } from './MediaLightbox'

describe('media lightbox helpers', () => {
  it('normalizes empty and whitespace image lists', () => {
    expect(normalizeImageList([])).toEqual([])
    expect(normalizeImageList(['', '   ', 'https://example.com/one.png'])).toEqual(['https://example.com/one.png'])
  })

  it('keeps indexes within range for navigation', () => {
    expect(clampIndex(0, 3)).toBe(0)
    expect(clampIndex(10, 3)).toBe(2)
    expect(clampIndex(-4, 3)).toBe(0)
  })

  it('returns adjacent indexes for the current image', () => {
    expect(getAdjacentIndices(1, 4)).toEqual({ previous: 0, next: 2 })
    expect(getAdjacentIndices(0, 4)).toEqual({ previous: 3, next: 1 })
  })
})
