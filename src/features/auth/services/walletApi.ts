import { http } from '@/services'
import type { LinkWalletPayload, LinkedWallet, WalletChallenge } from '../types'

/**
 * Linked-wallet endpoints.
 *
 * Linking is a two-step proof of ownership: the backend issues a challenge, the
 * wallet signs it, and only the `{ publicKey, signedChallenge }` pair is stored.
 */
export const walletApi = {
  list(): Promise<{ wallets: LinkedWallet[] }> {
    return http.get<{ wallets: LinkedWallet[] }>('/wallets')
  },

  requestChallenge(publicKey: string): Promise<WalletChallenge> {
    return http.post<WalletChallenge>('/wallets/challenge', { publicKey }, { skipRetry: true })
  },

  link(payload: LinkWalletPayload): Promise<{ wallet: LinkedWallet }> {
    return http.post<{ wallet: LinkedWallet }>('/wallets', payload, { skipRetry: true })
  },

  setVisibility(walletId: string, isPublic: boolean): Promise<{ wallet: LinkedWallet }> {
    return http.patch<{ wallet: LinkedWallet }>(
      `/wallets/${encodeURIComponent(walletId)}`,
      { isPublic },
      { skipRetry: true },
    )
  },

  unlink(walletId: string): Promise<void> {
    return http.delete<void>(`/wallets/${encodeURIComponent(walletId)}`, { skipRetry: true })
  },
}
