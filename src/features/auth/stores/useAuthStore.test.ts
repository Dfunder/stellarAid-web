import { beforeEach, describe, expect, it } from 'vitest'
import { getAccessToken, getStoredTokens, useAuthStore } from './useAuthStore'
import type { AuthSession, User } from '../types'

const user = { id: 'u1', email: 'a@b.co', role: 'artist' } as User
const session: AuthSession = { user, tokens: { accessToken: 'access-1', refreshToken: 'refresh-1' } }

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().clearSession()
})

describe('useAuthStore', () => {
  it('starts signed out with no tokens', () => {
    expect(useAuthStore.getState().status).toBe('unauthenticated')
    expect(getAccessToken()).toBeNull()
    expect(getStoredTokens()).toBeNull()
  })

  it('setSession authenticates the user and exposes the tokens', () => {
    useAuthStore.getState().setSession(session)

    const state = useAuthStore.getState()
    expect(state.status).toBe('authenticated')
    expect(state.user).toEqual(user)
    expect(getAccessToken()).toBe('access-1')
    expect(getStoredTokens()).toEqual(session.tokens)
  })

  it('setTokens keeps the refresh token when the new pair omits it', () => {
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().setTokens({ accessToken: 'access-2', refreshToken: null })

    expect(getStoredTokens()).toEqual({ accessToken: 'access-2', refreshToken: 'refresh-1' })
  })

  it('clearSession drops tokens and user, and can record an error', () => {
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().clearSession('Session expired')

    const state = useAuthStore.getState()
    expect(state.status).toBe('unauthenticated')
    expect(state.user).toBeNull()
    expect(state.error).toBe('Session expired')
    expect(getAccessToken()).toBeNull()
  })

  it('persists a single copy of the tokens under lumora-auth and nowhere else', () => {
    useAuthStore.getState().setSession(session)

    const stored = JSON.parse(localStorage.getItem('lumora-auth') ?? '{}') as {
      state?: { accessToken?: string; status?: string }
    }
    expect(stored.state?.accessToken).toBe('access-1')
    expect(stored.state).not.toHaveProperty('status')
    expect(localStorage.getItem('lumora-auth-tokens')).toBeNull()
  })

  it('startLoading marks the session as loading', () => {
    useAuthStore.getState().startLoading()
    expect(useAuthStore.getState().status).toBe('loading')
  })
})
