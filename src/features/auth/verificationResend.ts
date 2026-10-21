import {
  checkRateLimit,
  peekRateLimit,
  type RateLimitOptions,
  type RateLimitResult,
} from '@/utils/rate-limit'

/**
 * Verification emails a single address may request per hour (#1000).
 *
 * The limit is enforced in the browser so the resend button cannot be hammered
 * from the UI. It complements — and does not replace — a server-side limit on
 * `POST /auth/resend-verification`.
 */
export const RESEND_MAX_ATTEMPTS = 3
export const RESEND_WINDOW_MS = 60 * 60 * 1000

const LIMIT_OPTIONS: RateLimitOptions = {
  maxAttempts: RESEND_MAX_ATTEMPTS,
  windowMs: RESEND_WINDOW_MS,
  persist: true,
  // localStorage so opening a second tab does not hand out a fresh allowance.
  storage: 'local',
}

/**
 * Stable key per address. The address is hashed rather than stored: the limit
 * only needs to tell two addresses apart, and an email in storage is PII.
 */
function hashEmail(email: string): string {
  let hash = 0x811c9dc5
  for (let index = 0; index < email.length; index += 1) {
    hash ^= email.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193) >>> 0
  }
  return hash.toString(16).padStart(8, '0')
}

/** Storage key for an address; case and surrounding whitespace are ignored. */
export function resendLimitKey(email: string): string {
  return `verification-resend:${hashEmail(email.trim().toLowerCase())}`
}

/**
 * Records a resend that actually went out. Call it after the request succeeds,
 * so a failed attempt does not use up the user's allowance.
 */
export function recordResendAttempt(email: string): RateLimitResult {
  return checkRateLimit(resendLimitKey(email), LIMIT_OPTIONS)
}

/** Current allowance without spending an attempt (used to restore the UI). */
export function peekResendLimit(email: string): RateLimitResult {
  return peekRateLimit(resendLimitKey(email), LIMIT_OPTIONS)
}

/** Copy for the disabled state, e.g. `Resend in 12 minutes`. */
export function formatResendWait(retryAfterMs: number): string {
  const minutes = Math.max(1, Math.ceil(retryAfterMs / 60_000))
  return `Resend in ${minutes} minute${minutes === 1 ? '' : 's'}`
}
