import { describe, expect, it } from 'vitest'
import { paymentKeys } from './queryKeys'

/**
 * #853 — the balance display and the asset selector used to share the exact
 * key `['walletBalances', publicKey]` while returning different shapes, so
 * whichever query resolved first poisoned the cache for the other. These keys
 * must never collide again.
 */
describe('paymentKeys wallet keys (#853)', () => {
  const key = 'G-ABCDEF'

  it('gives the two wallet queries distinct keys', () => {
    expect(paymentKeys.walletBalances(key)).not.toEqual(paymentKeys.selectableAssets(key))
  })

  it('namespaces both keys under the same wallet for the same public key', () => {
    expect(paymentKeys.walletBalances(key).slice(0, 3)).toEqual(
      paymentKeys.selectableAssets(key).slice(0, 3),
    )
    expect(paymentKeys.walletBalances(key)).toEqual([...paymentKeys.wallet(key), 'balances'])
    expect(paymentKeys.selectableAssets(key)).toEqual([
      ...paymentKeys.wallet(key),
      'selectable-assets',
    ])
  })

  it('isolates wallets from one another', () => {
    expect(paymentKeys.walletBalances(key)).not.toEqual(paymentKeys.walletBalances('G-OTHER'))
  })
})
