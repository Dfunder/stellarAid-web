/**
 * URL safety helpers shared across features (#862, #863).
 *
 * Two jobs live here:
 *  - `safeRedirect` guards a post-login destination so it can only ever be an
 *    in-app path (open-redirect / phishing defence).
 *  - `safeExternalUrl` guards a server-supplied `href`/`src` so it can only
 *    ever be an `https:` URL (stored-XSS defence).
 */

/** Where an authenticated user lands when no safe destination is supplied. */
export const DEFAULT_AUTHENTICATED_PATH = '/dashboard'

/** Whitespace and control characters browsers trim or ignore inside a URL. */
const UNSAFE_REDIRECT_CHARS = /[\s\u0000-\u001f]/

/** Fallback origin used when `location` is unavailable (tests, SSR). */
const FALLBACK_ORIGIN = 'http://localhost'

function currentOrigin(): string {
  return typeof location !== 'undefined' && location.origin ? location.origin : FALLBACK_ORIGIN
}

/** A decoded path is only safe when it stays a single-slash-relative URL. */
function decodedIsSafe(decoded: string): boolean {
  return (
    decoded.startsWith('/') &&
    !decoded.startsWith('//') &&
    !decoded.startsWith('/\\') &&
    !UNSAFE_REDIRECT_CHARS.test(decoded)
  )
}

/**
 * A post-login destination is only safe when it is an app-relative path.
 *
 * A leading `//` (protocol-relative) or `/\` is read by browsers as an absolute
 * URL, and an encoded variant such as `/%09/` or `/%2F%2F` decodes to the same
 * thing — so the raw value is rejected early, the decoded value is checked, and
 * the resolved `URL` origin must still match the app's own origin.
 *
 * `value` is `unknown` on purpose: callers pass router state (`state.from`),
 * which is attacker-influenceable and must be narrowed rather than asserted.
 */
export function safeRedirect(value: unknown): string {
  if (typeof value !== 'string' || value.length === 0) return DEFAULT_AUTHENTICATED_PATH
  if (!value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return DEFAULT_AUTHENTICATED_PATH
  }

  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    // A malformed escape sequence is not a path we can vouch for.
    return DEFAULT_AUTHENTICATED_PATH
  }
  if (!decodedIsSafe(decoded)) return DEFAULT_AUTHENTICATED_PATH

  const base = currentOrigin()
  let url: URL
  try {
    url = new URL(value, base)
  } catch {
    return DEFAULT_AUTHENTICATED_PATH
  }
  // A value such as `/\evil.com` normalises to another host; origin must match.
  if (url.origin !== new URL(base).origin) return DEFAULT_AUTHENTICATED_PATH

  return `${url.pathname}${url.search}${url.hash}`
}

/**
 * Resolves the post-login destination from router state and the query string,
 * using one contract everywhere: `state.from` first, then `?redirect=`, then
 * the default. Both inputs are validated at this single point of use (#862).
 */
export function resolvePostLoginRedirect(state: unknown, fallbackQuery: string | null): string {
  const from =
    typeof state === 'object' && state !== null ? (state as { from?: unknown }).from : undefined
  return safeRedirect(typeof from === 'string' ? from : fallbackQuery)
}

/**
 * Validates a server-supplied external URL before it is used in `href`/`src`.
 *
 * Only `https:` is accepted in production; `http:` is additionally allowed in
 * development. `allowedHosts` optionally restricts the host. Returns `null`
 * when the URL cannot be trusted, so the caller can render a fallback.
 */
export function safeExternalUrl(raw: unknown, allowedHosts?: readonly string[]): string | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return null
  }

  const allowedProtocols = import.meta.env.PROD ? ['https:'] : ['https:', 'http:']
  if (!allowedProtocols.includes(url.protocol)) return null
  if (allowedHosts && allowedHosts.length > 0 && !allowedHosts.includes(url.hostname)) return null

  return url.toString()
}

/** Segments that look like an opaque token (reset tokens, JWTs, ids). */
const TOKEN_SEGMENT_PATTERN = /[A-Za-z0-9_-]{20,}/g

/**
 * Redacts token-shaped segments from a URL before it is logged, so a reset
 * token that travels in the path never reaches the console (#865).
 */
export function redactUrl(url: string | undefined | null): string | undefined {
  if (!url) return undefined
  return url.replace(TOKEN_SEGMENT_PATTERN, '[redacted]')
}
