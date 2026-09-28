import { describe, it, expect } from 'vitest'
import {
  ASSET_CODES,
  getAssetMeta,
  getAssetPrecision,
  getAssetLabel,
  getAssetSymbol,
  getMinWithdrawal,
  getWithdrawalFee,
  getConversionRate,
} from './assets'

describe('asset metadata', () => {
  it('exposes the four supported asset codes', () => {
    expect(ASSET_CODES.sort()).toEqual(['EURC', 'NGNT', 'USDC', 'XLM'].sort())
  })

  it('returns full metadata for known assets', () => {
    const xlm = getAssetMeta('XLM')
    expect(xlm).toMatchObject({
      code: 'XLM',
      label: 'XLM (Native)',
      symbol: '\u2726',
      precision: 7,
      minWithdrawal: '0.0000001',
      withdrawalFee: '0.00001',
      conversionRate: 1,
    })
  })

  it('narrows unknown codes to null instead of a permissive fallback', () => {
    expect(getAssetMeta('FOO')).toBeNull()
    expect(getAssetMeta(undefined)).toBeNull()
    expect(getAssetMeta('')).toBeNull()
  })

  it('convenience accessors mirror the record', () => {
    expect(getAssetPrecision('USDC')).toBe(2)
    expect(getAssetLabel('NGNT')).toBe('NGNT')
    expect(getAssetSymbol('EURC')).toBe('\u20AC')
    expect(getMinWithdrawal('USDC')).toBe('1.00')
    expect(getWithdrawalFee('NGNT')).toBe('50.00')
    expect(getConversionRate('EURC')).toBe(0.09)
  })

  it('convenience accessors return null for unknown codes', () => {
    expect(getAssetPrecision('FOO')).toBeNull()
    expect(getAssetLabel('FOO')).toBeNull()
    expect(getMinWithdrawal('FOO')).toBeNull()
    expect(getConversionRate('FOO')).toBeNull()
  })
})