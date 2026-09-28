/**
 * Returns a function that delays invoking `fn` until at least `intervalMs`
 * have passed since the previous invocation, coalescing intermediate calls.
 *
 * - The first call within an idle window runs immediately.
 * - Subsequent calls during the window only update the latest pending args.
 * - The last coalesced call is always delivered (trailing edge) once the
 *   window elapses, so progress never silently drops its final value.
 */
export function throttleLatest<TArgs extends unknown[]>(fn: (...args: TArgs) => void, intervalMs: number) {
  let lastRun = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: TArgs | undefined

  function invoke(args: TArgs) {
    lastRun = Date.now()
    pending = undefined
    fn(...args)
  }

  const throttled = (...args: TArgs): void => {
    pending = args
    const now = Date.now()
    const remaining = lastRun + intervalMs - now

    if (remaining <= 0) {
      if (timer !== undefined) {
        clearTimeout(timer)
        timer = undefined
      }
      invoke(args)
      return
    }

    if (timer === undefined) {
      timer = setTimeout(() => {
        timer = undefined
        if (pending !== undefined) {
          invoke(pending)
        }
      }, remaining)
    }
  }

  /** Drops any pending trailing call; used on unmount so it cannot fire late. */
  throttled.cancel = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
    pending = undefined
  }

  return throttled
}