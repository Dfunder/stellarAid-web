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
    expect(getAdjacentIndices(0, 4)).toEqual({ previous: 0, next: 1 })
    expect(getAdjacentIndices(3, 4)).toEqual({ previous: 2, next: 3 })
  })

  it('clamps instead of wrapping, matching how navigation moves', () => {
    // Navigation goes through clampIndex too, so the first and last image
    // are endpoints rather than a loop. getAdjacentIndices only picks which
    // neighbours to preload, so it has to agree with that.
    expect(getAdjacentIndices(0, 0)).toEqual({ previous: 0, next: 0 })
  })
})
