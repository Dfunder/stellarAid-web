import { describe, expect, it } from 'vitest'
import { parseEnv, STELLAR_NETWORK_PASSPHRASES } from './env'

describe('parseEnv (development)', () => {
  it('applies localhost and testnet defaults when values are missing', () => {
    const { env, configError } = parseEnv({}, true)
    expect(configError).toBeNull()
    expect(env.VITE_API_URL).toBe('http://localhost:4000')
    expect(env.VITE_STELLAR_NETWORK).toBe('testnet')
    expect(env.VITE_APP_URL).toBe('http://localhost:5173')
  })

  it('rejects an invalid network value even in dev', () => {
    const { configError } = parseEnv({ VITE_STELLAR_NETWORK: 'marsnet' }, true)
    expect(configError).not.toBeNull()
    expect(configError).toContain('VITE_STELLAR_NETWORK')
  })
})

describe('parseEnv (production)', () => {
  it('fails closed when VITE_API_URL is missing', () => {
    const { env, configError } = parseEnv({}, false)
    expect(configError).not.toBeNull()
    expect(configError).toContain('VITE_API_URL')
    expect(configError).not.toContain('http://localhost:4000')
    expect(env.VITE_API_URL).toBe('https://api.invalid')
  })

  it('fails closed when VITE_STELLAR_NETWORK is missing', () => {
    const { configError } = parseEnv({ VITE_API_URL: 'https://api.example.com' }, false)
    expect(configError).not.toBeNull()
    expect(configError).toContain('VITE_STELLAR_NETWORK')
  })

  it('rejects an http:// VITE_API_URL', () => {
    const { configError } = parseEnv(
      { VITE_API_URL: 'http://api.example.com', VITE_STELLAR_NETWORK: 'mainnet' },
      false,
    )
    expect(configError).not.toBeNull()
    expect(configError).toContain('https')
  })

  it('rejects an http:// VITE_APP_URL', () => {
    const { configError } = parseEnv(
      { VITE_API_URL: 'https://api.example.com', VITE_STELLAR_NETWORK: 'mainnet' },
      false,
    )
    expect(configError).not.toBeNull()
    expect(configError).toContain('VITE_APP_URL')
  })

  it('accepts a valid production configuration', () => {
    const { env, configError } = parseEnv(
      {
        VITE_API_URL: 'https://api.example.com',
        VITE_STELLAR_NETWORK: 'mainnet',
        VITE_APP_URL: 'https://app.example.com',
      },
      false,
    )
    expect(configError).toBeNull()
    expect(env.VITE_API_URL).toBe('https://api.example.com')
    expect(env.VITE_STELLAR_NETWORK).toBe('mainnet')
  })

  it('rejects garbage that is not a URL at all', () => {
    const { configError } = parseEnv(
      { VITE_API_URL: 'not a url', VITE_STELLAR_NETWORK: 'mainnet', VITE_APP_URL: 'https://app.example.com' },
      false,
    )
    expect(configError).not.toBeNull()
    expect(configError).toContain('VITE_API_URL')
  })
})

describe('passphrase allow-list', () => {
  it('contains the canonical testnet and mainnet passphrases', () => {
    expect(STELLAR_NETWORK_PASSPHRASES.testnet).toBe('Test SDF Network ; September 2015')
    expect(STELLAR_NETWORK_PASSPHRASES.mainnet).toBe('Public Global Stellar Network ; September 2015')
  })
})