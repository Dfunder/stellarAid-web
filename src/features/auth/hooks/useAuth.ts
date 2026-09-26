import { useCallback, useSyncExternalStore } from 'react'
import { getErrorMessage } from '@/services'
import { authApi } from '../services/authApi'
import { endSession } from '../services/session'
import { authStore, getAuthState, subscribeAuth } from '../stores/authStore'
import { writeTokens } from '../stores/tokenStore'
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

/** Session state plus the two actions that change it. */
export function useAuth(): UseAuth {
  const state = useSyncExternalStore(subscribeAuth, getAuthState)

  const login = useCallback(async (credentials: LoginCredentials): Promise<User> => {
    authStore.startLoading()
    try {
      const session = await authApi.login(credentials)
      writeTokens(session.tokens)
      useAuthStore.getState().setSession(session)
      authStore.setSession(session.user)
      return session.user
    } catch (error) {
      authStore.clearSession(getErrorMessage(error))
      throw error
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    await endSession()
  }, [])

  return {
    user: state.user,
    isAuthenticated: state.status === 'authenticated',
    isLoading: state.status === 'loading',
    error: state.error,
    login,
    logout,
  }
}
