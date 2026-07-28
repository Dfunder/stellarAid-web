'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';

interface WalletConnectButtonProps {
  onConnected?: (address: string) => void;
}

declare global {
  interface Window {
    freighter?: {
      isConnected?: () => Promise<boolean>;
      connect?: () => Promise<string | { publicKey?: string }>;
      getPublicKey?: () => Promise<string>;
    };
  }
}

export default function WalletConnectButton({ onConnected }: WalletConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    setLoading(true);

    try {
      if (typeof window === 'undefined' || !window.freighter) {
        window.open('https://www.freighter.app/', '_blank', 'noopener,noreferrer');
        setLoading(false);
        return;
      }

      const freighter = window.freighter;
      let publicKey = '';

      if (freighter.connect) {
        const result = await freighter.connect();
        publicKey = typeof result === 'string' ? result : result?.publicKey || '';
      }

      if (!publicKey && freighter.getPublicKey) {
        publicKey = await freighter.getPublicKey();
      }

      if (!publicKey) {
        throw new Error('Unable to retrieve wallet address.');
      }

      await fetch('/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey }),
      });

      await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey }),
      });

      setConnectedAddress(publicKey);
      onConnected?.(publicKey);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not connect wallet.');
    } finally {
      setLoading(false);
    }
  };

  if (typeof window !== 'undefined' && !window.freighter) {
    return (
      <a
        href="https://www.freighter.app/"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
      >
        Install Freighter
      </a>
    );
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        aria-label="Connect Stellar wallet"
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        <Wallet className="h-4 w-4" />
        {loading ? 'Connecting...' : connectedAddress ? 'Wallet Connected' : 'Connect Wallet'}
      </button>
      {connectedAddress && (
        <p className="text-xs text-gray-600 dark:text-gray-400">{connectedAddress.slice(0, 12)}...</p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
