'use client';

import DashboardLayout from '@/app/components/layout/DashboardLayout';
import WalletBalance from '@/components/wallet/WalletBalance';
import WalletConnectButton from '@/components/wallet/WalletConnectButton';

export default function WalletPage() {
  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Wallet</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Connect your Stellar wallet and view balances.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Connect your wallet
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Freighter is supported for quick wallet connections.
              </p>
            </div>
            <WalletConnectButton />
          </div>
        </div>

        <WalletBalance />
      </div>
    </DashboardLayout>
  );
}
