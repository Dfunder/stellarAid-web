import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/services'
import { authService } from '../services/authService'

const COOLDOWN_SECONDS = 60

interface ResendVerificationButtonProps {
  email: string
  className?: string
}

/** Re-sends the verification email, then locks itself for a cooldown period. */
export default function ResendVerificationButton({
  email,
  className = '',
}: ResendVerificationButtonProps) {
  const [cooldown, setCooldown] = useState(0)
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleClick = async () => {
    setSending(true)
    setMessage(null)
    try {
      await authService.resendVerification(email)
      setMessage('If your email still needs verifying, a new link is on its way.')
      setCooldown(COOLDOWN_SECONDS)
    } catch (error) {
      setMessage(getErrorMessage(error))
    } finally {
      setSending(false)
    }
  }

  return (
    <span className={`inline-flex flex-col gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleClick}
        disabled={!email || sending || cooldown > 0}
        className="self-start font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
      >
        {sending
          ? 'Sending…'
          : cooldown > 0
            ? `Resend verification email (${cooldown}s)`
            : 'Resend verification email'}
      </button>
      {message && (
        <span role="status" className="text-caption-sm text-muted">
          {message}
        </span>
      )}
    </span>
  )
}
