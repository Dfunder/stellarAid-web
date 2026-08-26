'use client';

import { useState, useEffect } from 'react';
import { Copy, ExternalLink, Wallet as WalletIcon } from 'lucide-react';
import { useAppSelector } from '@/app/store/hooks';
import { selectUser } from '@/app/features/auth/authSelectors';

// Import existing wallet components
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

interface BalanceItem {
  code: string;
  amount: number;
  logo: string;
}

export default function WalletSettingsPage() {
  const user = useAppSelector(selectUser);
  const [walletAddress, setWalletAddress] = useState('');
  const [copied, setCopied] = useState(false);
  const [balances, setBalances] = useState<BalanceItem[]>([
    { code: 'XLM', amount: 0, logo: '✦' },
    { code: 'USDC', amount: 0, logo: '◎' },
    { code: 'NGNT', amount: 0, logo: '◉' },
  ]);
  const [loading, setLoading] = useState(false);

  // Fetch wallet address from user state
  useEffect(() => {
    if (user?.walletAddress) {
      setWalletAddress(user.walletAddress);
    }
  }, [user]);

  // Fetch balances
  const fetchBalances = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      const response = await fetch('/wallet/balance');
      if (response.ok) {
        const data = await response.json();
        const updatedBalances = balances.map((item) => {
          const match = data?.balances?.find(
            (b: { code: string; amount: string | number }) => b.code === item.code
          );
          return {
            ...item,
            amount: match ? Number(match.amount || 0) : 0,
          };
        });
        setBalances(updatedBalances);
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchBalances();
    }
  }, [walletAddress]);

  // Copy address to clipboard
  const copyToClipboard = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Truncate address for display
  const truncateAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Stellar Expert link for wallet history
  const stellarExpertUrl = walletAddress
    ? `https://stellar.expert/explorer/public/account/${walletAddress}`
    : '#';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Wallet Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your connected Stellar wallet and view balances.
        </p>
      </div>

      {/* Wallet Connection Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Wallet Connection
            </h2>

            {walletAddress ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  <WalletIcon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {truncateAddress(walletAddress)}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Copy address"
                  >
                    <Copy className="h-3.5 w-3.5 text-gray-500" />
                  </button>
                  {copied && (
                    <span className="text-xs text-green-600 dark:text-green-400">Copied!</span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No wallet connected. Connect your Freighter wallet to get started.
              </p>
            )}
          </div>

          <WalletConnectButton onConnected={(address) => setWalletAddress(address)} />
        </div>
      </div>

      {/* Wallet Balances Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet Balances</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your current asset balances</p>
          </div>
          <button
            onClick={fetchBalances}
            disabled={loading || !walletAddress}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {!walletAddress ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Connect a wallet to view your balances
          </div>
        ) : (
          <div className="space-y-4">
            {balances.map((balance) => (
              <div
                key={balance.code}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-950"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {balance.logo}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {balance.code}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {balance.code} balance
                    </p>
                  </div>
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {balance.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wallet History Link */}
      {walletAddress && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transaction History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                View your full transaction history on Stellar Expert
              </p>
            </div>
            <a
              href={stellarExpertUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              View History
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
