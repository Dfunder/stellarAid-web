'use client';

import { useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';

interface WalletConnectButtonProps {
  onConnected?: (address: string) => void;
}

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithRetry(
  freighter: NonNullable<Window['freighter']>,
  attempt = 1
): Promise<string> {
  try {
    let publicKey = '';

    if (freighter.connect) {
      const result = await Promise.race([
        freighter.connect(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        ),
      ]);
      publicKey = typeof result === 'string' ? result : result?.publicKey || '';
    }

    if (!publicKey && freighter.getPublicKey) {
      publicKey = await Promise.race([
        freighter.getPublicKey(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), 5000)
        ),
      ]);
    }

    if (!publicKey) {
      throw new Error('Unable to retrieve wallet address.');
    }

    return publicKey;
  } catch (error) {
    if (attempt >= MAX_RETRIES) {
      throw error;
    }
    const delay = BASE_DELAY * Math.pow(2, attempt - 1);
    await sleep(delay);
    return connectWithRetry(freighter, attempt + 1);
  }
}

export default function WalletConnectButton({ onConnected }: WalletConnectButtonProps) {
  const [loading, setLoading] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState('');
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const handleConnect = useCallback(async () => {
    setError('');
    setLoading(true);
    setRetryCount(0);

    try {
      if (typeof window === 'undefined' || !window.freighter) {
        window.open('https://www.freighter.app/', '_blank', 'noopener,noreferrer');
        setLoading(false);
        return;
      }

      const publicKey = await connectWithRetry(window.freighter);

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
      const message = err instanceof Error ? err.message : 'Could not connect wallet.';
      if (message.includes('timeout') || message.includes('Timeout')) {
        setError(
          'Wallet connection timed out. Please check if Freighter is unlocked and try again.'
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
      setRetryCount(0);
    }
  }, [onConnected]);

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
        onClick={handleConnect}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        <Wallet className="h-4 w-4" />
        {loading ? 'Connecting...' : connectedAddress ? 'Wallet Connected' : 'Connect Wallet'}
      </button>
      {connectedAddress && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {connectedAddress.slice(0, 12)}...
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
