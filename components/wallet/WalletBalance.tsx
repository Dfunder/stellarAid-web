'use client';

import { RefreshCcw } from 'lucide-react';
import { useWalletBalance } from '@/hooks/useWalletBalance';

interface BalanceItem {
  code: string;
  amount: number;
  logo: string;
}

const initialBalances: BalanceItem[] = [
  { code: 'XLM', amount: 0, logo: '✦' },
  { code: 'USDC', amount: 0, logo: '◎' },
  { code: 'NGNT', amount: 0, logo: '◉' },
  { code: 'EURC', amount: 0, logo: '◌' },
];

export default function WalletBalance() {
  const { data, isLoading, isFetching, refetch, error } = useWalletBalance();

  const balances: BalanceItem[] = initialBalances.map((item) => {
    const match = data?.balances?.find(
      (balance: { code: string; amount: string | number }) => balance.code === item.code
    );
    return {
      ...item,
      amount: match ? Number(match.amount || 0) : 0,
    };
  });

  const loading = isLoading || isFetching;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Wallet Balance</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your connected asset balances</p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          Unable to load wallet balance. Please try again.
        </div>
      )}

      <div className="space-y-3">
        {balances.map((balance) => (
          <div
            key={balance.code}
            className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {balance.logo}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {balance.code}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{balance.code} balance</p>
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {isLoading ? (
                <span className="inline-block h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              ) : (
                balance.amount.toFixed(2)
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
