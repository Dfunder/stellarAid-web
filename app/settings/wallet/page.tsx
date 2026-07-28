'use client';

import { useState } from 'react';
import { Wallet, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface BalanceItem {
  code: string;
  amount: number;
}

const MOCK_ADDRESS =
  'GABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ABCDEFGHIJKLMNOPQRSTUVWXY';
const NETWORK = 'public';

const initialBalances: BalanceItem[] = [
  { code: 'XLM', amount: 1240.55 },
  { code: 'USDC', amount: 320.0 },
  { code: 'NGNT', amount: 0 },
];

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}\u2026${address.slice(-4)}`;
}

export default function WalletSettingsPage() {
  const [connectedAddress, setConnectedAddress] = useState<string>(MOCK_ADDRESS);
  const [loading, setLoading] = useState(false);

  const stellarExpertUrl = connectedAddress
    ? `https://stellar.expert/explorer/${NETWORK}/account/${connectedAddress}`
    : '#';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(connectedAddress);
      toast.success('Wallet address copied.');
    } catch {
      toast.error('Could not copy address.');
    }
  };

  const handleConnectToggle = () => {
    setLoading(true);
    // Freighter / wallet calls are mocked here — wire to the real flow later.
    window.setTimeout(() => {
      setLoading(false);
      toast.success(
        connectedAddress
          ? 'Re-connect flow started. (mock)'
          : 'Wallet connected. (mock)'
      );
    }, 600);
  };

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Wallet settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your connected Stellar wallet and review balances.
        </p>
      </header>

      {/* Connected address + connect / change button */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Connected address
            </h2>
            {connectedAddress ? (
              <div className="mt-2 flex items-center gap-2">
                <code className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  {truncateAddress(connectedAddress)}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  aria-label="Copy wallet address"
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Copy
                </button>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No wallet connected.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleConnectToggle}
            disabled={loading}
            aria-label={connectedAddress ? 'Change Stellar wallet' : 'Connect Stellar wallet'}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Wallet className="h-4 w-4" aria-hidden="true" />
            {loading ? 'Working\u2026' : connectedAddress ? 'Change wallet' : 'Connect wallet'}
          </button>
        </div>

        {connectedAddress && (
          <a
            href={stellarExpertUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            View history on Stellar Expert
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        )}
      </div>

      {/* Balances */}
      <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          Current balances
        </h2>
        <ul className="mt-3 divide-y divide-gray-100 dark:divide-gray-800">
          {initialBalances.map((balance) => (
            <li
              key={balance.code}
              className="flex items-center justify-between py-3 text-sm"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {balance.code}
              </span>
              <span className="font-mono text-gray-900 dark:text-white">
                {balance.amount.toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
