/**
 * Single source of truth for supported Stellar asset metadata. Anything that
 * needs an asset's precision, label, symbol, withdrawal limits or example
 * conversion rate reads it from here instead of keeping a local copy.
 */
export interface AssetMeta {
  code: string
  /** Display label, e.g. `XLM (Native)`. */
  label: string
  /** Currency symbol shown before amounts. */
  symbol: string
  /** Number of decimal places an amount in this asset may have. */
  precision: number
  /** Smallest amount that can be withdrawn, as a decimal string. */
  minWithdrawal: string
  /** Flat withdrawal fee, as a decimal string. */
  withdrawalFee: string
  /** Example conversion rate relative to 1 XLM (placeholder until a rates service exists). */
  conversionRate: number
}

export const ASSETS = {
  XLM: {
    code: 'XLM',
    label: 'XLM (Native)',
    symbol: '✦',
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
    conversionRate: 0.1, // 10 XLM = 1 USDC (example rate)
  },
  NGNT: {
    code: 'NGNT',
    label: 'NGNT',
    symbol: '₦',
    precision: 2,
    minWithdrawal: '100.00',
    withdrawalFee: '50.00',
    conversionRate: 150, // 1 XLM = 150 NGNT (example rate)
  },
  EURC: {
    code: 'EURC',
    label: 'EURC',
    symbol: '€',
    precision: 2,
    minWithdrawal: '1.00',
    withdrawalFee: '0.50',
    conversionRate: 0.09, // 1 XLM = 0.09 EURC (example rate)
  },
} as const satisfies Record<string, AssetMeta>

export type SupportedAssetCode = keyof typeof ASSETS

/** Precision used only to *display* an amount in an asset this app does not know about. */
export const DISPLAY_FALLBACK_PRECISION = 7

export function isSupportedAsset(code: string): code is SupportedAssetCode {
  return Object.prototype.hasOwnProperty.call(ASSETS, code)
}

/**
 * Metadata for an asset code, or `null` when the asset is not supported.
 * Unknown codes are never given permissive defaults; callers decide how to handle `null`
 * (display code can fall back to the raw code, money-moving code must refuse).
 */
export function getAssetMeta(code: string): AssetMeta | null {
  return isSupportedAsset(code) ? ASSETS[code] : null
}
