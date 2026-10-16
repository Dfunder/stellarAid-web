import { Navigate, Outlet } from 'react-router-dom'
import { useAuthHydrated } from '../hooks/useAuthHydrated'
import { useAuth } from '../hooks/useAuth'
import AuthLoader from './AuthLoader'

/** Allows only authenticated artists to access creator routes. */
export default function ArtistRoute() {
  const hydrated = useAuthHydrated()
  const { user, isAuthenticated, isLoading } = useAuth()

  if (!hydrated || isLoading) return <AuthLoader />
  if (!isAuthenticated) return <Navigate to="/login?redirect=%2Fartist" replace />
  if (user?.role !== 'artist') return <Navigate to="/" replace />
  return <Outlet />
}
