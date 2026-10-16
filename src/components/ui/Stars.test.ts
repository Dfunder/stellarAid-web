import { describe, expect, it } from 'vitest'
import { quantiseRating, starFill } from './Stars'

describe('quantiseRating', () => {
  it('rounds to the nearest half', () => {
    expect(quantiseRating(4.3)).toBe(4.5)
    expect(quantiseRating(4.2)).toBe(4)
  })

  it('clamps to [0, 5] and ignores non-finite input', () => {
    expect(quantiseRating(-2)).toBe(0)
    expect(quantiseRating(9)).toBe(5)
    expect(quantiseRating(Number.NaN)).toBe(0)
  })
})

describe('starFill', () => {
  const fills = (value: number) => [1, 2, 3, 4, 5].map((index) => starFill(index, value))

  it('lights a 1-star rating as one full star and four empty ones (not five)', () => {
    expect(fills(1)).toEqual([1, 0, 0, 0, 0])
  })

  it('renders 0 as all empty and 5 as all full', () => {
    expect(fills(0)).toEqual([0, 0, 0, 0, 0])
    expect(fills(5)).toEqual([1, 1, 1, 1, 1])
  })

  it('renders half stars', () => {
    expect(fills(3.5)).toEqual([1, 1, 1, 0.5, 0])
    expect(fills(4.3)).toEqual([1, 1, 1, 1, 0.5])
  })
})
