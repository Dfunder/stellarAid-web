import { QueryClient } from '@tanstack/react-query'
import { isApiError } from '@/services'

/** Client errors are never worth retrying; everything else gets one more try. */
function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= 1) return false
  if (!isApiError(error)) return true
  return error.status === null || error.status >= 500 || error.status === 429
}

/**
 * Single React Query client for the app.
 *
 * It is created at module scope (rather than inside a component) so imperative
 * code - notably the logout flow - can clear the cache without a React handle.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
})

/** Mutation convention: invalidate through a feature factory key, never a string literal. */
export function invalidateQueriesFor(queryKey: readonly unknown[]): Promise<void> {
  return queryClient.invalidateQueries({ queryKey })
}
