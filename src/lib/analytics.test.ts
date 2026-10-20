import { afterEach, describe, expect, it, vi } from 'vitest'
import { analytics } from './analytics'
import type { AnalyticsEvent, AnalyticsProps } from './analytics'

// ---------------------------------------------------------------------------
// #865 closed the gaps this file used to pin. The scrubber now:
//  1. matches Stellar addresses in any casing, muxed (`M…`) addresses included;
//  2. walks nested objects/arrays, so an email under an unrecognised key is
//     stripped instead of forwarded whole;
//  3. drops anything shaped like a token, even under a neutral key name.
// ---------------------------------------------------------------------------

function trackWithCapture(props: AnalyticsProps): AnalyticsProps {
  const track = vi.fn()
  analytics.setProvider({ track })
  analytics.track('artwork_view' satisfies AnalyticsEvent, props)
  analytics.setProvider(null)
  expect(track).toHaveBeenCalledTimes(1)
  return track.mock.calls[0]?.[1] as AnalyticsProps
}

/** 56-char Stellar public key: G/M + 55 base32 characters. */
function stellarAddress(prefix: string, casing: 'upper' | 'lower' = 'upper'): string {
  const body = 'a'.repeat(55)
  return prefix + (casing === 'upper' ? body.toUpperCase() : body)
}

/** A 69-char muxed account: M + 68 base32 characters. */
function muxedAddress(): string {
  return 'M' + 'b'.repeat(68)
}

/** 56-char Stellar public key: G/M + 55 base32 characters. */
function stellarAddress(prefix: string, casing: 'upper' | 'lower' = 'upper'): string {
  const body = 'a'.repeat(55)
  return prefix + (casing === 'upper' ? body.toUpperCase() : body)
}

describe('stripPii (via analytics.track)', () => {
  afterEach(() => {
    analytics.setProvider(null)
    vi.restoreAllMocks()
  })

  it('strips an uppercase Stellar address stored under a neutral key', () => {
    const props = trackWithCapture({ note: `sent to ${stellarAddress('G')}` })
    expect(props).toEqual({})
  })

  it('strips a muxed M… address', () => {
    const props = trackWithCapture({ note: `route ${stellarAddress('M')}` })
    expect(props).toEqual({})
  })

  it('strips a lowercase Stellar address', () => {
    expect(trackWithCapture({ note: `sent to ${stellarAddress('g', 'lower')}` })).toEqual({})
  })

  it('strips a 69-character muxed address', () => {
    expect(trackWithCapture({ note: `route ${muxedAddress()}` })).toEqual({})
  })

  it('strips an email nested under an unrecognised key', () => {
    const nested = {
      context: { buyer: 'ada@example.com', viewport: 'mobile' },
      events: ['first-view', 'ada@example.com'],
    }
    expect(trackWithCapture(nested as unknown as AnalyticsProps)).toEqual({
      context: { viewport: 'mobile' },
      events: ['first-view'],
    })
  })

  it('strips a token-shaped value even under a neutral key', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dBjftJeZ4CVPmB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    expect(trackWithCapture({ note: jwt })).toEqual({})
  })

  it('strips an email address from a string value', () => {
    const props = trackWithCapture({ message: 'contact ada@example.com for details' })
    expect(props).toEqual({})
  })

  it('strips entries whose key names a PII field', () => {
    const props = trackWithCapture({ userEmail: 'anything', walletAddress: 'anything' })
    expect(props).toEqual({})
  })

  it('keeps a PII-keyed entry dropped rather than inferring from the value', () => {
    // A credential is dropped on the strength of its key alone, so a value that
    // happens not to look sensitive still never leaves the app (#865).
    const props = trackWithCapture({ walletLinked: true })
    expect(props).toEqual({})
  })

  it('preserves non-sensitive values under clean keys', () => {
    const props = trackWithCapture({ title: 'Sunset over Lagos', views: 12, featured: true })
    expect(props).toEqual({ title: 'Sunset over Lagos', views: 12, featured: true })
  })
})
