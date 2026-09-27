import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import ConfigErrorScreen from './ConfigErrorScreen'

/**
 * Renders the screen with a real `configError` produced by `config/env.ts`, so the
 * boot path in `main.tsx` is covered without needing a DOM implementation.
 */
async function renderScreenFor(overrides: Record<string, string | undefined>): Promise<string> {
  vi.resetModules()
  for (const [key, value] of Object.entries(overrides)) {
    vi.stubEnv(key, value as string)
  }

  const { configError } = await import('@/config/env')
  if (configError === null) throw new Error('expected an invalid configuration')

  return renderToStaticMarkup(<ConfigErrorScreen message={configError} />)
}

const VALID = {
  VITE_API_URL: 'https://api.example.com',
  VITE_STELLAR_NETWORK: 'mainnet',
  VITE_APP_URL: 'https://app.example.com',
} as const

describe('ConfigErrorScreen', () => {
  it('lists VITE_API_URL when it is missing', async () => {
    const html = await renderScreenFor({ ...VALID, VITE_API_URL: undefined })

    expect(html).toContain('Invalid environment configuration')
    expect(html).toContain('VITE_API_URL')
    expect(html).toContain('Missing variables')
  })

  it('lists VITE_STELLAR_NETWORK when it is missing', async () => {
    const html = await renderScreenFor({ ...VALID, VITE_STELLAR_NETWORK: undefined })

    expect(html).toContain('VITE_STELLAR_NETWORK')
    expect(html).toContain('Missing variables')
  })

  it('explains that a plaintext http API URL is rejected', async () => {
    const html = await renderScreenFor({ ...VALID, VITE_API_URL: 'http://api.example.com' })

    expect(html).toContain('VITE_API_URL')
    expect(html).toContain('https://')
  })

  it('explains which Stellar networks are accepted', async () => {
    const html = await renderScreenFor({ ...VALID, VITE_STELLAR_NETWORK: 'futurenet' })

    expect(html).toContain('VITE_STELLAR_NETWORK')
    expect(html).toContain('testnet')
    expect(html).toContain('mainnet')
  })
})
