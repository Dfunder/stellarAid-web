import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setAuthTokenProvider } from '@/services'
import type { AuthSession, AuthUser } from '../types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  setSession: (session: AuthSession) => void
  setUser: (user: AuthUser) => void
  clearSession: () => void
}

/** Auth session, persisted to localStorage so it survives reloads. */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) => set({ accessToken, refreshToken, user }),
      setUser: (user) => set({ user }),
      clearSession: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    {
      name: 'lumora-auth',
      partialize: ({ accessToken, refreshToken, user }) => ({ accessToken, refreshToken, user }),
    },
  ),
)

setAuthTokenProvider(() => useAuthStore.getState().accessToken)
