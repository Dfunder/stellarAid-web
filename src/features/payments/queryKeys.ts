export const paymentKeys = {
  all: ['payments'] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  /**
   * Wallet-scoped keys, namespaced per public key.
   *
   * `WalletBalanceDisplay` and `PaymentAssetSelector` used to share a single
   * `['walletBalances', publicKey]` entry even though they return different
   * shapes, so whichever mounted first poisoned the cache for the other (#853).
   * Distinct sub-keys keep the two queries independent and cache-safe.
   */
  wallet: (publicKey: string | null | undefined) =>
    [...paymentKeys.all, 'wallet', publicKey] as const,
  /** Raw `AssetBalance[]` for the balance display. */
  walletBalances: (publicKey: string | null | undefined) =>
    [...paymentKeys.wallet(publicKey), 'balances'] as const,
  /** Selector model (asset + balance + trustline) for the checkout asset picker. */
  selectableAssets: (publicKey: string | null | undefined) =>
    [...paymentKeys.wallet(publicKey), 'selectable-assets'] as const,
}
