import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { resetRateLimits } from '@/utils/rate-limit'
import {
  RESEND_MAX_ATTEMPTS,
  RESEND_WINDOW_MS,
  formatResendWait,
  peekResendLimit,
  recordResendAttempt,
  resendLimitKey,
} from './verificationResend'

const EMAIL = 'artist@example.com'

beforeEach(() => {
  resetRateLimits()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-21T10:00:00Z'))
})

afterEach(() => {
  vi.useRealTimers()
  resetRateLimits()
})

describe('verification resend limit (#1000)', () => {
  it('allows three emails per hour and then blocks', () => {
    for (let attempt = 1; attempt <= RESEND_MAX_ATTEMPTS; attempt += 1) {
      expect(recordResendAttempt(EMAIL).allowed).toBe(true)
    }

    const blocked = recordResendAttempt(EMAIL)
    expect(blocked.allowed).toBe(false)
    expect(blocked.retryAfterMs).toBeGreaterThan(0)
    expect(blocked.retryAfterMs).toBeLessThanOrEqual(RESEND_WINDOW_MS)
  })

  it('reports the wait in minutes and never shows zero', () => {
    expect(formatResendWait(RESEND_WINDOW_MS)).toBe('Resend in 60 minutes')
    expect(formatResendWait(12 * 60_000)).toBe('Resend in 12 minutes')
    expect(formatResendWait(60_000)).toBe('Resend in 1 minute')
    expect(formatResendWait(1)).toBe('Resend in 1 minute')
  })

  it('lets a new email through while another is blocked', () => {
    for (let attempt = 0; attempt < RESEND_MAX_ATTEMPTS; attempt += 1) {
      recordResendAttempt(EMAIL)
    }

    expect(peekResendLimit(EMAIL).allowed).toBe(false)
    expect(peekResendLimit('collector@example.com').allowed).toBe(true)
  })

  it('keys the limit on the normalised address, without storing it', () => {
    expect(resendLimitKey('  Artist@Example.com ')).toBe(resendLimitKey(EMAIL))
    expect(resendLimitKey(EMAIL)).not.toContain('artist')
    expect(resendLimitKey(EMAIL)).not.toContain('example')
  })

  it('peeking does not spend an attempt', () => {
    for (let peek = 0; peek < 10; peek += 1) {
      expect(peekResendLimit(EMAIL).allowed).toBe(true)
    }

    for (let attempt = 0; attempt < RESEND_MAX_ATTEMPTS; attempt += 1) {
      expect(recordResendAttempt(EMAIL).allowed).toBe(true)
    }
    expect(peekResendLimit(EMAIL).allowed).toBe(false)
  })

  it('opens a fresh allowance once the hour has passed', () => {
    for (let attempt = 0; attempt < RESEND_MAX_ATTEMPTS; attempt += 1) {
      recordResendAttempt(EMAIL)
    }
    expect(peekResendLimit(EMAIL).allowed).toBe(false)

    vi.setSystemTime(new Date(Date.now() + RESEND_WINDOW_MS + 1))
    expect(peekResendLimit(EMAIL).allowed).toBe(true)
  })

  it('survives a reload because the window is persisted in localStorage', () => {
    for (let attempt = 0; attempt < RESEND_MAX_ATTEMPTS; attempt += 1) {
      recordResendAttempt(EMAIL)
    }

    // Only in-memory state would be lost here; storage is what the UI restores from.
    const persisted = localStorage.getItem(`rl:${resendLimitKey(EMAIL)}`)
    expect(persisted).not.toBeNull()
    expect(JSON.parse(persisted ?? '[]')).toHaveLength(RESEND_MAX_ATTEMPTS)
  })
})
