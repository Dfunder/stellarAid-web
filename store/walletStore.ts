import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WalletStore } from '@/types';

export const useWalletStore = create<WalletStore>()(
  devtools(
    (set) => ({
      // Initial State
      connectedWallet: null,
      address: null,
      balance: null,
      isConnecting: false,
      error: null,

      // Actions
      connect: (wallet, address) =>
        set({
          connectedWallet: wallet,
          address: address,
          isConnecting: false,
          error: null,
        }),

      disconnect: () =>
        set({
          connectedWallet: null,
          address: null,
          balance: null,
          isConnecting: false,
          error: null,
        }),

      setBalance: (balance) => set({ balance }),

      setConnecting: (connecting) => set({ isConnecting: connecting }),

      setError: (error) => set({ error }),
    }),
    {
      name: 'WalletStore',
    }
  )
);
