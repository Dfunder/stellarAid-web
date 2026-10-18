import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useAuthHydrated } from '../hooks/useAuthHydrated'
import { useAuth } from '../hooks/useAuth'
import { resolvePostLoginRedirect } from '../utils'
import AuthLoader from './AuthLoader'

/** Renders guest-only routes; signed-in users are sent to a validated destination. */
export default function GuestRoute() {
  const hydrated = useAuthHydrated()
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  if (!hydrated || isLoading) return <AuthLoader />
  if (isAuthenticated) {
    return (
      <Navigate
        to={resolvePostLoginRedirect(location.state, searchParams.get('redirect'))}
        replace
      />
    )
  }
  return <Outlet />
}
