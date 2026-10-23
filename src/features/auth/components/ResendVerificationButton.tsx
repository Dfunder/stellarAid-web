import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services'
import { authService } from '../services/authService'
import { formatResendWait, peekResendLimit, recordResendAttempt } from '../verificationResend'

const COOLDOWN_SECONDS = 60

interface ResendVerificationButtonProps {
  email: string
  className?: string
}

/**
 * Re-sends the verification email (#1000).
 *
 * Two gates apply: a short per-click cooldown, and a per-address allowance of
 * three emails per hour. When the allowance is spent the button disables itself
 * and states how long the wait is, so the verification endpoint cannot be
 * hammered from any of the auth screens that render this button.
 */
function ResendVerificationButtonInner({ email, className = '' }: ResendVerificationButtonProps) {
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [isError, setIsError] = useState(false)
  /**
   * Epoch ms when the hourly allowance returns; 0 when the button is free.
   * Seeded from storage on mount, so a reload does not hand out a fresh
   * allowance.
   */
  const [retryAt, setRetryAt] = useState(() => {
    if (!email) return 0
    const { retryAfterMs } = peekResendLimit(email)
    return retryAfterMs > 0 ? Date.now() + retryAfterMs : 0
  })
  const [now, setNow] = useState(() => Date.now())

  const remainingMs = Math.max(0, retryAt - now)
  const isBlocked = remainingMs > 0

  // Keep the displayed wait accurate; the interval stops once it expires.
  useEffect(() => {
    if (!isBlocked) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isBlocked])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const blockFor = (retryAfterMs: number) => {
    setRetryAt(Date.now() + retryAfterMs)
    setNow(Date.now())
  }

  const handleClick = async () => {
    if (sending || isBlocked) return

    const allowance = peekResendLimit(email)
    if (!allowance.allowed) {
      blockFor(allowance.retryAfterMs)
      setMessage(formatResendWait(allowance.retryAfterMs))
      setIsError(false)
      return
    }

    setSending(true)
    setMessage(null)
    setIsError(false)
    try {
      await authService.resendVerification(email)
      setMessage('If your email still needs verifying, a new link is on its way.')
      setCooldown(COOLDOWN_SECONDS)
      // Only a request that actually left counts against the hourly allowance.
      const after = recordResendAttempt(email)
      if (!after.allowed) blockFor(after.retryAfterMs)
    } catch (error) {
      setMessage(getErrorMessage(error))
      // A failure is an assertive announcement, not a passive status (#860).
      setIsError(true)
    } finally {
      setSending(false)
    }
  }

  const label = isBlocked
    ? formatResendWait(remainingMs)
    : sending
      ? 'Sending…'
      : cooldown > 0
        ? `Resend verification email (${cooldown}s)`
        : 'Resend verification email'

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!email || sending || cooldown > 0 || isBlocked}
        className="self-start font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
      >
        {label}
      </button>
      {message && (
        <span
          role={isError ? 'alert' : 'status'}
          className={`text-caption-sm ${isError ? 'text-danger' : 'text-muted'}`}
        >
          {message}
        </span>
      )}
    </span>
  )
}

export default function ResendVerificationButton(props: ResendVerificationButtonProps) {
  // Keying on the address gives each address its own allowance and countdown.
  return <ResendVerificationButtonInner key={props.email} {...props} />
}
