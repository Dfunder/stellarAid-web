export const paymentKeys = {
  all: ['payments'] as const,
  detail: (id: string) => [...paymentKeys.all, 'detail', id] as const,
  walletBalances: (publicKey: string | null) =>
    [...paymentKeys.all, 'wallet-balances', publicKey] as const,
}
