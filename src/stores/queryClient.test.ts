import { describe, expect, it } from 'vitest'
import { queryClient } from './queryClient'

describe('queryClient caching defaults', () => {
  it('raises the global staleTime to 5 minutes', () => {
    expect(queryClient.getDefaultOptions().queries?.staleTime).toBe(5 * 60_000)
  })

  it('does not refetch a query served from cache within staleTime', async () => {
    let calls = 0
    const queryFn = async (): Promise<number> => {
      calls += 1
      return 42
    }
    const key = ['test', 'cache-count']

    await queryClient.fetchQuery({ queryKey: key, queryFn })
    await queryClient.fetchQuery({ queryKey: key, queryFn })

    expect(calls).toBe(1)
    await queryClient.cancelQueries({ queryKey: key })
  })
})