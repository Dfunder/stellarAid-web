import { afterEach, describe, expect, it, vi } from 'vitest'
import { analytics } from './analytics'
import type { AnalyticsEvent, AnalyticsProps } from './analytics'

// ---------------------------------------------------------------------------
// KNOWN LIMITATIONS of the current scrubber, documented on purpose (the tests
// below pin today's behaviour; closing these gaps is a follow-up per #793):
// 1. STELLAR_ADDRESS_PATTERN is uppercase-only, so a lowercase `g…`/`m…`
//    address currently passes through unstripped.
// 2. Filtering is key-driven: an entry whose key matches PII_KEY_PATTERN is
//    dropped wholesale, even when the value is a harmless boolean, and an
//    address under a key that does not match the pattern is only caught by
//    the value regex (case-sensitively, see 1).
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

  it('documents that a lowercase address is not stripped today', () => {
    const lowercase = stellarAddress('g', 'lower')
    // KNOWN LIMITATION (1): lowercase addresses fall through.
    const props = trackWithCapture({ note: `sent to ${lowercase}` })
    expect(props.note).toContain(lowercase)
  })

  it('strips an email address from a string value', () => {
    const props = trackWithCapture({ message: 'contact ada@example.com for details' })
    expect(props).toEqual({})
  })

  it('strips entries whose key names a PII field', () => {
    const props = trackWithCapture({ userEmail: 'anything', walletAddress: 'anything' })
    expect(props).toEqual({})
  })

  it('documents that a PII-keyed entry is dropped even when the value is harmless', () => {
    // KNOWN LIMITATION (2): key-driven filtering over-strips non-sensitive
    // values such as a boolean flag.
    const props = trackWithCapture({ walletLinked: true })
    expect(props).toEqual({})
  })

  it('preserves non-sensitive values under clean keys', () => {
    const props = trackWithCapture({ title: 'Sunset over Lagos', views: 12, featured: true })
    expect(props).toEqual({ title: 'Sunset over Lagos', views: 12, featured: true })
  })
})
