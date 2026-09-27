import { describe, expect, it } from 'vitest'
import { analytics } from './analytics'

function trackProps(props: Record<string, unknown>) {
  const tracked: Array<Record<string, unknown>> = []
  analytics.setProvider({ track: (_event, safe) => tracked.push(safe as Record<string, unknown>) })
  analytics.track('signup', props as never)
  analytics.setProvider(null)
  return tracked[0]
}

describe('stripPii via analytics.track', () => {
  it('strips an uppercase Stellar address', () => {
    const props = tokenProps('GCVALP5Z24SAX5RQD4H2IZVUQ7ZQPYFQZM3W7L7G6QFYYXK4R6JQZ4X7X')
    expect(trackProps(props)).not.toHaveProperty('address')
  })

  it('strips a lowercase Stellar address', () => {
    const raw = makeAddress('G').toLowerCase()
    const tracked = trackProps({ contact: raw })
    expect(tracked).not.toHaveProperty('contact')
  })

  it('strips a muxed Stellar address (M prefix)', () => {
    const raw = makeAddress('M')
    const tracked = trackProps({ wallet: raw })
    expect(tracked).not.toHaveProperty('wallet')
  })

  it('strips an email even under an unrecognised key', () => {
    const tracked = trackProps({ contact: 'somebody@example.com' })
    expect(tracked).not.toHaveProperty('contact')
  })

  it('strips an email nested inside an object under an unrecognised key', () => {
    const tracked = trackProps({ meta: { tenant: { supportEmail: 'nested@example.com' } } })
    expect(tracked).toEqual({ meta: { tenant: {} } })
  })

  it('removes PII-labelled keys even when the value is not an email/address', () => {
    const tracked = trackProps({ authToken: 'jwt-abc-123', ok: 5 })
    expect(tracked).not.toHaveProperty('authToken')
    expect(tracked.ok).toBe(5)
  })

  it('keeps clean primitives', () => {
    const tracked = trackProps({ plan: 'pro', seats: 3 })
    expect(tracked).toEqual({ plan: 'pro', seats: 3 })
  })
})

function makeAddress(prefix: 'G' | 'M'): string {
  return (prefix + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGM').slice(
    0,
    56,
  )
}

function tokenProps(seed: string): Record<string, unknown> {
  // 56-char G/M-prefixed Stellar-like addresses padded/trimmed to the regex shape.
  const built = (seed + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567').slice(0, 56)
  return { address: built, plan: 'pro' }
}