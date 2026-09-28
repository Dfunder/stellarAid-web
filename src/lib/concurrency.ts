export interface PooledResult<T> {
  index: number
  ok: true
  value: T
}

export interface PooledError {
  index: number
  ok: false
  error: unknown
}

export type PooledOutcome<T> = PooledResult<T> | PooledError

/**
 * Runs `tasks` with at most `limit` tasks in flight simultaneously.
 *
 * - Starts new work as soon as a running task settles, keeping the pool full.
 * - Preserves input order in the returned outcomes (by `tasks` index).
 * - A rejected task does not abort the pool; its error is collected per index.
 */
export async function runPooled<T>(tasks: Array<() => Promise<T>>, limit: number): Promise<PooledOutcome<T>[]> {
  if (limit < 1) {
    throw new RangeError(`limit must be >= 1, got ${limit}`)
  }

  if (tasks.length === 0) {
    return []
  }

  const outcomes: Array<PooledOutcome<T> | undefined> = new Array(tasks.length)
  let cursor = 0
  let inFlight = 0
  let settled = 0

  return new Promise((resolve) => {
    function pump() {
      while (inFlight < limit && cursor < tasks.length) {
        const index = cursor
        cursor += 1
        inFlight += 1
        tasks[index]!()
          .then(
            (value) => {
              outcomes[index] = { index, ok: true, value }
            },
            (error) => {
              outcomes[index] = { index, ok: false, error }
            }
          )
          .finally(() => {
            inFlight -= 1
            settled += 1
            pump()
            if (settled === tasks.length) {
              resolve(outcomes as PooledOutcome<T>[])
            }
          })
      }
    }
    pump()
  })
}