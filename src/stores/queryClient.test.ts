import { describe, expect, it } from 'vitest'
import { ApiError } from '@/services'
import { queryClient, shouldRetryQuery } from './queryClient'

describe('queryClient defaults (#855)', () => {
  it('caches for 5 minutes and leaves focus refetching off by default', () => {
    const defaults = queryClient.getDefaultOptions()
    expect(defaults.queries?.staleTime).toBe(5 * 60_000)
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false)
  })
})

describe('shouldRetryQuery', () => {
  it('never retries once the failure budget is spent', () => {
    expect(shouldRetryQuery(1, new Error('anything'))).toBe(false)
    expect(shouldRetryQuery(2, new ApiError(500, 'INTERNAL_ERROR', 'boom'))).toBe(false)
  })

  it('retries unknown errors once', () => {
    expect(shouldRetryQuery(0, new Error('network hiccup'))).toBe(true)
  })

  it('retries server and rate-limit errors, but not client errors', () => {
    const table: Array<[number, boolean]> = [
      [500, true],
      [502, true],
      [503, true],
      [429, true],
      [401, false],
      [403, false],
      [404, false],
      [422, false],
    ]

    for (const [status, expected] of table) {
      const error = new ApiError(status, 'CODE', 'message')
      expect(shouldRetryQuery(0, error), `status ${status}`).toBe(expected)
    }
  })

  it('retries transport errors that carry no status', () => {
    expect(shouldRetryQuery(0, new ApiError(null, 'NETWORK_ERROR', 'offline'))).toBe(true)
  })
})
