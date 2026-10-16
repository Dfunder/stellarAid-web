import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthSession, AuthTokens, SessionStatus, User } from '../types'

interface PersistedAuth {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
}

export interface AuthStoreState extends PersistedAuth {
  status: SessionStatus
  /** User-readable reason for the last failure, if any. */
  error: string | null
  /** Marks a sign-in or session revalidation as in flight. */
  startLoading: () => void
  setSession: (session: AuthSession) => void
  setTokens: (tokens: { accessToken: string; refreshToken: string | null }) => void
  setUser: (user: User) => void
  /** Logout / failed revalidation: clears every token and the user, in memory and in storage. */
  clearSession: (error?: string | null) => void
}

/**
 * The single source of truth for the signed-in session: tokens, user and status.
 *
 * It is persisted to localStorage (key `lumora-auth`) so the session survives reloads. This is the only place
 * tokens are stored; do not add another token store or a second auth store.
 *
 * Trade-off: localStorage is readable by any script on the origin, so an XSS
 * bug could exfiltrate the tokens. We accept this for the MVP because the API
 * issues bearer tokens (not cookies) and a reload-proof session is required.
 * Mitigations: short-lived access tokens, refresh on 401, and a strict no-
 * `dangerouslySetInnerHTML`/CSP policy. Moving the refresh token to an
 * httpOnly cookie is the intended hardening once the API supports it.
 *
 * The HTTP layer reads the token through `bindSessionToHttp()` (see `services/session.ts`), which is registered
 * exactly once from `main.tsx`.
 */
export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      status: 'unauthenticated',
      error: null,
      startLoading: () => set({ status: 'loading', error: null }),
      setSession: ({ tokens, user }) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          user,
          status: 'authenticated',
          error: null,
        }),
      setTokens: ({ accessToken, refreshToken }) =>
        set((state) => ({ accessToken, refreshToken: refreshToken ?? state.refreshToken })),
      setUser: (user) => set({ user, status: 'authenticated', error: null }),
      clearSession: (error = null) =>
        set({ accessToken: null, refreshToken: null, user: null, status: 'unauthenticated', error }),
    }),
    {
      name: 'lumora-auth',
      partialize: ({ accessToken, refreshToken, user }): PersistedAuth => ({
        accessToken,
        refreshToken,
        user,
      }),
      // Starting from stored tokens avoids a signed-out flash on reload while the session is revalidated.
      merge: (persisted, current) => {
        const stored = persisted as Partial<PersistedAuth> | undefined
        const hasTokens = Boolean(stored?.accessToken)
        return {
          ...current,
          ...stored,
          status: hasTokens ? 'loading' : 'unauthenticated',
        }
      },
    },
  ),
)

/** The stored token pair, or `null` when signed out. */
export function getStoredTokens(): AuthTokens | null {
  const { accessToken, refreshToken } = useAuthStore.getState()
  return accessToken && refreshToken ? { accessToken, refreshToken } : null
}

/** Access token for the HTTP layer, or `null` when signed out. */
export function getAccessToken(): string | null {
  return useAuthStore.getState().accessToken
}
