import { describe, expect, it } from 'vitest'
import { DEFAULT_AUTHENTICATED_PATH, safeRedirect } from './utils'

describe('safeRedirect', () => {
  it('allows a plain internal path', () => {
    expect(safeRedirect('/settings/wallets')).toBe('/settings/wallets')
  })

  it('allows the root path', () => {
    expect(safeRedirect('/')).toBe('/')
  })

  it('allows a path carrying a query string', () => {
    expect(safeRedirect('/artworks?category=1')).toBe('/artworks?category=1')
  })

  it('returns the default for null and empty input', () => {
    expect(safeRedirect(null)).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('blocks values that do not start with a slash', () => {
    expect(safeRedirect('https://evil.com/phish')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('evil.com')).toBe(DEFAULT_AUTHENTICATED_PATH)
    expect(safeRedirect('javascript:alert(1)')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('blocks protocol-relative URLs', () => {
    expect(safeRedirect('//evil.com/phish')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('blocks a backslash-escaped protocol-relative host', () => {
    expect(safeRedirect('/\\evil.com/phish')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('blocks a control-character prefix that normalizes to a host', () => {
    expect(safeRedirect('/%09/evil.com/phish')).toBe(DEFAULT_AUTHENTICATED_PATH)
  })

  it('normalizes backslashes in otherwise-safe paths', () => {
    expect(safeRedirect('/settings/wallets\\vault')).toBe('/settings/wallets/vault')
  })
})