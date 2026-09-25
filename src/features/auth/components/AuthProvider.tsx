import { useEffect, type ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { bindSessionToHttp, bootstrapSession, startTokenRefreshLoop } from '../services/session'

/**
 * Restores the session on boot and keeps it alive.
 *
 * Mount this once, above the router: it attaches the bearer token to the HTTP
 * client, revalidates the stored token, and then refreshes the access token
 * shortly before it expires so requests never fail with a 401.
 */
export default function AuthProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    bindSessionToHttp()
    void bootstrapSession()
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    return startTokenRefreshLoop()
  }, [isAuthenticated])

  return <>{children}</>
}
