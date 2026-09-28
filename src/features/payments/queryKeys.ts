export const paymentKeys = {
  all: ['payments'] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  walletBalances: (publicKey: string) => ['wallet', publicKey, 'balances'] as const,
  selectableAssets: (publicKey: string) => ['wallet', publicKey, 'selectable-assets'] as const,
}
