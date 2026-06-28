'use client';

import { useState, useEffect } from 'react';
import { useAppSelector } from '@/app/store/hooks';
import { selectUser } from '@/app/features/auth/authSelectors';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

export default function SettingsPage() {
  const user = useAppSelector(selectUser);
  const [fullName, setFullName] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setWalletAddress(user.walletAddress || '');
    }
  }, [user]);

  const isValidStellarAddress = (addr: string) => /^G[A-Z0-9]{55}$/.test(addr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    if (walletAddress && !isValidStellarAddress(walletAddress)) {
      setError('Wallet address must start with G and be 56 characters long.');
      return;
    }

    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: fullName, walletAddress }),
    });

    if (response.ok) {
      setSaved(true);
    } else {
      setError('Failed to update profile. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Profile Settings</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stellar Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="G..."
              className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && <p className="text-sm text-green-600">Profile updated successfully.</p>}
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Save Changes
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
