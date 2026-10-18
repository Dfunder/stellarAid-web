/**
 * Client-side rate limiter for form submissions (#933).
 *
 * Tracks timestamps per key in memory (and optionally sessionStorage) so
 * rapid resubmits from the same browser tab are rejected before they hit
 * the network. This complements server-side limits; it is not a security
 * boundary on its own.
 */

export interface RateLimitResult {
  allowed: boolean
  /** Milliseconds until the next attempt is allowed (0 when allowed). */
  retryAfterMs: number
}

export interface RateLimitOptions {
  /** Maximum attempts inside the window. */
  maxAttempts?: number
  /** Window length in milliseconds. */
  windowMs?: number
  /** Persist across reloads using sessionStorage. */
  persist?: boolean
}

const memoryStore = new Map<string, number[]>()

function read(key: string, persist: boolean): number[] {
  if (!persist) return memoryStore.get(key) ?? []
  try {
    const raw = sessionStorage.getItem(`rl:${key}`)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((n): n is number => typeof n === 'number')
      : []
  } catch {
    return []
  }
}

function write(key: string, stamps: number[], persist: boolean): void {
  memoryStore.set(key, stamps)
  if (!persist) return
  try {
    sessionStorage.setItem(`rl:${key}`, JSON.stringify(stamps))
  } catch {
    // Quota / private mode — memory store still works.
  }
}

/**
 * Returns whether an action identified by `key` is currently allowed.
 * On success the attempt is recorded against the window.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const maxAttempts = options.maxAttempts ?? 3
  const windowMs = options.windowMs ?? 60_000
  const persist = options.persist ?? true
  const now = Date.now()
  const recent = read(key, persist).filter((t) => now - t < windowMs)

  if (recent.length >= maxAttempts) {
    const oldest = recent[0] ?? now
    return { allowed: false, retryAfterMs: Math.max(0, windowMs - (now - oldest)) }
  }

  recent.push(now)
  write(key, recent, persist)
  return { allowed: true, retryAfterMs: 0 }
}

/** Test helper — clears all rate-limit state. */
export function resetRateLimits(): void {
  memoryStore.clear()
  try {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k?.startsWith('rl:')) keys.push(k)
    }
    keys.forEach((k) => sessionStorage.removeItem(k))
  } catch {
    // ignore
  }
}
