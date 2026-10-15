import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { paymentResultRefetchInterval, txStatusRefetchInterval } from './polling'

describe('paymentResultRefetchInterval (#778)', () => {
  it('keeps polling until the payment result is successful', () => {
    expect(paymentResultRefetchInterval({ state: { data: undefined } })).toBe(5000)
    expect(paymentResultRefetchInterval({ state: { data: { status: 'failed' } } })).toBe(5000)
    expect(paymentResultRefetchInterval({ state: { data: { status: 'success' } } })).toBe(false)
  })
})

describe('txStatusRefetchInterval (#778)', () => {
  const START = 1_700_000_000_000

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(START)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('uses the base interval before the first payload arrives', () => {
    expect(txStatusRefetchInterval({ state: { data: undefined } }, 3000, START)).toBe(3000)
  })

  it('stops polling at a terminal transaction status', () => {
    expect(
      txStatusRefetchInterval({ state: { data: { status: 'confirmed' } } }, 3000, START)
    ).toBe(false)
    expect(
      txStatusRefetchInterval({ state: { data: { status: 'failed' } } }, 3000, START)
    ).toBe(false)
  })

  it('backs off exponentially while the transaction is still pending', () => {
    const pending = { state: { data: { status: 'confirming' as const } } }

    // t+0s: 3s
    expect(txStatusRefetchInterval(pending, 3000, START)).toBe(3000)

    vi.setSystemTime(START + 15_000)
    // t+15s: 6s
    expect(txStatusRefetchInterval(pending, 3000, START)).toBe(6000)

    vi.setSystemTime(START + 30_000)
    // t+30s: 12s
    expect(txStatusRefetchInterval(pending, 3000, START)).toBe(12_000)

    vi.setSystemTime(START + 45_000)
    // t+45s: 24s
    expect(txStatusRefetchInterval(pending, 3000, START)).toBe(24_000)

    vi.setSystemTime(START + 60_000)
    // t+60s: 48s would exceed the 30s cap
    expect(txStatusRefetchInterval(pending, 3000, START)).toBe(30_000)
  })
})
