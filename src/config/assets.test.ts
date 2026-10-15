import { describe, expect, it } from 'vitest'
import { ASSETS, getAssetMeta, isSupportedAsset } from './assets'

describe('asset config', () => {
  it('defines complete metadata for every supported asset', () => {
    for (const [code, meta] of Object.entries(ASSETS)) {
      expect(meta.code).toBe(code)
      expect(meta.label).not.toBe('')
      expect(meta.symbol).not.toBe('')
      expect(Number.isInteger(meta.precision)).toBe(true)
      expect(Number.isFinite(parseFloat(meta.minWithdrawal))).toBe(true)
      expect(Number.isFinite(parseFloat(meta.withdrawalFee))).toBe(true)
      expect(meta.conversionRate).toBeGreaterThan(0)
    }
  })

  it('keeps XLM at 7 decimals and the others at 2', () => {
    expect(ASSETS.XLM.precision).toBe(7)
    expect(ASSETS.USDC.precision).toBe(2)
  })

  it('returns metadata for a supported asset', () => {
    expect(getAssetMeta('USDC')?.symbol).toBe('$')
  })

  it('returns null, not permissive defaults, for an unknown asset', () => {
    expect(getAssetMeta('DOGE')).toBeNull()
    expect(getAssetMeta('toString')).toBeNull()
    expect(isSupportedAsset('DOGE')).toBe(false)
  })
})
