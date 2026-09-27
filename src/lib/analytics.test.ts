import { describe, expect, it } from 'vitest'
import { analytics } from './analytics'

// The PII scrubber is the app's only defence against leaking user identifiers
// to the analytics provider. These tests pin its current behaviour:
// - uppercase, lowercase and muxed (M...) Stellar addresses are stripped
// - emails in top-level keys are stripped
// - a key whose name matches a PII keyword is stripped regardless of value
// - keys that merely contain an address or email inside a longer string are stripped
// - a known key with a non-sensitive value is preserved

describe('stripPii', () => {
  const trackedProps: Array<Record<string, unknown>> = []
  const provider = {
    track: (event: string, props: Record<string, unknown>) => {
      trackedProps.push(props)
    },
  }

  beforeEach(() => {
    trackedProps.length = 0
    analytics.setProvider(provider)
  })

  afterEach(() => {
    analytics.setProvider(null)
  })

  it('strips an uppercase Stellar address under any key', () => {
    const key = 'GABCXDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    analytics.track('signup', { caller: key })
    expect(trackedProps[0]).toEqual({})
  })

  it('strips a lowercase Stellar address', () => {
    const key = 'gabcxdxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
    analytics.track('login', { caller: key })
    expect(trackedProps[0]).toEqual({})
  })

  it('strips a muxed M... Stellar address', () => {
    const key = 'MABCXDXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
    analytics.track('wallet_connect', { account: key })
    expect(trackedProps[0]).toEqual({})
  })

  it('strips an email under a top-level key', () => {
    analytics.track('signup', { email: 'candidate@example.com' })
    expect(trackedProps[0]).toEqual({})
  })

  it('strips an email embedded in a longer string', () => {
    analytics.track('signup', { referrer: 'sent by candidate@example.com today' })
    expect(trackedProps[0]).toEqual({})
  })

  it('strips by key name even when the value looks harmless', () => {
    analytics.track('login', { email: 'profile' })
    expect(trackedProps[0]).toEqual({})
  })

  it('preserves a known key with a non-sensitive value', () => {
    analytics.track('checkout_start', { artworkId: 'art-123', amount: 25 })
    expect(trackedProps[0]).toEqual({ artworkId: 'art-123', amount: 25 })
  })

  it('keeps unrelated string values intact', () => {
    analytics.track('payment_complete', { txHash: 'abc123' })
    expect(trackedProps[0]).toEqual({ txHash: 'abc123' })
  })
})