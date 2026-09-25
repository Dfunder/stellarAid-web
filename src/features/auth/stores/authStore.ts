import type { AuthState, User } from '../types'
import { hasStoredTokens } from './tokenStore'

/**
 * Session state, kept outside React so the HTTP layer and the refresh timer can
 * read and update it without holding a component reference.
 *
 * Components subscribe through `useAuthState()`.
 */
let state: AuthState = {
  // Starting from the stored tokens avoids a signed-out flash on reload while
  // the session is being revalidated.
  status: hasStoredTokens() ? 'loading' : 'unauthenticated',
  user: null,
  error: null,
}

const listeners = new Set<() => void>()

function setState(patch: Partial<AuthState>): void {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

/** Subscribes to session changes; returns an unsubscribe function. */
export function subscribeAuth(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

/** Current session snapshot. Stable between updates, safe for `useSyncExternalStore`. */
export function getAuthState(): AuthState {
  return state
}

export const authStore = {
  startLoading(): void {
    setState({ status: 'loading', error: null })
  },
  setSession(user: User): void {
    setState({ status: 'authenticated', user, error: null })
  },
  clearSession(error: string | null = null): void {
    setState({ status: 'unauthenticated', user: null, error })
  },
}
