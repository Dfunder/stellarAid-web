import { useQuery } from '@tanstack/react-query'
import { http } from '@/services'
import { paymentKeys } from './queryKeys'

/**
 * One shape for the balance payload (#802): `WalletBalanceDisplay` and
 * `PaymentAssetSelector` previously declared two divergent interfaces under
 * the same `['walletBalances', …]` cache key.
 */
export interface WalletBalance {
  asset: string
  balance: string
  hasTrustline: boolean
  trustlineLimit?: string
}

/**
 * The single wallet-balances query: one key (from the payments factory) and
 * one return shape, so the cache can never be written by two different
 * query functions under the same key.
 */
export function useWalletBalances(publicKey: string | null) {
  return useQuery({
    queryKey: paymentKeys.walletBalances(publicKey),
    queryFn: async (): Promise<WalletBalance[]> => {
      if (!publicKey) return []
      const response = await http.get<{ balances: WalletBalance[] }>(`/wallets/${publicKey}/balances`)
      return response.balances
    },
    enabled: !!publicKey,
    refetchOnWindowFocus: true,
  })
}
