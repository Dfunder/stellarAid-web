import { useCallback, useRef, useState } from 'react'

export interface UseFormSubmissionOptions {
  /**
   * How long (ms) to keep the submit control disabled after a successful
   * submission. Defaults to 2500 ms (#937).
   */
  cooldownMs?: number
}

export interface UseFormSubmissionResult<TArgs extends unknown[]> {
  /** True while the async submit handler is running or during cooldown. */
  isSubmitting: boolean
  /** Label helpers can use for the button ("Submitting…" vs default). */
  submitLabel: (idle: string) => string
  /**
   * Wrap an async submit handler. Concurrent calls are ignored while a
   * submission is already in flight.
   */
  runSubmit: (...args: TArgs) => Promise<void>
  /** Force-clear submitting/cooldown state (e.g. on unmount of a modal). */
  reset: () => void
}

/**
 * Prevents double form submissions (#937).
 *
 * - Sets `isSubmitting` for the duration of the handler.
 * - Keeps the control disabled for `cooldownMs` after success so a
 *   rapid second click cannot re-fire the action.
 * - Concurrent calls while in-flight are no-ops.
 */
export function useFormSubmission<TArgs extends unknown[] = []>(
  handler: (...args: TArgs) => Promise<void>,
  options: UseFormSubmissionOptions = {},
): UseFormSubmissionResult<TArgs> {
  const cooldownMs = options.cooldownMs ?? 2_500
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inFlight = useRef(false)
  const cooldownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    inFlight.current = false
    setIsSubmitting(false)
    if (cooldownTimer.current) {
      clearTimeout(cooldownTimer.current)
      cooldownTimer.current = null
    }
  }, [])

  const runSubmit = useCallback(
    async (...args: TArgs) => {
      if (inFlight.current) return
      inFlight.current = true
      setIsSubmitting(true)
      try {
        await handler(...args)
        // Success cooldown — keep disabled briefly so double-clicks after
        // the network resolves still cannot re-submit.
        cooldownTimer.current = setTimeout(() => {
          inFlight.current = false
          setIsSubmitting(false)
          cooldownTimer.current = null
        }, cooldownMs)
      } catch {
        // On failure, re-enable immediately so the user can retry.
        inFlight.current = false
        setIsSubmitting(false)
        throw undefined
      }
    },
    [cooldownMs, handler],
  )

  const submitLabel = useCallback(
    (idle: string) => (isSubmitting ? 'Submitting…' : idle),
    [isSubmitting],
  )

  return { isSubmitting, submitLabel, runSubmit, reset }
}
