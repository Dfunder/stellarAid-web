import { describe, expect, it } from 'vitest'
import { runPooled } from './concurrency'

describe('runPooled', () => {
  it('never exceeds the concurrency limit', async () => {
    const tasks = Array.from({ length: 20 }, () => async () => {
      await new Promise<void>((resolve) => setTimeout(resolve, 5))
    })
    let maxInFlight = 0
    let inFlight = 0

    const wrapped = tasks.map((task) => async () => {
      inFlight += 1
      maxInFlight = Math.max(maxInFlight, inFlight)
      await task()
      inFlight -= 1
    })

    await runPooled(wrapped, 3)
    expect(maxInFlight).toBeLessThanOrEqual(3)
    expect(maxInFlight).toBe(3)
  })

  it('runs all tasks and preserves input order', async () => {
    const tasks = Array.from({ length: 7 }, (_, index) => async () => `${index}-done`)
    const outcomes = await runPooled(tasks, 3)

    expect(outcomes.map((o) => (o.ok ? o.value : 'error'))).toEqual([
      '0-done',
      '1-done',
      '2-done',
      '3-done',
      '4-done',
      '5-done',
      '6-done',
    ])
  })

  it('collects per-task failures without aborting the pool', async () => {
    const tasks = [
      async () => 'a',
      async () => {
        throw new Error('boom')
      },
      async () => 'c',
    ]

    const outcomes = await runPooled(tasks, 2)

    expect(outcomes.map((o) => (o.ok ? o.value : (o.error as Error).message))).toEqual([
      'a',
      'boom',
      'c',
    ])
  })

  it('handles empty input and rejects invalid limits', async () => {
    await expect(runPooled([], 3)).resolves.toEqual([])
    await expect(runPooled([async () => 1], 0)).rejects.toThrow('limit must be >= 1')
  }, 10000)

  it('starts a queued task the moment a slot frees up', async () => {
    const order: number[] = []
    let releaseSecond: (() => void) | undefined

    const tasks = [
      async () => {
        order.push(1)
        await new Promise<void>((resolve) => {
          setTimeout(() => {
            order.push(2)
            resolve()
          }, 5)
        })
      },
      async () => {
        order.push(3)
        await new Promise<void>((resolve) => {
          releaseSecond = resolve
        })
        order.push(4)
      },
      async () => {
        order.push(5)
      },
    ]

    const pending = runPooled(tasks, 1)
    await new Promise<void>((resolve) => setTimeout(resolve, 10))
    expect(order).toEqual([1, 2, 3])

    releaseSecond!()
    await pending

    expect(order).toEqual([1, 2, 3, 4, 5])
  })
})