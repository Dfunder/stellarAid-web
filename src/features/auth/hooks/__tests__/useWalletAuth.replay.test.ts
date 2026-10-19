import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Static regression guard for #934 — client-side nonce fallback must never return.
 * Replay protection depends on server-issued nonces (and Stellar sequence numbers
 * for on-chain ops); a local `lumora-auth-nonce-…` string is not a secure nonce.
 */
describe('useWalletAuth replay protection (#934)', () => {
  it('does not contain a client-side nonce fallback', () => {
    const src = readFileSync(join(__dirname, '../useWalletAuth.ts'), 'utf8')
    expect(src).not.toMatch(/fallbackNonce/)
    expect(src).not.toMatch(/lumora-auth-nonce-/)
    expect(src).toMatch(/requestWalletNonce/)
  })

  it('requests the challenge once and signs only the server-issued value', () => {
    const src = readFileSync(join(__dirname, '../useWalletAuth.ts'), 'utf8')

    // Exactly one nonce request: a retry/fallback block would issue a second
    // challenge the backend never recorded.
    expect(src.match(/requestWalletNonce\(/g)).toHaveLength(1)
    // The signature must cover the server challenge, never a local string.
    expect(src).toMatch(/signWithConnectedWallet\(nonceData\.challenge\)/)
    // No locally synthesised nonce construction.
    expect(src).not.toMatch(/`[^`]*nonce[^`]*\$\{/i)
  })

  it('rejects an expired challenge before signing', () => {
    const src = readFileSync(join(__dirname, '../useWalletAuth.ts'), 'utf8')

    expect(src).toMatch(/expiresAt/)
    expect(src).toMatch(/challenge has expired/)
  })
})
