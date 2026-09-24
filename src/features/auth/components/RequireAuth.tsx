import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import { useAuth } from '../hooks/useAuth'

/**
 * Route guard: waits for the session bootstrap instead of redirecting straight
 * away, so a reload of a protected page does not flash the sign-in screen.
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex justify-center py-24 text-muted">
        <Spinner label="Restoring your session" className="h-6 w-6" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  return <>{children}</>
}
