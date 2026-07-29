'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquareText, Search, Sparkles } from 'lucide-react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import Spinner from '@/app/components/common/Spinner';
import EarningsChart from '@/components/analytics/EarningsChart';
import { apiClient } from '@/utils/apiClient';

type CommissionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface CommissionItem {
  id: string;
  title: string;
  artistName: string;
  status: CommissionStatus;
  totalUsdc: number;
  createdAt: string;
}

interface DashboardStats {
  activeCommissions: number;
  totalSpent: number;
  artistsHired: number;
  pendingReviews: number;
}

const FALLBACK_COMMISSIONS: CommissionItem[] = [
  {
    id: 'c-201',
    title: 'Album cover art for debut EP',
    artistName: 'Ngozi Okafor',
    status: 'ACTIVE',
    totalUsdc: 350,
    createdAt: '2026-07-10',
  },
  {
    id: 'c-202',
    title: 'Brand illustration set',
    artistName: 'Amara Diallo',
    status: 'COMPLETED',
    totalUsdc: 600,
    createdAt: '2026-06-28',
  },
  {
    id: 'c-203',
    title: 'Custom mascot for Discord server',
    artistName: 'Wei Chen',
    status: 'PENDING',
    totalUsdc: 220,
    createdAt: '2026-06-18',
  },
  {
    id: 'c-204',
    title: 'Wedding invite illustrations',
    artistName: 'Lara Ferreira',
    status: 'CANCELLED',
    totalUsdc: 180,
    createdAt: '2026-06-10',
  },
  {
    id: 'c-205',
    title: 'Social animation pack',
    artistName: 'Reece Holloway',
    status: 'ACTIVE',
    totalUsdc: 470,
    createdAt: '2026-05-31',
  },
];

const STATUS_BADGE: Record<CommissionStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
  },
};

function normalizeStatus(value: unknown): CommissionStatus {
  const status = String(value ?? '').toLowerCase();

  if (['pending', 'new_request', 'new', 'requested'].includes(status)) {
    return 'PENDING';
  }

  if (['active', 'in_progress', 'in-progress', 'ongoing'].includes(status)) {
    return 'ACTIVE';
  }

  if (['completed', 'done', 'finished'].includes(status)) {
    return 'COMPLETED';
  }

  return 'CANCELLED';
}

function normalizeStats(payload: unknown): DashboardStats {
  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;
    return {
      activeCommissions: Number(candidate.activeCommissions ?? candidate.active ?? 0),
      totalSpent: Number(candidate.totalSpent ?? candidate.total ?? candidate.amount ?? 0),
      artistsHired: Number(candidate.artistsHired ?? candidate.artists ?? candidate.count ?? 0),
      pendingReviews: Number(candidate.pendingReviews ?? candidate.reviews ?? candidate.pending ?? 0),
    };
  }

  return {
    activeCommissions: 0,
    totalSpent: 0,
    artistsHired: 0,
    pendingReviews: 0,
  };
}

function normalizeCommissions(payload: unknown): CommissionItem[] {
  if (Array.isArray(payload)) {
    return payload.map((item, index) => normalizeCommission(item, index));
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;
    const commissions = candidate.commissions;
    if (Array.isArray(commissions)) {
      return commissions.map((item, index) => normalizeCommission(item, index));
    }

    if (Array.isArray(candidate.data)) {
      return candidate.data.map((item, index) => normalizeCommission(item, index));
    }
  }

  return [];
}

function normalizeCommission(item: unknown, index: number): CommissionItem {
  const entry = (item ?? {}) as Record<string, unknown>;
  const artist = (entry.artist as Record<string, unknown> | undefined) ?? {};

  return {
    id: String(entry.id ?? `commission-${index + 1}`),
    title: String(entry.title ?? entry.name ?? 'Untitled commission'),
    artistName: String(artist.name ?? entry.artistName ?? entry.artist ?? 'Artist'),
    status: normalizeStatus(entry.status),
    totalUsdc: Number(entry.totalUsdc ?? entry.total ?? entry.amount ?? entry.budgetUsdc ?? 0),
    createdAt: String(entry.createdAt ?? entry.created_at ?? entry.updatedAt ?? ''),
  };
}

export default function ClientDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeCommissions: 0,
    totalSpent: 0,
    artistsHired: 0,
    pendingReviews: 0,
  });
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [statsResponse, commissionsResponse] = await Promise.all([
          apiClient.get('/analytics/spending'),
          apiClient.get('/commissions'),
        ]);

        if (!active) {
          return;
        }

        const nextCommissions = normalizeCommissions(commissionsResponse.data).slice(0, 5);
        setCommissions(nextCommissions.length > 0 ? nextCommissions : FALLBACK_COMMISSIONS);
        setStats(normalizeStats(statsResponse.data));
      } catch {
        if (active) {
          setError('We could not load your client overview right now. Showing the latest sample data instead.');
          setCommissions(FALLBACK_COMMISSIONS);
          setStats({
            activeCommissions: 2,
            totalSpent: 1250,
            artistsHired: 5,
            pendingReviews: 1,
          });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  const recentCommissions = useMemo(() => commissions.slice(0, 5), [commissions]);

  return (
    <DashboardLayout>
      <main id="main-content" tabIndex={-1} className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
              <Sparkles className="h-4 w-4" />
              <span>Client overview</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome back, here is your creative activity.
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Keep track of spending, active projects, and your recent commissions in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/artists"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <Search className="h-4 w-4" />
              Find Artist
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <Sparkles className="h-4 w-4" />
              Browse Marketplace
            </Link>
            <Link
              href="/dashboard/messages/1"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <MessageSquareText className="h-4 w-4" />
              View Messages
            </Link>
          </div>
        </header>

        {error ? <ErrorMessage message={error} className="border-blue-200 bg-blue-50 text-blue-800" /> : null}

        {isLoading ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
              <Spinner size="lg" className="text-blue-600" />
              <p className="text-sm">Loading your dashboard…</p>
            </div>
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Active commissions',
                  value: stats.activeCommissions.toString(),
                  helper: 'Live projects in motion',
                },
                {
                  label: 'Total spent (USDC)',
                  value: `$${stats.totalSpent.toLocaleString()}`,
                  helper: 'Lifetime spend on commissions',
                },
                {
                  label: 'Artists hired',
                  value: stats.artistsHired.toString(),
                  helper: 'Unique collaborators',
                },
                {
                  label: 'Pending reviews',
                  value: stats.pendingReviews.toString(),
                  helper: 'Awaiting your feedback',
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.helper}</p>
                </div>
              ))}
            </section>

            <EarningsChart />

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent commissions</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Your latest commission requests and workstreams.
                  </p>
                </div>
                <Link
                  href="/dashboard/client/commissions"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {recentCommissions.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No commissions yet. Start browsing artists to create your first request.
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400">
                        <th className="px-3 py-2 font-medium">Commission</th>
                        <th className="px-3 py-2 font-medium">Artist</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {recentCommissions.map((commission) => (
                        <tr key={commission.id} className="text-gray-700 dark:text-gray-300">
                          <td className="px-3 py-3">
                            <div className="font-medium text-gray-900 dark:text-white">{commission.title}</div>
                            {commission.createdAt ? (
                              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {commission.createdAt}
                              </div>
                            ) : null}
                          </td>
                          <td className="px-3 py-3">{commission.artistName}</td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[commission.status].className}`}
                            >
                              {STATUS_BADGE[commission.status].label}
                            </span>
                          </td>
                          <td className="px-3 py-3">${commission.totalUsdc.toFixed(2)} USDC</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </DashboardLayout>
  );
}
