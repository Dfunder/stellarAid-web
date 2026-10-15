import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuthHydrated } from '../hooks/useAuthHydrated'
import { useAuth } from '../hooks/useAuth'
import { safeRedirect } from '../utils'
import AuthLoader from './AuthLoader'

/** Renders guest-only routes; signed-in users are sent to `?redirect=` or the dashboard. */
export default function GuestRoute() {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, isLoading } = useAuth()
  const [searchParams] = useSearchParams()

  if (!hydrated || isLoading) return <AuthLoader />
  if (isAuthenticated) {
    return <Navigate to={safeRedirect(searchParams.get('redirect'))} replace />
  }
  return <Outlet />
}
