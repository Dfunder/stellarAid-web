import { describe, expect, it } from 'vitest'
import { paymentKeys } from './queryKeys'
import { authKeys } from '@/features/auth/queryKeys'

const PUBLIC_KEY = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ12345678901234567890'

describe('query key uniqueness', () => {
  it('keeps wallet balances distinct from selectable assets for the same address', () => {
    expect(paymentKeys.walletBalances(PUBLIC_KEY)).not.toEqual(paymentKeys.selectableAssets(PUBLIC_KEY))
  })

  it('scopes payment keys per public key so two wallets never collide', () => {
    const other = `${PUBLIC_KEY.slice(0, -1)}X`
    expect(paymentKeys.walletBalances(PUBLIC_KEY)).not.toEqual(paymentKeys.walletBalances(other))
    expect(paymentKeys.selectableAssets(PUBLIC_KEY)).not.toEqual(paymentKeys.selectableAssets(other))
  })

  it('does not collide with other feature factories', () => {
    const keys = [
      paymentKeys.walletBalances(PUBLIC_KEY),
      paymentKeys.selectableAssets(PUBLIC_KEY),
      authKeys.linkedWallets(),
      authKeys.session(),
    ]
    const serialized = keys.map((key) => JSON.stringify(key))
    expect(new Set(serialized).size).toBe(serialized.length)
  })
})