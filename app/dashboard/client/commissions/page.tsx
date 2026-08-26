'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Calendar, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

type Status = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type Tab = 'ALL' | Status;

interface Commission {
  id: string;
  artist: { name: string };
  title: string;
  status: Status;
  budgetUsdc: number;
  deadline: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const MOCK: Commission[] = [
  {
    id: 'c-001',
    artist: { name: 'Ngozi Okafor' },
    title: 'Album cover art for debut EP',
    status: 'PENDING',
    budgetUsdc: 350,
    deadline: '2026-08-15',
  },
  {
    id: 'c-002',
    artist: { name: 'Amara Diallo' },
    title: 'Brand illustration set',
    status: 'ACTIVE',
    budgetUsdc: 600,
    deadline: '2026-09-01',
  },
  {
    id: 'c-003',
    artist: { name: 'Wei Chen' },
    title: 'Custom mascot for Discord server',
    status: 'COMPLETED',
    budgetUsdc: 220,
    deadline: '2026-08-05',
  },
  {
    id: 'c-004',
    artist: { name: 'Lara Ferreira' },
    title: 'Wedding invite illustrations',
    status: 'CANCELLED',
    budgetUsdc: 180,
    deadline: '2026-07-20',
  },
];

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
  },
};

export default function ClientCommissionsPage() {
  const [tab, setTab] = useState<Tab>('ALL');

  const filtered = tab === 'ALL' ? MOCK : MOCK.filter((c) => c.status === tab);

  return (
    <DashboardLayout>
      <main id="main-content" tabIndex={-1} className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">My commissions</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track every commission you have requested.
            </p>
          </div>
          <button
            type="button"
            onClick={() => toast.success('New commission request opened (mock)')}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New commission
          </button>
        </header>

        <nav
          aria-label="Commission status"
          className="border-b border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-wrap gap-2 sm:gap-6">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? 'page' : undefined}
                className={
                  'border-b-2 px-2 pb-3 text-sm font-medium transition-colors ' +
                  (tab === t.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200')
                }
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            No commissions in this tab yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => {
              const badge = STATUS_BADGE[c.status];
              return (
                <li key={c.id}>
                  <Link
                    href={`/commissions/${c.id}`}
                    className="block rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          {c.artist.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                            {c.artist.name}
                          </p>
                          <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                            Artist
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                      {c.title}
                    </h3>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5" />${c.budgetUsdc.toFixed(2)} USDC
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {c.deadline}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </DashboardLayout>
  );
}
