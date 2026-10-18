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
    const src = readFileSync(
      join(__dirname, '../useWalletAuth.ts'),
      'utf8',
    )
    expect(src).not.toMatch(/fallbackNonce/)
    expect(src).not.toMatch(/lumora-auth-nonce-/)
    expect(src).toMatch(/requestWalletNonce/)
  })
})
