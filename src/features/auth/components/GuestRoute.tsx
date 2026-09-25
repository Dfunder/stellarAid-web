import { Navigate, Outlet, useSearchParams } from 'react-router-dom'
import { useAuthHydrated } from '../hooks/useAuthHydrated'
import { useAuthStore } from '../stores/useAuthStore'
import { safeRedirect } from '../utils'
import AuthLoader from './AuthLoader'

/** Renders guest-only routes; signed-in users are sent to `?redirect=` or the dashboard. */
export default function GuestRoute() {
  const hydrated = useAuthHydrated()
  const isAuthenticated = useAuthStore((state) => state.accessToken !== null)
  const [searchParams] = useSearchParams()

  if (!hydrated) return <AuthLoader />
  if (isAuthenticated) {
    return <Navigate to={safeRedirect(searchParams.get('redirect'))} replace />
  }
  return <Outlet />
}
