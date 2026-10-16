import { useCallback } from 'react'
import { getErrorMessage } from '@/services'
import { authApi } from '../services/authApi'
import { endSession } from '../services/session'
import { useAuthStore } from '../stores/useAuthStore'
import type { LoginCredentials, User } from '../types'

export interface UseAuth {
  user: User | null
  isAuthenticated: boolean
  /** True while the stored session is being revalidated or a sign-in is in flight. */
  isLoading: boolean
  error: string | null
  login: (credentials: LoginCredentials) => Promise<User>
  logout: () => Promise<void>
}

/** Thin wrapper over the single auth store: session state plus the two actions that change it. */
export function useAuth(): UseAuth {
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const error = useAuthStore((state) => state.error)

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    const store = useAuthStore.getState()
    store.startLoading()
    try {
      const session = await authApi.login(credentials)
      useAuthStore.getState().setSession(session)
      return session.user
    } catch (error) {
      useAuthStore.getState().clearSession(getErrorMessage(error))
      throw error
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    await endSession()
  }, [])

  return {
    user,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    error,
    login,
    logout,
  }
}
