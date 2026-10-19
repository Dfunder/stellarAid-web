import { useEffect } from 'react'
import { SESSION_CHECK_INTERVAL_MS, getSession, touchSession } from '@/lib/session'
import { endSession } from '../services/session'
import { useAuthStore } from '../stores/useAuthStore'

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const

/**
 * Runtime half of the session timeout policy (#986).
 *
 * While authenticated, user activity extends the idle window. A periodic check
 * tears the session down once it is idle, expired, or invalidated.
 */
export function useSessionTimeout(): void {
  const status = useAuthStore((state) => state.status)

  useEffect(() => {
    if (status !== 'authenticated') return

    const onActivity = () => {
      touchSession()
    }

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, onActivity, { passive: true })
    }

    const interval = window.setInterval(() => {
      if (!getSession()) {
        void endSession()
      }
    }, SESSION_CHECK_INTERVAL_MS)

    return () => {
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, onActivity)
      }
      window.clearInterval(interval)
    }
  }, [status])
}
