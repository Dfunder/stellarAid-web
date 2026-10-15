import { describe, expect, it } from 'vitest'

import {
  DEFAULT_AUTHENTICATED_PATH,
  decodeJwtExpiry,
  getPasswordIssues,
  getPasswordStrength,
  safeRedirect,
} from './utils'

/** Builds a token-shaped string with the given raw JSON payload. */
function jwtWithPayload(payload: string): string {
  const encoded = btoa(payload).replace(/\+/g, '-').replace(/\//g, '_')
  return `header.${encoded}.signature`
}

describe('safeRedirect (#798)', () => {
  it('keeps a normal app-relative path', () => {
    expect(safeRedirect('/dashboard')).toBe('/dashboard')
    expect(safeRedirect('/artist/listings?status=draft')).toBe('/artist/listings?status=draft')
  })

  it('falls back when there is nothing to redirect to', () => {
    expect(safeRedirect(null)).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('rejects an absolute or scheme-based destination', () => {
    expect(safeRedirect('https://evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('javascript:alert(1)')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('//evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('/\\evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('rejects encoded whitespace variants of a protocol-relative URL', () => {
    expect(safeRedirect('/%09/evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('/%0a/evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('/%2F%2Fevil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('falls back on a malformed escape sequence', () => {
    expect(safeRedirect('/%')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })
})

describe('decodeJwtExpiry (#798)', () => {
  it('decodes a finite exp claim into milliseconds', () => {
    expect(decodeJwtExpiry(jwtWithPayload('{"exp":1700000000}'))).toBe(1_700_000_000_000)
  })

  it('returns null for a non-finite, missing or non-numeric exp', () => {
    // `JSON.parse` turns 1e999 into Infinity, which is still `typeof number`.
    expect(decodeJwtExpiry(jwtWithPayload('{"exp":1e999}'))).toBeNull()
    expect(decodeJwtExpiry(jwtWithPayload('{"exp":"1700000000"}'))).toBeNull()
    expect(decodeJwtExpiry(jwtWithPayload('{}'))).toBeNull()
  })

  it('returns null for a token that is not a JWT or is malformed', () => {
    expect(decodeJwtExpiry('opaque-token')).toBeNull()
    expect(decodeJwtExpiry('a.!!!!.c')).toBeNull()
  })
})

describe('password rules (#798)', () => {
  it('accepts a password that meets every rule at the length threshold', () => {
    expect(getPasswordIssues('Abcdefg1')).toEqual([])
  })

  it('reports the exact rule that failed at the boundary', () => {
    expect(getPasswordIssues('Abcdef1')).toEqual(['Use at least 8 characters.'])
    expect(getPasswordIssues('abcdefg1')).toEqual(['Add an uppercase letter.'])
    expect(getPasswordIssues('ABCDEFG1')).toEqual(['Add a lowercase letter.'])
    expect(getPasswordIssues('Abcdefgh')).toEqual(['Add a number.'])
  })

  it('scores an untouched field as empty', () => {
    expect(getPasswordStrength('')).toEqual({ score: 0, label: '' })
  })

  it('scores by the rules the password passes', () => {
    expect(getPasswordStrength('abcdefgh').score).toBe(1)
    expect(getPasswordStrength('Abcdefgh').score).toBe(2)
    expect(getPasswordStrength('Abcdefgh12').score).toBe(3)
  })

  it('never scores above the 0-4 range even when every rule passes', () => {
    expect(getPasswordStrength('Abcdefgh1234!')).toEqual({ score: 4, label: 'Strong' })
  })
})
