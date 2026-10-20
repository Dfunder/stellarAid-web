import { describe, expect, it } from 'vitest'

import {
  DEFAULT_AUTHENTICATED_PATH,
  redactUrl,
  resolvePostLoginRedirect,
  safeExternalUrl,
  safeRedirect,
} from './url'

describe('safeRedirect (#862)', () => {
  it('keeps a normal app-relative path', () => {
    expect(safeRedirect('/dashboard')).toBe('/dashboard')
    expect(safeRedirect('/artist/listings?status=draft')).toBe('/artist/listings?status=draft')
  })

  it('falls back when there is nothing usable to redirect to', () => {
    expect(safeRedirect(null)).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect(undefined)).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect(42)).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('rejects absolute, scheme-based and protocol-relative destinations', () => {
    expect(safeRedirect('https://evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('javascript:alert(1)')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('//evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('/\\evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('rejects encoded whitespace and slash variants of a protocol-relative URL', () => {
    expect(safeRedirect('/%09/evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('/%0a/evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('/%2F%2Fevil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('falls back on a malformed escape sequence', () => {
    expect(safeRedirect('/%')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })
})

describe('resolvePostLoginRedirect (#862)', () => {
  it('prefers a validated state.from over the query string', () => {
    expect(resolvePostLoginRedirect({ from: '/orders/7' }, '/fallback')).toBe('/orders/7')
  })

  it('ignores an unsafe state.from and falls back to the query string', () => {
    expect(resolvePostLoginRedirect({ from: '//evil.com' }, '/orders/7')).toBe('/orders/7')
    expect(resolvePostLoginRedirect({ from: 'javascript:alert(1)' }, null)).toBe(
      DEFAULT_AUTHENTICATED_PATH,
    )
  })

  it('narrows non-string router state instead of trusting it', () => {
    expect(resolvePostLoginRedirect({ from: { toString: () => '/evil' } }, '/orders')).toBe(
      '/orders',
    )
    expect(resolvePostLoginRedirect('not-an-object', '/orders')).toBe('/orders')
  })
})

describe('safeExternalUrl (#863)', () => {
  it('accepts an https URL', () => {
    expect(safeExternalUrl('https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    )
  })

  it('rejects a javascript: or data: URL', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
    expect(safeExternalUrl('data:text/html;base64,PHNjcmlwdD4=')).toBeNull()
  })

  it('rejects a protocol-relative or relative URL', () => {
    expect(safeExternalUrl('//evil.com/x')).toBeNull()
    expect(safeExternalUrl('/account/GABC')).toBeNull()
  })

  it('rejects a non-string or empty value', () => {
    expect(safeExternalUrl(null)).toBeNull()
    expect(safeExternalUrl(undefined)).toBeNull()
    expect(safeExternalUrl('   ')).toBeNull()
  })

  it('restricts hosts when an allow-list is supplied', () => {
    expect(safeExternalUrl('https://cdn.example.com/a.png', ['cdn.example.com'])).toBe(
      'https://cdn.example.com/a.png',
    )
    expect(safeExternalUrl('https://evil.com/a.png', ['cdn.example.com'])).toBeNull()
  })
})

describe('redactUrl (#865)', () => {
  it('redacts a long token-shaped path segment', () => {
    const token = 'a'.repeat(48)
    expect(redactUrl(`/auth/reset-password/${token}`)).toBe('/auth/reset-password/[redacted]')
  })

  it('leaves short, ordinary paths untouched', () => {
    expect(redactUrl('/orders/42')).toBe('/orders/42')
    expect(redactUrl(undefined)).toBeUndefined()
  })
})
