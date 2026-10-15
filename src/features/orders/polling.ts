/**
 * Polling decisions for the order confirmation screen (#778).
 *
 * react-query v5 passes the `Query` object to the `refetchInterval`
 * callback — not the data. Reading `.status` off the query itself always
 * yielded `undefined`, so the interval never engaged and a "confirming"
 * order sat on screen until a manual reload.
 */

interface RefetchableQuery<T> {
  state: { data?: T }
}

export function orderRefetchInterval(
  query: RefetchableQuery<{ status: 'confirming' | 'confirmed' | 'failed' }>
): number | false {
  return query.state.data?.status === 'confirming' ? 3000 : false
}
