/**
 * Asset metadata for the payment, pricing and withdrawal surfaces.
 *
 * Single source of truth replacing the five drifting module-level copies
 * (PaymentAssetSelector, WalletBalanceDisplay, MultiAssetPricingInput,
 * ArtistWithdrawal). All values are keyed by asset code and nullable access
 * is explicit - callers must decide what to render for unknown codes instead
 * of silently falling back to a permissive default.
 */

export interface AssetMeta {
  code: string
  label: string
  symbol: string
  precision: number
  minWithdrawal: string
  withdrawalFee: string
  conversionRate: number
}

const ASSETS: Record<string, AssetMeta> = {
  XLM: {
    code: 'XLM',
    label: 'XLM (Native)',
    symbol: '\u2726',
    precision: 7,
    minWithdrawal: '0.0000001',
    withdrawalFee: '0.00001',
    conversionRate: 1,
  },
  USDC: {
    code: 'USDC',
    label: 'USDC',
    symbol: '$',
    precision: 2,
    minWithdrawal: '1.00',
    withdrawalFee: '0.50',
    conversionRate: 0.1,
  },
  NGNT: {
    code: 'NGNT',
    label: 'NGNT',
    symbol: '\u20A6',
    precision: 2,
    minWithdrawal: '100.00',
    withdrawalFee: '50.00',
    conversionRate: 150,
  },
  EURC: {
    code: 'EURC',
    label: 'EURC',
    symbol: '\u20AC',
    precision: 2,
    minWithdrawal: '1.00',
    withdrawalFee: '0.50',
    conversionRate: 0.09,
  },
}

/** Supported asset codes, e.g. `['XLM', 'USDC', 'NGNT', 'EURC']`. */
export const ASSET_CODES = Object.keys(ASSETS)

/** Returns metadata for a known asset code, or `null` for unknown codes. */
export function getAssetMeta(code: string | undefined | null): AssetMeta | null {
  if (!code) return null
  return ASSETS[code] ?? null
}

/** Convenience accessors kept for callers that only need one value. */
export const getAssetPrecision = (code: string | undefined | null): number | null =>
  getAssetMeta(code)?.precision ?? null
export const getAssetLabel = (code: string | undefined | null): string | null =>
  getAssetMeta(code)?.label ?? null
export const getAssetSymbol = (code: string | undefined | null): string | null =>
  getAssetMeta(code)?.symbol ?? null
export const getMinWithdrawal = (code: string | undefined | null): string | null =>
  getAssetMeta(code)?.minWithdrawal ?? null
export const getWithdrawalFee = (code: string | undefined | null): string | null =>
  getAssetMeta(code)?.withdrawalFee ?? null
export const getConversionRate = (code: string | undefined | null): number | null =>
  getAssetMeta(code)?.conversionRate ?? null