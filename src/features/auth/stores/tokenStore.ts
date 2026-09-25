import type { AuthTokens } from '../types'

const TOKENS_STORAGE_KEY = 'lumora-auth-tokens'

function isAuthTokens(value: unknown): value is AuthTokens {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<AuthTokens>
  return typeof candidate.accessToken === 'string' && typeof candidate.refreshToken === 'string'
}

/** Persisted token pair, or `null` when absent, unreadable or malformed. */
export function readTokens(): AuthTokens | null {
  try {
    const raw = localStorage.getItem(TOKENS_STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isAuthTokens(parsed) ? parsed : null
  } catch {
    // Storage can be unavailable (private mode) or hold corrupted data.
    return null
  }
}

export function writeTokens(tokens: AuthTokens): void {
  try {
    localStorage.setItem(TOKENS_STORAGE_KEY, JSON.stringify(tokens))
  } catch {
    // Nothing to do: the session simply will not survive a reload.
  }
}

export function clearTokens(): void {
  try {
    localStorage.removeItem(TOKENS_STORAGE_KEY)
  } catch {
    // Nothing to do: the in-memory session is still cleared by the caller.
  }
}

/** Access token for the HTTP layer, or `null` when signed out. */
export function getAccessToken(): string | null {
  return readTokens()?.accessToken ?? null
}

/** Whether a token pair is stored - lets the UI skip the signed-out flash. */
export function hasStoredTokens(): boolean {
  return readTokens() !== null
}
