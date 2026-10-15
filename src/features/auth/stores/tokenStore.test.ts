import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthTokens } from '../types'
import { clearTokens, getAccessToken, hasStoredTokens, readTokens, writeTokens } from './tokenStore'

const STORAGE_KEY = 'lumora-auth-tokens'

describe('tokenStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('round-trips a token pair through localStorage', () => {
    const tokens: AuthTokens = { accessToken: 'access-1', refreshToken: 'refresh-1' }

    writeTokens(tokens)

    expect(readTokens()).toEqual(tokens)
    expect(hasStoredTokens()).toBe(true)
    expect(getAccessToken()).toBe('access-1')
  })

  it('returns null for malformed JSON instead of throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not-json')

    expect(readTokens()).toBeNull()
    expect(hasStoredTokens()).toBe(false)
    expect(getAccessToken()).toBeNull()
  })

  it('rejects a stored payload without a refresh token', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: 'only-access' }))

    expect(readTokens()).toBeNull()
  })

  it('rejects a stored payload with the wrong value types', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accessToken: 42, refreshToken: {} }))

    expect(readTokens()).toBeNull()
  })

  it('getAccessToken reflects the latest write and clears with the session', () => {
    writeTokens({ accessToken: 'first', refreshToken: 'r1' })
    expect(getAccessToken()).toBe('first')

    writeTokens({ accessToken: 'second', refreshToken: 'r2' })
    expect(getAccessToken()).toBe('second')

    clearTokens()
    expect(getAccessToken()).toBeNull()
    expect(readTokens()).toBeNull()
    expect(hasStoredTokens()).toBe(false)
  })

  it('survives a throwing storage (private browsing)', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(readTokens()).toBeNull()

    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    expect(() => writeTokens({ accessToken: 'a', refreshToken: 'b' })).not.toThrow()

    getItem.mockRestore()
    setItem.mockRestore()
  })
})
