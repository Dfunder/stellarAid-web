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

export type StellarNetwork = "testnet" | "public";

export type SupportedAsset = {
  code: KnownAssetCode;
  /** Issuer account ID. Undefined for the native asset (XLM). */
  issuer?: string;
  native: boolean;
  precision: number;
  network: StellarNetwork;
};

// Issuers are network specific: a testnet issuer must never be reused on
// mainnet. USDC and NGNT issuers are intentionally not set yet; they must be
// filled in per network from the issuers' published account IDs.
export const supportedAssets: readonly SupportedAsset[] = [
  {
    code: "XLM",
    native: true,
    precision: assetPrecision.XLM,
    network: "testnet",
  },
  {
    code: "USDC",
    native: false,
    precision: assetPrecision.USDC,
    network: "testnet",
  },
  {
    code: "NGNT",
    native: false,
    precision: assetPrecision.NGNT,
    network: "testnet",
  },
];

export function getAssetConfig(
  code: string,
  issuer?: string,
): SupportedAsset | undefined {
  return supportedAssets.find(
    (asset) =>
      asset.code === code && (asset.native || asset.issuer === issuer),
  );
}

export function isSupportedAsset(code: string, issuer?: string): boolean {
  return getAssetConfig(code, issuer) !== undefined;
}
