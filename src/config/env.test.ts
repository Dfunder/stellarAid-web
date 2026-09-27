import { describe, expect, it, vi } from 'vitest'

type EnvModule = typeof import('./env')

const VALID = {
  VITE_API_URL: 'https://api.example.com',
  VITE_STELLAR_NETWORK: 'mainnet',
  VITE_APP_URL: 'https://app.example.com',
} as const

/**
 * Applies the given `VITE_*` values, re-evaluates `env.ts` and returns it.
 *
 * `vi.stubEnv` writes through `process.env`, which is what `import.meta.env`
 * resolves to under Vitest, and `vi.resetModules()` forces a fresh evaluation of
 * the module so the boot-time `loadEnv()` call runs again.
 */
async function loadEnvWith(overrides: Record<string, string | undefined>): Promise<EnvModule> {
  vi.resetModules()
  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined) {
      vi.stubEnv(key, undefined as unknown as string)
    } else {
      vi.stubEnv(key, value)
    }
  }
  return import('./env')
}

function validOverrides(): Record<string, string | undefined> {
  return { ...VALID }
}

describe('env configuration', () => {
  it('loads a valid configuration without a config error', async () => {
    const mod = await loadEnvWith(validOverrides())

    expect(mod.loadResult.ok).toBe(true)
    expect(mod.configError).toBeNull()
    expect(mod.env).toEqual({
      ...VALID,
      VITE_FF_MESSAGING: undefined,
      VITE_FF_NOTIFICATIONS: undefined,
      VITE_FF_ADVANCED_FILTERS: undefined,
    })
  })

  it('reports a missing VITE_API_URL and never falls back to localhost', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_API_URL: undefined })

    expect(mod.loadResult.ok).toBe(false)
    expect(mod.configError).toContain('VITE_API_URL')
    expect(mod.configError).toContain('Missing variables')
    // The silent `http://localhost:4000` fallback is gone.
    expect(mod.configError).not.toContain('localhost:4000')
    expect(mod.env.VITE_API_URL).not.toBe('http://localhost:4000')
  })

  it('reports a missing VITE_STELLAR_NETWORK and never falls back to testnet', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_STELLAR_NETWORK: undefined })

    expect(mod.loadResult.ok).toBe(false)
    expect(mod.configError).toContain('VITE_STELLAR_NETWORK')
    expect(mod.configError).toContain('Missing variables')
    expect(mod.env.VITE_STELLAR_NETWORK).toBe('testnet')
  })

  it('rejects a plaintext http API URL', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_API_URL: 'http://api.example.com' })

    expect(mod.loadResult.ok).toBe(false)
    expect(mod.configError).toContain('VITE_API_URL')
    expect(mod.configError).toContain('https://')
  })

  it('rejects the previous localhost default as an API URL', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_API_URL: 'http://localhost:4000' })

    expect(mod.loadResult.ok).toBe(false)
    expect(mod.configError).toContain('VITE_API_URL')
  })

  it.each(['futurenet', 'public', 'TESTNET', 'mainnet ', ''])(
    'rejects %j as a Stellar network',
    async (network) => {
      const mod = await loadEnvWith({ ...validOverrides(), VITE_STELLAR_NETWORK: network })

      expect(mod.loadResult.ok).toBe(false)
      expect(mod.configError).toContain('VITE_STELLAR_NETWORK')
    },
  )

  it('accepts both allow-listed networks', async () => {
    for (const network of ['testnet', 'mainnet']) {
      const mod = await loadEnvWith({ ...validOverrides(), VITE_STELLAR_NETWORK: network })

      expect(mod.loadResult.ok).toBe(true)
      expect(mod.env.VITE_STELLAR_NETWORK).toBe(network)
    }
  })

  it('names every failing variable in a single message', async () => {
    const mod = await loadEnvWith({
      VITE_API_URL: 'http://api.example.com',
      VITE_STELLAR_NETWORK: 'futurenet',
      VITE_APP_URL: 'https://app.example.com',
    })

    expect(mod.loadResult.ok).toBe(false)
    expect(mod.configError).toContain('VITE_API_URL')
    expect(mod.configError).toContain('VITE_STELLAR_NETWORK')
    // Valid variables are not reported.
    expect(mod.configError).not.toContain('VITE_APP_URL')
  })

  it('explains only the rules for variables that actually failed', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_STELLAR_NETWORK: 'futurenet' })

    expect(mod.configError).toContain('VITE_STELLAR_NETWORK must be one of')
    // Nothing is wrong with the API URL in this scenario, so do not mention it.
    expect(mod.configError).not.toContain('https:// URL (http:// is not allowed)')
  })

  it('treats a missing VITE_APP_URL as a configuration error too', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_APP_URL: undefined })

    expect(mod.loadResult.ok).toBe(false)
    expect(mod.configError).toContain('VITE_APP_URL')
  })

  it('validates the same way when the build is not a dev build', async () => {
    // Regression guard: validation used to be skipped entirely outside dev, so a
    // production build silently accepted a missing/!https API URL.
    vi.stubEnv('DEV', false)
    const mod = await loadEnvWith({ ...validOverrides(), VITE_API_URL: 'http://api.example.com' })

    expect(mod.loadResult.ok).toBe(false)
    expect(mod.configError).toContain('VITE_API_URL')
  })

  it('never throws while loading an invalid configuration', async () => {
    await expect(
      loadEnvWith({
        VITE_API_URL: undefined,
        VITE_STELLAR_NETWORK: undefined,
        VITE_APP_URL: undefined,
      }),
    ).resolves.toBeDefined()
  })

  it('keeps the placeholder env unroutable when configuration is invalid', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_API_URL: undefined })

    // Must stay a valid URL for `services/http.ts`, which builds its axios
    // client at module scope, but must never resolve to a real host.
    expect(mod.env.VITE_API_URL).toMatch(/^https:\/\//)
    expect(mod.env.VITE_API_URL).toContain('.invalid')
  })

  it('falls back to the flag default for unparseable feature-flag overrides', async () => {
    const mod = await loadEnvWith({ ...validOverrides(), VITE_FF_MESSAGING: 'maybe' })

    expect(mod.loadResult.ok).toBe(true)
    expect(mod.env.VITE_FF_MESSAGING).toBeUndefined()
  })

  it('parses valid feature-flag overrides', async () => {
    const mod = await loadEnvWith({
      ...validOverrides(),
      VITE_FF_MESSAGING: 'true',
      VITE_FF_NOTIFICATIONS: 'false',
    })

    expect(mod.loadResult.ok).toBe(true)
    expect(mod.env.VITE_FF_MESSAGING).toBe(true)
    expect(mod.env.VITE_FF_NOTIFICATIONS).toBe(false)
  })
})
