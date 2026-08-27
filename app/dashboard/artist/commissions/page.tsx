'use client';

import React, { useState, useMemo, useCallback, memo } from 'react';
import Link from 'next/link';
import { Calendar, Wallet } from 'lucide-react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';

type Status = 'NEW_REQUEST' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
type Tab = Status;

interface Commission {
  id: string;
  client: { name: string };
  title: string;
  status: Status;
  budgetUsdc: number;
  deadline: string;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'NEW_REQUEST', label: 'New Requests' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const MOCK: Commission[] = [
  {
    id: 'c-101',
    client: { name: 'Tope Adekunle' },
    title: 'Album cover art for debut EP',
    status: 'NEW_REQUEST',
    budgetUsdc: 350,
    deadline: '2026-08-15',
  },
  {
    id: 'c-102',
    client: { name: 'Lumora HQ' },
    title: 'Brand illustration set',
    status: 'ACTIVE',
    budgetUsdc: 600,
    deadline: '2026-09-01',
  },
  {
    id: 'c-103',
    client: { name: 'PixelHaven DAO' },
    title: 'Custom mascot for Discord server',
    status: 'COMPLETED',
    budgetUsdc: 220,
    deadline: '2026-08-05',
  },
  {
    id: 'c-104',
    client: { name: 'Festival Crew' },
    title: 'Music festival poster',
    status: 'CANCELLED',
    budgetUsdc: 180,
    deadline: '2026-07-20',
  },
];

const STATUS_BADGE: Record<Status, { label: string; className: string }> = {
  NEW_REQUEST: {
    label: 'New request',
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

interface ArtistCommissionCardProps {
  commission: Commission;
}

const ArtistCommissionCard = memo(function ArtistCommissionCard({
  commission,
}: Readonly<ArtistCommissionCardProps>) {
  const badge = STATUS_BADGE[commission.status];

  return (
    <li>
      <Link
        href={`/commissions/${commission.id}`}
        className="block rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
      >
        <div className="flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              {commission.client.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                {commission.client.name}
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">Client</p>
            </div>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        </div>
        <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
          {commission.title}
        </h3>
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Wallet className="h-3.5 w-3.5" />${commission.budgetUsdc.toFixed(2)} USDC
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {commission.deadline}
          </span>
        </div>
      </Link>
    </li>
  );
});

export default function ArtistCommissionsPage() {
  const [tab, setTab] = useState<Tab>('NEW_REQUEST');

  const newRequestCount = useMemo(() => MOCK.filter((c) => c.status === 'NEW_REQUEST').length, []);

  const filtered = useMemo(() => MOCK.filter((c) => c.status === tab), [tab]);

  const handleTabClick = useCallback((selectedTab: Tab) => {
    setTab(selectedTab);
  }, []);

  return (
    <DashboardLayout>
      <main id="main-content" tabIndex={-1} className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Commissions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage work from clients.</p>
        </header>

        <nav
          aria-label="Commission status"
          className="border-b border-gray-200 dark:border-gray-800"
        >
          <div className="flex flex-wrap gap-2 sm:gap-6">
            {TABS.map((t) => {
              const isActive = tab === t.key;
              const showBadge = t.key === 'NEW_REQUEST' && newRequestCount > 0;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => handleTabClick(t.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={
                    'flex items-center gap-2 border-b-2 px-2 pb-3 text-sm font-medium transition-colors ' +
                    (isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200')
                  }
                >
                  <span>{t.label}</span>
                  {showBadge && (
                    <span
                      aria-label={`${newRequestCount} new requests`}
                      className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-xs font-semibold text-white"
                    >
                      {newRequestCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            Nothing here yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((c) => (
              <ArtistCommissionCard key={c.id} commission={c} />
            ))}
          </ul>
        )}
      </main>
    </DashboardLayout>
  );
}
