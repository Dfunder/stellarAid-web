import { describe, expect, it } from 'vitest'
import { safeExternalUrl } from './url'

describe('safeExternalUrl', () => {
  it('accepts a plain https URL', () => {
    expect(safeExternalUrl('https://example.com/file.pdf')).toBe('https://example.com/file.pdf')
  })

  it('rejects javascript: URLs', () => {
    expect(safeExternalUrl('javascript:alert(1)')).toBeNull()
  })

  it('rejects data: URLs', () => {
    expect(safeExternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
  })

  it('rejects protocol-relative and relative URLs', () => {
    expect(safeExternalUrl('//evil.com/x')).toBeNull()
    expect(safeExternalUrl('/internal/path')).toBeNull()
  })

  it('rejects non-http(s) schemes such as ftp', () => {
    expect(safeExternalUrl('ftp://example.com/x')).toBeNull()
  })

  it('rejects off-host URLs when a host allow-list is given', () => {
    expect(safeExternalUrl('https://evil.com/x', ['example.com'])).toBeNull()
  })

  it('accepts an allow-listed host', () => {
    expect(safeExternalUrl('https://example.com/x', ['example.com'])).toBe('https://example.com/x')
  })

  it('rejects non-string and empty input', () => {
    expect(safeExternalUrl(null)).toBeNull()
    expect(safeExternalUrl('')).toBeNull()
  })
})