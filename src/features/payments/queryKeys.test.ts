import { describe, expect, it } from 'vitest'
import { paymentKeys } from '@/features/payments/queryKeys'
import { orderKeys } from '@/features/orders/queryKeys'
import { transactionKeys } from '@/features/transactions/queryKeys'
import { authKeys } from '@/features/auth/queryKeys'

const PUBLIC_KEY = 'GABCDEFGHIJKLMNOPQRSTUVWXYZ234567ABCDEFGHIJKLMNOPQ'

/**
 * Guards against cache poisoning: two queries that share a single key but
 * return different shapes (e.g. the `['walletBalances', publicKey]` collision
 * between WalletBalanceDisplay and PaymentAssetSelector). If someone
 * reintroduces a duplicate, one of these assertions fails.
 */
describe('query key uniqueness', () => {
  it('keeps wallet balance and selectable-asset keys distinct', () => {
    const balances = paymentKeys.walletBalances(PUBLIC_KEY)
    const selectable = paymentKeys.selectableAssets(PUBLIC_KEY)
    expect(balances).not.toEqual(selectable)
    expect(balances).toContain('balances')
    expect(selectable).toContain('selectable-assets')
  })

  it('keeps wallet balance keys distinct across features', () => {
    const paymentKey = paymentKeys.walletBalances(PUBLIC_KEY)
    const allKeys = [
      orderKeys.detail('x'),
      transactionKeys.detail('x'),
      authKeys.linkedWallets(),
      ['walletBalances', PUBLIC_KEY],
      ['linkedWallets'],
    ]
    expect(allKeys.some((key) => JSON.stringify(key) === JSON.stringify(paymentKey))).toBe(false)
  })

  it('keeps auth-linked-wallet keys distinct from payment keys', () => {
    const linked = authKeys.linkedWallets()
    expect(linked).not.toEqual(paymentKeys.walletBalances(PUBLIC_KEY))
    expect(linked).not.toEqual(paymentKeys.selectableAssets(PUBLIC_KEY))
  })

  it('keeps amount queries (balances/history) distinct from wallet queries', () => {
    const amountKeys = [
      ['artistBalances', 'user-1'],
      ['withdrawalHistory', 'user-1'],
    ]
    const walletKeys = [
      paymentKeys.walletBalances(PUBLIC_KEY),
      paymentKeys.selectableAssets(PUBLIC_KEY),
    ]
    for (const a of amountKeys) {
      for (const w of walletKeys) {
        expect(JSON.stringify(a)).not.toBe(JSON.stringify(w))
      }
    }
  })
})