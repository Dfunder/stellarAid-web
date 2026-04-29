'use client';

import { useWalletStore } from '@/store/walletStore';
import { useUserDataSync } from '@/hooks/useUserDataSync';

export default function UserDataSync() {
  const walletAddress = useWalletStore((state) => state.address);

  useUserDataSync(walletAddress);

  return null;
}
