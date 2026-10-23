/**
 * Client-side rate limiter for form submissions (#933, #1000).
 *
 * Tracks timestamps per key in memory (and optionally session/local storage) so
 * rapid resubmits from the same browser are rejected before they hit the
 * network. This complements server-side limits; it is not a security boundary
 * on its own.
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
  /** Persist across reloads. Defaults to true. */
  persist?: boolean
  /**
   * Where to persist when `persist` is true. `local` survives new tabs as well
   * as reloads, which is what a limit on outbound email needs (#1000).
   * Defaults to `session`.
   */
  storage?: 'session' | 'local'
}

const memoryStore = new Map<string, number[]>()

function storageFor(persist: boolean, kind: 'session' | 'local'): Storage | null {
  if (!persist) return null
  try {
    return kind === 'local' ? localStorage : sessionStorage
  } catch {
    // Storage can be blocked entirely (private mode, sandboxed iframe).
    return null
  }
}

function read(key: string, persist: boolean, kind: 'session' | 'local'): number[] {
  const store = storageFor(persist, kind)
  if (!store) return memoryStore.get(key) ?? []
  try {
    const raw = store.getItem(`rl:${key}`)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === 'number') : []
  } catch {
    return []
  }
}

function write(key: string, stamps: number[], persist: boolean, kind: 'session' | 'local'): void {
  memoryStore.set(key, stamps)
  const store = storageFor(persist, kind)
  if (!store) return
  try {
    store.setItem(`rl:${key}`, JSON.stringify(stamps))
  } catch {
    // Quota / private mode — memory store still works.
  }
}

/** Recent timestamps inside the window, plus the state they imply. */
function withinWindow(
  timestamps: number[],
  maxAttempts: number,
  windowMs: number,
  now: number,
): { recent: number[]; result: RateLimitResult } {
  const recent = timestamps.filter((t) => now - t < windowMs)
  if (recent.length >= maxAttempts) {
    const oldest = recent[0] ?? now
    return {
      recent,
      result: { allowed: false, retryAfterMs: Math.max(0, windowMs - (now - oldest)) },
    }
  }
  return { recent, result: { allowed: true, retryAfterMs: 0 } }
}

/**
 * Returns whether an action identified by `key` is currently allowed.
 * On success the attempt is recorded against the window.
 */
export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const maxAttempts = options.maxAttempts ?? 3
  const windowMs = options.windowMs ?? 60_000
  const persist = options.persist ?? true
  const kind = options.storage ?? 'session'
  const now = Date.now()
  const { recent, result } = withinWindow(read(key, persist, kind), maxAttempts, windowMs, now)

  if (!result.allowed) return result

  recent.push(now)
  write(key, recent, persist, kind)
  return result
}

/**
 * Reports the current state without recording an attempt, so a component can
 * restore its countdown after a reload without spending a slot.
 */
export function peekRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const maxAttempts = options.maxAttempts ?? 3
  const windowMs = options.windowMs ?? 60_000
  const persist = options.persist ?? true
  const kind = options.storage ?? 'session'
  return withinWindow(read(key, persist, kind), maxAttempts, windowMs, Date.now()).result
}

/** Test helper — clears all rate-limit state. */
export function resetRateLimits(): void {
  memoryStore.clear()
  for (const kind of ['session', 'local'] as const) {
    const store = storageFor(true, kind)
    if (!store) continue
    try {
      const keys: string[] = []
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i)
        if (k?.startsWith('rl:')) keys.push(k)
      }
      keys.forEach((k) => store.removeItem(k))
    } catch {
      // ignore
    }
  }
}
