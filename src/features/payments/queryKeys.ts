export const paymentKeys = {
  all: ['payments'] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  /** Raw wallet balances, keyed by the connected Stellar public key. */
  walletBalances: (publicKey: string) => [...paymentKeys.all, 'wallet', publicKey, 'balances'] as const,
  /** Asset balances reshaped for the payment selector, keyed by public key. */
  selectableAssets: (publicKey: string) => [...paymentKeys.all, 'wallet', publicKey, 'selectable-assets'] as const,
}
