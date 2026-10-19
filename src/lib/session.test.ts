import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  __resetSessionForTests,
  configureSessionStorage,
  createSession,
  ensureSession,
  getSession,
  getSessionStatus,
  invalidateSession,
  isSessionIdActive,
  rotateSession,
  SESSION_ABSOLUTE_TIMEOUT_MS,
  SESSION_IDLE_TIMEOUT_MS,
  SESSION_STORAGE_KEY,
  touchSession,
} from '@/lib/session'

function createMemoryStorage() {
  const values = new Map<string, string>()
  return {
    values,
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    },
    removeItem: (key: string) => {
      values.delete(key)
    },
  }
}

beforeEach(() => {
  __resetSessionForTests()
})

afterEach(() => {
  __resetSessionForTests()
})

describe('session identity', () => {
  it('creates and persists a session', () => {
    const storage = createMemoryStorage()
    configureSessionStorage(storage)

    const session = createSession(1_000)

    expect(session.id).toBeTruthy()
    expect(session.issuedAt).toBe(1_000)
    expect(session.lastActivityAt).toBe(1_000)
    expect(getSession(1_000)?.id).toBe(session.id)
    expect(JSON.parse(storage.values.get(SESSION_STORAGE_KEY) ?? '{}')).toEqual(session)
  })

  it('rotates the identifier and invalidates the previous one', () => {
    const first = createSession(1_000)
    const second = rotateSession(2_000)

    expect(second.id).not.toBe(first.id)
    expect(isSessionIdActive(first.id, 2_000)).toBe(false)
    expect(isSessionIdActive(second.id, 2_000)).toBe(true)
  })

  it('prevents a fixated identifier from becoming active after rotation', () => {
    const storage = createMemoryStorage()
    configureSessionStorage(storage)

    const preAuthSession = createSession(1_000)
    rotateSession(2_000)

    // An attacker writes the pre-authentication record back into storage.
    storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(preAuthSession))
    // Simulate a reload: drop the in-memory record but keep invalidation memory.
    configureSessionStorage(storage)

    expect(getSession(2_000)).toBeNull()
    expect(storage.values.has(SESSION_STORAGE_KEY)).toBe(false)
    expect(isSessionIdActive(preAuthSession.id, 2_000)).toBe(false)
  })

  it('invalidates the current session on logout', () => {
    const session = createSession(1_000)
    invalidateSession()

    expect(getSession(1_000)).toBeNull()
    expect(isSessionIdActive(session.id, 1_000)).toBe(false)
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('ensures a session exists without replacing an active one', () => {
    const first = ensureSession(1_000)
    expect(ensureSession(1_500).id).toBe(first.id)

    const rotated = rotateSession(2_000)
    expect(ensureSession(2_000).id).toBe(rotated.id)
    expect(ensureSession(2_000).id).not.toBe(first.id)
  })
})

describe('session timeouts', () => {
  it('expires an idle session and clears it', () => {
    createSession(0)

    expect(getSessionStatus(SESSION_IDLE_TIMEOUT_MS - 1)).toBe('active')
    expect(getSessionStatus(SESSION_IDLE_TIMEOUT_MS)).toBe('idle')
    expect(getSession()).toBeNull()
    expect(sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
  })

  it('extends the idle window when the user is active', () => {
    createSession(0)
    touchSession(10_000)

    expect(getSessionStatus(10_000 + SESSION_IDLE_TIMEOUT_MS - 1)).toBe('active')
    expect(getSessionStatus(10_000 + SESSION_IDLE_TIMEOUT_MS)).toBe('idle')
  })

  it('enforces the absolute timeout regardless of activity', () => {
    createSession(0)

    // Keep the session active (never idle) right up to the absolute deadline.
    for (
      let elapsed = SESSION_IDLE_TIMEOUT_MS - 1;
      elapsed < SESSION_ABSOLUTE_TIMEOUT_MS;
      elapsed += SESSION_IDLE_TIMEOUT_MS - 1
    ) {
      touchSession(elapsed)
    }

    expect(getSessionStatus(SESSION_ABSOLUTE_TIMEOUT_MS - 1)).toBe('active')
    expect(getSessionStatus(SESSION_ABSOLUTE_TIMEOUT_MS)).toBe('expired')
  })

  it('reports a missing session when nothing is stored', () => {
    expect(getSessionStatus()).toBe('missing')
    expect(getSession()).toBeNull()
  })
})
