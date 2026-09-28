import { afterEach, describe, expect, it, vi } from 'vitest'
import { throttleLatest } from './throttle'

afterEach(() => {
  vi.useRealTimers()
})

describe('throttleLatest', () => {
  it('runs the first call immediately and coalesces calls within the window', () => {
    vi.useFakeTimers()
    const calls: number[] = []
    const throttled = throttleLatest((value: number) => calls.push(value), 250)

    throttled(1)
    throttled(2)
    throttled(3)
    throttled(4)

    expect(calls).toEqual([1])

    vi.advanceTimersByTime(250)
    expect(calls).toEqual([1, 4])

    vi.advanceTimersByTime(300)
    expect(calls).toEqual([1, 4])
  })

  it('keeps the call rate bounded even under rapid input', () => {
    vi.useFakeTimers()
    const calls: number[] = []
    const throttled = throttleLatest((value: number) => calls.push(value), 250)

    for (let value = 1; value <= 40; value += 1) {
      throttled(value)
      vi.advanceTimersByTime(25)
    }

    expect(calls.length).toBeLessThanOrEqual(5)
    expect(calls[calls.length - 1]).toBe(40)
  })

  it('preserves the trailing value after activity stops', () => {
    vi.useFakeTimers()
    const calls: number[] = []
    const throttled = throttleLatest((value: number) => calls.push(value), 200)

    throttled(10)
    vi.advanceTimersByTime(100)
    throttled(20)
    vi.advanceTimersByTime(150)

    expect(calls).toEqual([10, 20])
  })

  it('cancel drops a pending trailing call', () => {
    vi.useFakeTimers()
    const calls: number[] = []
    const throttled = throttleLatest((value: number) => calls.push(value), 200)

    throttled(1)
    vi.advanceTimersByTime(100)
    throttled(2)
    throttled.cancel()
    vi.advanceTimersByTime(500)

    expect(calls).toEqual([1])
  })
})