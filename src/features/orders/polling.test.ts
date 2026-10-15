import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryObserver } from '@tanstack/react-query'
import { orderRefetchInterval } from './polling'

const confirming = { state: { data: { status: 'confirming' as const } } }
const confirmed = { state: { data: { status: 'confirmed' as const } } }
const noData = { state: { data: undefined } }

describe('orderRefetchInterval (#778)', () => {
  it('polls every 3s while the order is confirming', () => {
    expect(orderRefetchInterval(confirming)).toBe(3000)
  })

  it('stops polling once the order is confirmed or failed', () => {
    expect(orderRefetchInterval(confirmed)).toBe(false)
    expect(orderRefetchInterval({ state: { data: { status: 'failed' } } })).toBe(false)
  })

  it('does not poll before any data has loaded', () => {
    expect(orderRefetchInterval(noData)).toBe(false)
  })
})

describe('order polling driven by a live query observer (#778)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('refetches a confirming order on the 3s interval and stops at a terminal state', async () => {
    const queryFn = vi
      .fn<() => Promise<{ status: 'confirming' | 'confirmed' }>>()
      .mockResolvedValue({ status: 'confirming' })
    const client = new QueryClient()
    const observer = new QueryObserver(client, {
      queryKey: ['order-polling-test'],
      queryFn,
      refetchInterval: orderRefetchInterval,
    })

    const unsubscribe = observer.subscribe(() => {})

    // Initial fetch resolves with "confirming".
    await vi.advanceTimersByTimeAsync(0)
    expect(queryFn).toHaveBeenCalledTimes(1)

    // First interval tick: still confirming, so the interval re-arms.
    await vi.advanceTimersByTimeAsync(3000)
    expect(queryFn).toHaveBeenCalledTimes(2)

    // Order reaches a terminal state; the next tick observes it…
    queryFn.mockResolvedValue({ status: 'confirmed' })
    await vi.advanceTimersByTimeAsync(3000)
    expect(queryFn).toHaveBeenCalledTimes(3)

    // …and no further refetches happen while the terminal state stands.
    await vi.advanceTimersByTimeAsync(30000)
    expect(queryFn).toHaveBeenCalledTimes(3)

    unsubscribe()
    client.clear()
  })
})
