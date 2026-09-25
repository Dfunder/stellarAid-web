import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthHydrated } from '../hooks/useAuthHydrated'
import { useAuthStore } from '../stores/useAuthStore'
import AuthLoader from './AuthLoader'
import VerifyEmailBanner from './VerifyEmailBanner'

/** Renders authenticated routes; guests are sent to `/login?redirect=<current path>`. */
export default function ProtectedRoute() {
  const hydrated = useAuthHydrated()
  const isAuthenticated = useAuthStore((state) => state.accessToken !== null)
  const location = useLocation()

  if (!hydrated) return <AuthLoader />
  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return (
    <>
      <VerifyEmailBanner />
      <Outlet />
    </>
  )
}
