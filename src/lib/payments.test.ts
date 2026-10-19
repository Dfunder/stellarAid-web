import { describe, expect, it } from 'vitest'
import { amountsMatch, isPositiveAmount, normalizeAmount, parseAmountLabel } from './payments'

describe('normalizeAmount', () => {
  it('normalises equivalent decimal strings', () => {
    expect(normalizeAmount('10')).toBe('10')
    expect(normalizeAmount('10.0')).toBe('10')
    expect(normalizeAmount('010.00')).toBe('10')
    expect(normalizeAmount(' 1,000.500 ')).toBe('1000.5')
  })

  it('keeps significant decimals and signs', () => {
    expect(normalizeAmount('0.0001')).toBe('0.0001')
    expect(normalizeAmount('-2.50')).toBe('-2.5')
    expect(normalizeAmount('-0.0')).toBe('0')
  })

  it('rejects non-decimal input', () => {
    expect(normalizeAmount('')).toBeNull()
    expect(normalizeAmount('ten')).toBeNull()
    expect(normalizeAmount('1e3')).toBeNull()
    expect(normalizeAmount('1.2.3')).toBeNull()
    expect(normalizeAmount('$10')).toBeNull()
  })
})

describe('amountsMatch', () => {
  it('matches equivalent amounts exactly', () => {
    expect(amountsMatch('10', '10.00')).toBe(true)
    expect(amountsMatch('10.00', '10.0')).toBe(true)
  })

  it('does not match different or invalid amounts', () => {
    expect(amountsMatch('10', '10.01')).toBe(false)
    expect(amountsMatch('10', 'nope')).toBe(false)
  })
})

describe('isPositiveAmount', () => {
  it('accepts only amounts greater than zero', () => {
    expect(isPositiveAmount('0.01')).toBe(true)
    expect(isPositiveAmount('10')).toBe(true)
    expect(isPositiveAmount('0')).toBe(false)
    expect(isPositiveAmount('-1')).toBe(false)
    expect(isPositiveAmount('')).toBe(false)
  })
})

describe('parseAmountLabel', () => {
  it('parses an amount and asset', () => {
    expect(parseAmountLabel('10 XLM')).toEqual({ amount: '10', asset: 'XLM' })
    expect(parseAmountLabel('12.50 usdc')).toEqual({ amount: '12.5', asset: 'usdc' })
  })

  it('returns null when the label has no unambiguous amount', () => {
    expect(parseAmountLabel('due soon')).toBeNull()
    expect(parseAmountLabel('')).toBeNull()
  })
})
