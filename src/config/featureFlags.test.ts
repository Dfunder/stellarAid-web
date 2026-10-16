import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Feature flag precedence (#796).
 *
 * Resolved flags live in module scope, so each case re-imports a fresh copy of
 * the module after stubbing the env it should read on load.
 */
function loadFeatureFlags() {
  vi.resetModules()
  return import('./featureFlags')
}

describe('feature flags (#796)', () => {
  beforeEach(() => {
    // The flags are only read when the rest of the config validates.
    vi.stubEnv('VITE_API_URL', 'http://localhost:4000')
    vi.stubEnv('VITE_STELLAR_NETWORK', 'testnet')
    vi.stubEnv('VITE_APP_URL', 'http://localhost:5173')
    vi.stubEnv('VITE_FF_MESSAGING', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('lets an env override beat the default', async () => {
    const { isFeatureEnabled } = await loadFeatureFlags()

    expect(isFeatureEnabled('messaging')).toBe(true)
    // No override supplied, so the `false` default still hides the feature.
    expect(isFeatureEnabled('notifications')).toBe(false)
  })

  it('lets a remote override beat the env override', async () => {
    const { isFeatureEnabled, setRemoteFeatureFlags } = await loadFeatureFlags()

    expect(isFeatureEnabled('messaging')).toBe(true)

    setRemoteFeatureFlags({ messaging: false })
    expect(isFeatureEnabled('messaging')).toBe(false)
  })

  it('ignores an unknown flag name', async () => {
    const { isFeatureEnabled, setRemoteFeatureFlags } = await loadFeatureFlags()

    setRemoteFeatureFlags({ messaging: true, notARealFlag: true })

    expect(isFeatureEnabled('messaging')).toBe(true)
    expect(isFeatureEnabled('notifications')).toBe(false)
  })

  it('does not accept an Object.prototype key as a flag', async () => {
    const { isFeatureEnabled, setRemoteFeatureFlags } = await loadFeatureFlags()

    // `'toString' in FLAG_DEFAULTS` is `true` — every prototype key is.
    setRemoteFeatureFlags({ toString: true, constructor: true, hasOwnProperty: true })

    expect(isFeatureEnabled('messaging')).toBe(true)
    expect(isFeatureEnabled('notifications')).toBe(false)
    expect(isFeatureEnabled('advancedFilters')).toBe(false)
  })

  it('ignores a non-boolean value', async () => {
    const { isFeatureEnabled, setRemoteFeatureFlags } = await loadFeatureFlags()

    setRemoteFeatureFlags({ messaging: 'true' })

    // Still the env override: the string never reached the resolver.
    expect(isFeatureEnabled('messaging')).toBe(true)
  })

  it('notifies subscribers on every change and stops after unsubscribing', async () => {
    const { isFeatureEnabled, setRemoteFeatureFlags, subscribeToFeatureFlags } =
      await loadFeatureFlags()
    const listener = vi.fn()
    const unsubscribe = subscribeToFeatureFlags(listener)

    setRemoteFeatureFlags({ messaging: false })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(isFeatureEnabled('messaging')).toBe(false)

    unsubscribe()
    setRemoteFeatureFlags({ messaging: true })
    expect(listener).toHaveBeenCalledTimes(1)
    expect(isFeatureEnabled('messaging')).toBe(true)
  })
})
