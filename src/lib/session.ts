/**
 * Client-side session identity and lifetime tracking (#986).
 *
 * The API issues bearer tokens rather than server-side session cookies, so the
 * token pair is replaced on every sign-in and refresh. This module adds a
 * separate, rotating browser session identifier on top of that so a session
 * fixated before authentication cannot be reused afterwards, and so an idle or
 * overly old session can be detected and torn down.
 *
 * The identifier lives in `sessionStorage` (not `localStorage`), so it is
 * scoped to the tab and is replaced whenever the browser session ends.
 */

/** `sessionStorage` key holding the current session record. */
export const SESSION_STORAGE_KEY = 'lumora.session'

/** How long a session may sit idle before it must be re-authenticated. */
export const SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000

/** Hard upper bound on a session's lifetime, regardless of activity. */
export const SESSION_ABSOLUTE_TIMEOUT_MS = 8 * 60 * 60 * 1000

/** How often the UI checks an authenticated session for expiry. */
export const SESSION_CHECK_INTERVAL_MS = 30 * 1000

/** Bound the in-memory invalidation list so a long-lived tab cannot grow it forever. */
const MAX_TRACKED_INVALID_IDS = 32

export interface SessionRecord {
  id: string
  issuedAt: number
  lastActivityAt: number
}

export type SessionStatus = 'missing' | 'active' | 'idle' | 'expired'

interface SessionStorageLike {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

let activeSession: SessionRecord | null = null
let storageOverride: SessionStorageLike | null | undefined
const invalidatedSessionIds = new Set<string>()

function getStorage(): SessionStorageLike | null {
  if (storageOverride !== undefined) return storageOverride

  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    // Storage can throw in privacy modes; session tracking then degrades to
    // in-memory only instead of breaking sign-in.
    return null
  }
}

/**
 * Replaces the storage backing the session manager. Primarily useful for tests
 * and for environments without `sessionStorage`; production uses the browser's
 * `sessionStorage` automatically.
 */
export function configureSessionStorage(storage: SessionStorageLike | null): void {
  storageOverride = storage
  activeSession = null
}

function isSessionRecord(value: unknown): value is SessionRecord {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<SessionRecord>
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.issuedAt === 'number' &&
    Number.isFinite(candidate.issuedAt) &&
    typeof candidate.lastActivityAt === 'number' &&
    Number.isFinite(candidate.lastActivityAt)
  )
}

function readStoredSession(): SessionRecord | null {
  try {
    const raw = getStorage()?.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isSessionRecord(parsed)) {
      getStorage()?.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function persistSession(session: SessionRecord): void {
  try {
    getStorage()?.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // Best effort: an in-memory session still protects the current page.
  }
}

function clearPersistedSession(): void {
  try {
    getStorage()?.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Ignore storage failures on teardown.
  }
}

function ensureLoaded(): SessionRecord | null {
  if (activeSession) return activeSession
  activeSession = readStoredSession()
  return activeSession
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    crypto.getRandomValues(bytes)
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function rememberInvalidated(id: string): void {
  invalidatedSessionIds.add(id)
  if (invalidatedSessionIds.size <= MAX_TRACKED_INVALID_IDS) return

  const oldest = invalidatedSessionIds.values().next().value
  if (oldest) invalidatedSessionIds.delete(oldest)
}

function evaluateStatus(session: SessionRecord, now: number): Exclude<SessionStatus, 'missing'> {
  if (invalidatedSessionIds.has(session.id)) return 'expired'
  if (now - session.issuedAt >= SESSION_ABSOLUTE_TIMEOUT_MS) return 'expired'
  if (now - session.lastActivityAt >= SESSION_IDLE_TIMEOUT_MS) return 'idle'
  return 'active'
}

/** Creates and stores a fresh session record, replacing the in-memory one. */
export function createSession(now = Date.now()): SessionRecord {
  const session: SessionRecord = {
    id: createSessionId(),
    issuedAt: now,
    lastActivityAt: now,
  }

  activeSession = session
  persistSession(session)
  return session
}

/**
 * Regenerates the session identifier and invalidates the previous one. Call
 * this after successful authentication and on every token refresh.
 */
export function rotateSession(now = Date.now()): SessionRecord {
  const previous = ensureLoaded()
  if (previous) rememberInvalidated(previous.id)

  return createSession(now)
}

/** Invalidates the current session and removes it from storage. */
export function invalidateSession(): void {
  const current = ensureLoaded()
  if (current) rememberInvalidated(current.id)

  activeSession = null
  clearPersistedSession()
}

/** Explicitly invalidates an identifier, even if it is no longer current. */
export function invalidateSessionId(id: string): void {
  if (id) rememberInvalidated(id)
}

/** Current session status, clearing an idle/expired session as a side effect. */
export function getSessionStatus(now = Date.now()): SessionStatus {
  const session = ensureLoaded()
  if (!session) return 'missing'

  const status = evaluateStatus(session, now)
  if (status !== 'active') {
    activeSession = null
    clearPersistedSession()
  }

  return status
}

/** Returns the active session, or `null` when missing, idle, expired or invalidated. */
export function getSession(now = Date.now()): SessionRecord | null {
  return getSessionStatus(now) === 'active' ? activeSession : null
}

/** Returns the active session, creating one when none exists. */
export function ensureSession(now = Date.now()): SessionRecord {
  return getSession(now) ?? createSession(now)
}

/** Records user activity, extending the idle timeout. */
export function touchSession(now = Date.now()): SessionRecord | null {
  const session = getSession(now)
  if (!session) return null

  if (now > session.lastActivityAt) {
    const updated: SessionRecord = { ...session, lastActivityAt: now }
    activeSession = updated
    persistSession(updated)
    return updated
  }

  return session
}

/** Whether `id` is the current, non-invalidated session. */
export function isSessionIdActive(id: string, now = Date.now()): boolean {
  if (!id || invalidatedSessionIds.has(id)) return false
  return getSession(now)?.id === id
}

/** Clears all in-memory and persisted state. Intended for tests. */
export function __resetSessionForTests(): void {
  activeSession = null
  invalidatedSessionIds.clear()
  storageOverride = undefined

  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // No window/storage in some test environments.
  }
}
