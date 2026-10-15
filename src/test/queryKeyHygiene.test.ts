import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_DIR = resolve(__dirname, '..')

function listSourceFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...listSourceFiles(full))
    else if (/\.(ts|tsx)$/.test(entry.name) && !/\.test\.(ts|tsx)$/.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

/**
 * Raw cache keys that must never be hand-declared again (#802). Before the
 * fix, two components wrote different return shapes under one literal key,
 * so React Query served mismatched data between them.
 */
const FORBIDDEN_RAW_KEYS = ['walletBalances', 'linkedWallets'] as const

describe('query-key hygiene (#802)', () => {
  it('never reintroduces the raw colliding keys', () => {
    const offenders: string[] = []
    for (const file of listSourceFiles(SRC_DIR)) {
      const source = readFileSync(file, 'utf8')
      for (const key of FORBIDDEN_RAW_KEYS) {
        // Only real declarations count — doc comments mentioning the old key are fine.
        const pattern = new RegExp(`queryKey:\\s*\\[\\s*['"\`]${key}['"\`]`)
        if (pattern.test(source)) {
          offenders.push(`${relative(SRC_DIR, file)} declares raw key '${key}'`)
        }
      }
    }
    expect(offenders, 'use the queryKeys factories instead').toEqual([])
  })

  it('serves wallet balances from one hook with one shape', () => {
    const hook = readFileSync(join(SRC_DIR, 'features/payments/useWalletBalances.ts'), 'utf8')
    expect(hook).toContain('paymentKeys.walletBalances(publicKey)')

    // Both former duplicate call sites must go through the shared hook.
    const display = readFileSync(
      join(SRC_DIR, 'features/payments/WalletBalanceDisplay.tsx'),
      'utf8',
    )
    const selector = readFileSync(
      join(SRC_DIR, 'features/payments/PaymentAssetSelector.tsx'),
      'utf8',
    )
    expect(display).toContain('useWalletBalances(')
    expect(selector).toContain('useWalletBalances(')
    // …and must not declare their own balance shapes anymore.
    expect(display).not.toMatch(/interface\s+WalletBalance\b/)
    expect(selector).not.toMatch(/interface\s+WalletBalance\b/)
  })

  it('reads linked wallets through the auth factory', () => {
    const withdrawal = readFileSync(
      join(SRC_DIR, 'features/portfolio/ArtistWithdrawal.tsx'),
      'utf8',
    )
    expect(withdrawal).toContain('authKeys.linkedWallets()')

    const linkedWalletsHook = readFileSync(
      join(SRC_DIR, 'features/auth/hooks/useLinkedWallets.ts'),
      'utf8',
    )
    expect(linkedWalletsHook).toContain('authKeys.linkedWallets()')
  })
})
