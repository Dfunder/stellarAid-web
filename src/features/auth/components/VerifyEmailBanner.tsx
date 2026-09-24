import { useState } from 'react'
import { useAuthStore } from '../stores/useAuthStore'
import ResendVerificationButton from './ResendVerificationButton'

const DISMISSED_KEY = 'lumora-verify-banner-dismissed'

function readDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISSED_KEY) === '1'
  } catch {
    return false
  }
}

/** Prompts unverified users to verify their email; dismissible for the current session. */
export default function VerifyEmailBanner() {
  const user = useAuthStore((state) => state.user)
  const [dismissed, setDismissed] = useState(readDismissed)

  if (!user || user.emailVerified || dismissed) return null

  const handleDismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1')
    } catch {
      // Dismissal simply won't survive a reload.
    }
    setDismissed(true)
  }

  return (
    <div
      role="region"
      aria-label="Email verification"
      className="border-b border-warning bg-warning/10"
    >
      <div className="container flex flex-wrap items-start justify-between gap-3 py-3 text-caption">
        <div className="flex flex-col gap-1">
          <p className="text-foreground">
            Please verify your email address. Check your inbox for the verification link.
          </p>
          <ResendVerificationButton email={user.email} />
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss verification reminder"
          className="rounded-control px-2 text-muted hover:text-foreground focus-visible:shadow-focus-ring"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
