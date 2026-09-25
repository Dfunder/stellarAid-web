import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthTokenProvider, setTokenRefresher, setUnauthorizedHandler } from '@/services'
import { authApi } from '../services/authApi'
import type { AuthSession, User } from '../types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  setSession: (session: AuthSession) => void
  setTokens: (tokens: { accessToken: string; refreshToken: string | null }) => void
  setUser: (user: User) => void
  /** Logout: clears every token and the user, in memory and in storage. */
  clearSession: () => void
}

/**
 * Auth session, persisted to localStorage so it survives reloads.
 *
 * Trade-off: localStorage is readable by any script on the origin, so an XSS
 * bug could exfiltrate the tokens. We accept this for the MVP because the API
 * issues bearer tokens (not cookies) and a reload-proof session is required.
 * Mitigations: short-lived access tokens, refresh on 401, and a strict no-
 * `dangerouslySetInnerHTML`/CSP policy. Moving the refresh token to an
 * httpOnly cookie is the intended hardening once the API supports it.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      status: 'unauthenticated',
      setSession: ({ tokens, user }) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
          status: 'authenticated',
        }),
      setTokens: ({ accessToken, refreshToken }) =>
        set((state) => ({ accessToken, refreshToken: refreshToken ?? state.refreshToken })),
      setUser: (user) => set({ user, status: 'authenticated' }),
      clearSession: () =>
        set({ accessToken: null, refreshToken: null, user: null, status: 'unauthenticated' }),
    }),
    {
      name: 'lumora-auth',
      partialize: ({ accessToken, refreshToken, user }) => ({ accessToken, refreshToken, user }),
    },
  ),
)

setAuthTokenProvider(() => useAuthStore.getState().accessToken)

setTokenRefresher(async () => {
  const { refreshToken, setTokens } = useAuthStore.getState()
  if (!refreshToken) return null
  const { tokens } = await authApi.refresh(refreshToken)
  setTokens(tokens)
  return tokens.accessToken
})

// Refresh failed: drop the session. ProtectedRoute then redirects to /login?redirect=.
setUnauthorizedHandler(() => useAuthStore.getState().clearSession())
