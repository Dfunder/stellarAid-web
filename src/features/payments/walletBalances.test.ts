import { describe, expect, it } from 'vitest'

import { sumByAsset, type AssetBalance } from './walletBalances'

function balance(asset: string, amount: string): AssetBalance {
  return { asset, balance: amount, hasTrustline: true }
}

describe('sumByAsset (#799)', () => {
  it('never sums balances held in different assets into one total', () => {
    const totals = sumByAsset([
      balance('XLM', '10'),
      balance('USDC', '5'),
      balance('NGNT', '1500'),
    ])

    expect(totals).toEqual({ XLM: 10, USDC: 5, NGNT: 1500 })
    // A single number of 1515 would be money in no currency at all.
    expect(Object.values(totals)).not.toContain(1515)
  })

  it('totals repeated balances of the same asset', () => {
    expect(sumByAsset([balance('USDC', '2.5'), balance('USDC', '0.5')])).toEqual({ USDC: 3 })
  })

  it('skips an unparseable balance instead of returning NaN', () => {
    const totals = sumByAsset([balance('XLM', '10'), balance('XLM', 'not-a-number')])

    expect(totals).toEqual({ XLM: 10 })
    expect(Number.isNaN(totals.XLM)).toBe(false)
  })

  it('returns no totals when there are no balances', () => {
    expect(sumByAsset([])).toEqual({})
  })
})
