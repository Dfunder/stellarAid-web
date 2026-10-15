/**
 * Polling decisions for payment result / transaction status screens (#778).
 *
 * react-query v5 passes the `Query` object to the `refetchInterval`
 * callback — not the data — so every callback in this feature must read
 * `query.state.data`. The helpers are extracted here (a) to write the v5
 * access pattern once and (b) so the timing logic is testable without
 * mounting the screens.
 */

interface RefetchableQuery<T> {
  state: { data?: T }
}

/** Poll the payment result every 5s until it reaches a terminal status. */
export function paymentResultRefetchInterval(
  query: RefetchableQuery<{ status: 'success' | 'failed' }>
): number | false {
  return query.state.data?.status === 'success' ? false : 5000
}

type TxStatus = 'submitted' | 'confirming' | 'confirmed' | 'failed'

/**
 * Transaction status polling: the base interval before the first payload,
 * exponential backoff while pending (3s, 6s, 12s, 24s, max 30s), and no
 * interval once the transaction reaches `confirmed` or `failed`.
 */
export function txStatusRefetchInterval(
  query: RefetchableQuery<{ status: TxStatus }>,
  pollInterval: number,
  startTime: number
): number | false {
  const data = query.state.data
  if (!data) return pollInterval
  if (data.status === 'confirmed' || data.status === 'failed') return false
  const elapsed = Date.now() - startTime
  return Math.min(pollInterval * Math.pow(2, Math.floor(elapsed / 15000)), 30000)
}
