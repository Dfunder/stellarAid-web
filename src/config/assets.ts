export const assetPrecision = {
  XLM: 7,
  USDC: 7,
  NGNT: 7,
} as const;

export type KnownAssetCode = keyof typeof assetPrecision;

export const defaultAssetPrecision = 7;

export function getAssetPrecision(asset: string): number {
  return assetPrecision[asset as KnownAssetCode] ?? defaultAssetPrecision;
}
