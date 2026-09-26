import { ApiError, getErrorMessage, setAuthTokenProvider, setUnauthorizedHandler } from '@/services'
import { queryClient } from '@/stores'
import { authStore } from '../stores/authStore'
import { useAuthStore } from '../stores/useAuthStore'
import { clearTokens, getAccessToken, readTokens, writeTokens } from '../stores/tokenStore'
import { decodeJwtExpiry } from '../utils'
import { authApi } from './authApi'

/** Refresh this long before expiry so in-flight calls never hit a 401. */
const REFRESH_SKEW_MS = 60_000

/** Floor for the refresh timer, so a short-lived token cannot cause a hot loop. */
const MIN_REFRESH_DELAY_MS = 5_000

type ProfileResult = 'ok' | 'unauthorized' | 'error'

let refreshInFlight: Promise<boolean> | null = null
let bootstrapStarted = false
let isEndingSession = false

async function loadProfile(): Promise<ProfileResult> {
  try {
    const { user } = await authApi.me()
    authStore.setSession(user)
    useAuthStore.getState().setUser(user)
    return 'ok'
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return 'unauthorized'
    // Network or server failure: keep the tokens so the user can retry, but stop
    // showing the spinner.
    authStore.clearSession(getErrorMessage(error))
    return 'error'
  }
}

async function performRefresh(): Promise<boolean> {
  const tokens = readTokens()
  if (!tokens) return false

  try {
    const { tokens: next } = await authApi.refresh(tokens.refreshToken)
    writeTokens(next)
    useAuthStore.getState().setTokens(next)
    return true
  } catch {
    // The refresh token is expired, revoked or unreachable - the caller decides.
    return false
  }
}

/**
 * Silently refreshes the access token. Concurrent callers share one request so
 * a burst of 401s triggers a single refresh.
 */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= performRefresh().finally(() => {
    refreshInFlight = null
  })
  return refreshInFlight
}

/** Drops the local session and every cached query. Never throws. */
export function clearSessionState(): void {
  clearTokens()
  authStore.clearSession()
  useAuthStore.getState().clearSession()
  queryClient.clear()
}

/**
 * Full logout: revokes the refresh token server-side, then clears the store and
 * the query cache. Server failures are ignored so the user always gets logged
 * out locally.
 */
export async function endSession(): Promise<void> {
  if (isEndingSession) return
  isEndingSession = true

  try {
    const refreshToken = readTokens()?.refreshToken
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // Best effort: the local session is cleared regardless.
      }
    }
    clearSessionState()
  } finally {
    isEndingSession = false
  }
}

/**
 * Validates the stored token on boot and restores the session.
 *
 * Order matters for a flicker-free reload: profile first (fast path), refresh
 * only when the access token was rejected, and a clean logout when the refresh
 * token is gone too.
 */
export async function bootstrapSession(): Promise<void> {
  if (bootstrapStarted) return
  bootstrapStarted = true

  if (!readTokens()) {
    authStore.clearSession()
    return
  }

  authStore.startLoading()

  const first = await loadProfile()
  if (first !== 'unauthorized') return

  if ((await refreshSession()) && (await loadProfile()) === 'ok') return

  // Refresh token rejected as well: the session cannot be restored.
  clearSessionState()
}

/** Re-schedules itself after every refresh; returns a cancel function. */
export function startTokenRefreshLoop(): () => void {
  let timer = 0
  let cancelled = false

  const schedule = (): void => {
    if (cancelled) return

    const accessToken = getAccessToken()
    const expiry = accessToken ? decodeJwtExpiry(accessToken) : null
    if (expiry === null) return

    timer = window.setTimeout(
      () => void refreshAndReschedule(),
      Math.max(expiry - Date.now() - REFRESH_SKEW_MS, MIN_REFRESH_DELAY_MS),
    )
  }

  const refreshAndReschedule = async (): Promise<void> => {
    if (cancelled) return

    if (await refreshSession()) {
      await loadProfile()
      schedule()
      return
    }
    await endSession()
  }

  schedule()

  return () => {
    cancelled = true
    window.clearTimeout(timer)
  }
}

/** Reacts to a 401 from any request: refresh once, otherwise sign out. */
async function handleUnauthorized(): Promise<void> {
  if (isEndingSession || !readTokens()) return

  if (await refreshSession()) {
    await loadProfile()
    return
  }
  clearSessionState()
}

/** Attaches the session to the shared HTTP client. Safe to call more than once. */
export function bindSessionToHttp(): void {
  setAuthTokenProvider(() => getAccessToken())
  setUnauthorizedHandler(() => void handleUnauthorized())
}
