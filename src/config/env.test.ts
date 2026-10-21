import { afterEach, describe, expect, it, vi } from 'vitest'
import { REQUIRED_ENV_KEYS, validateEnv, type RawEnv } from './env'

const validProductionEnv: RawEnv = {
  VITE_API_URL: 'https://api.lumora.art',
  VITE_STELLAR_NETWORK: 'mainnet',
  VITE_APP_URL: 'https://lumora.art',
}

/** Production runs log config failures; keep that noise out of the test output. */
function silenceConsoleError() {
  return vi.spyOn(console, 'error').mockImplementation(() => {})
}

const production = (raw: RawEnv) => validateEnv(raw, { isProduction: true })
const development = (raw: RawEnv) => validateEnv(raw, { isProduction: false })

afterEach(() => {
  vi.restoreAllMocks()
})

describe('env validation (#997)', () => {
  it('lists the variables a build cannot run without', () => {
    expect(REQUIRED_ENV_KEYS).toEqual(['VITE_API_URL', 'VITE_STELLAR_NETWORK', 'VITE_APP_URL'])
  })

  it('accepts a complete production configuration', () => {
    const result = production(validProductionEnv)

    expect(result.configError).toBeNull()
    expect(result.invalidKeys).toEqual([])
    expect(result.env).toEqual({
      VITE_API_URL: 'https://api.lumora.art',
      VITE_STELLAR_NETWORK: 'mainnet',
      VITE_APP_URL: 'https://lumora.art',
      VITE_FF_MESSAGING: undefined,
      VITE_FF_NOTIFICATIONS: undefined,
      VITE_FF_ADVANCED_FILTERS: undefined,
    })
  })

  it('fails closed when production variables are missing', () => {
    silenceConsoleError()

    const result = production({})

    expect(result.configError).toMatch(/Invalid environment configuration/)
    for (const key of REQUIRED_ENV_KEYS) {
      expect(result.configError).toContain(key)
    }
    expect(result.invalidKeys).toEqual([...REQUIRED_ENV_KEYS])
    // The app still renders against a shaped, unusable config instead of crashing.
    expect(Object.keys(result.env)).toEqual(expect.arrayContaining([...REQUIRED_ENV_KEYS]))
  })

  it('names only the missing variable', () => {
    silenceConsoleError()

    const result = production({
      VITE_API_URL: validProductionEnv.VITE_API_URL,
      VITE_STELLAR_NETWORK: validProductionEnv.VITE_STELLAR_NETWORK,
    })

    expect(result.invalidKeys).toEqual(['VITE_APP_URL'])
    expect(result.configError).toContain('Missing variables')
    expect(result.configError).toContain('VITE_APP_URL')
    expect(result.configError).not.toContain('VITE_API_URL')
  })

  it('rejects a network outside testnet and mainnet', () => {
    silenceConsoleError()

    const result = production({ ...validProductionEnv, VITE_STELLAR_NETWORK: 'regtest' })

    expect(result.invalidKeys).toEqual(['VITE_STELLAR_NETWORK'])
    expect(result.configError).toContain('Invalid values')
  })

  it('rejects a plain-HTTP API URL in production so tokens never travel in the clear', () => {
    silenceConsoleError()

    const result = production({ ...validProductionEnv, VITE_API_URL: 'http://api.lumora.art' })

    expect(result.invalidKeys).toEqual(['VITE_API_URL'])
    expect(result.configError).toMatch(/https:\/\//)
  })

  it('rejects a whitespace-only API URL', () => {
    silenceConsoleError()

    const result = production({ ...validProductionEnv, VITE_API_URL: '   ' })

    expect(result.invalidKeys).toEqual(['VITE_API_URL'])
  })

  it('applies localhost defaults only outside production', () => {
    expect(development({})).toMatchObject({
      configError: null,
      invalidKeys: [],
      env: {
        VITE_API_URL: 'http://localhost:4000',
        VITE_STELLAR_NETWORK: 'testnet',
        VITE_APP_URL: 'http://localhost:5173',
      },
    })

    silenceConsoleError()
    expect(production({}).configError).not.toBeNull()
  })

  it('does not let development defaults mask an invalid supplied value', () => {
    silenceConsoleError()

    const result = development({ VITE_STELLAR_NETWORK: 'regtest' })

    expect(result.configError).not.toBeNull()
    expect(result.invalidKeys).toEqual(['VITE_STELLAR_NETWORK'])
  })

  it('parses feature-flag overrides and treats other values as unset', () => {
    const result = production({
      ...validProductionEnv,
      VITE_FF_MESSAGING: 'true',
      VITE_FF_NOTIFICATIONS: 'maybe',
      VITE_FF_ADVANCED_FILTERS: 'false',
    })

    expect(result.configError).toBeNull()
    expect(result.env.VITE_FF_MESSAGING).toBe(true)
    expect(result.env.VITE_FF_NOTIFICATIONS).toBeUndefined()
    expect(result.env.VITE_FF_ADVANCED_FILTERS).toBe(false)
  })
})
