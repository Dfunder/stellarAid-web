'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquareText, PlusCircle, Sparkles } from 'lucide-react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import Spinner from '@/app/components/common/Spinner';
import { apiClient } from '@/utils/apiClient';

type CommissionStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface CommissionItem {
  id: string;
  title: string;
  clientName: string;
  status: CommissionStatus;
  budgetUsdc: number;
  createdAt: string;
  rating?: number;
}

interface DashboardStats {
  totalEarnings: number;
  activeCommissions: number;
  pendingRequests: number;
  averageRating: number;
}

const FALLBACK_COMMISSIONS: CommissionItem[] = [
  {
    id: 'c-101',
    title: 'Album cover art for debut EP',
    clientName: 'Tope Adekunle',
    status: 'PENDING',
    budgetUsdc: 350,
    createdAt: '2026-07-01',
    rating: 4.9,
  },
  {
    id: 'c-102',
    title: 'Brand illustration set',
    clientName: 'Lumora HQ',
    status: 'ACTIVE',
    budgetUsdc: 600,
    createdAt: '2026-06-26',
    rating: 4.8,
  },
  {
    id: 'c-103',
    title: 'Custom mascot for Discord server',
    clientName: 'PixelHaven DAO',
    status: 'COMPLETED',
    budgetUsdc: 220,
    createdAt: '2026-06-18',
    rating: 5,
  },
  {
    id: 'c-104',
    title: 'Music festival poster',
    clientName: 'Festival Crew',
    status: 'CANCELLED',
    budgetUsdc: 180,
    createdAt: '2026-06-10',
    rating: 4.2,
  },
  {
    id: 'c-105',
    title: 'Short-form social animation pack',
    clientName: 'Meli Studio',
    status: 'ACTIVE',
    budgetUsdc: 470,
    createdAt: '2026-06-03',
    rating: 4.7,
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

function normalizeEarnings(payload: unknown): number {
  if (typeof payload === 'number') {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;
    const values = [
      candidate.totalEarnings,
      candidate.total,
      candidate.totalAmount,
      candidate.earnings,
      candidate.amount,
    ];

    for (const value of values) {
      if (typeof value === 'number') {
        return value;
      }
    }
  }

  return 0;
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
  const client = (entry.client as Record<string, unknown> | undefined) ?? {};

  return {
    id: String(entry.id ?? `commission-${index + 1}`),
    title: String(entry.title ?? entry.name ?? 'Untitled commission'),
    clientName: String(client.name ?? entry.clientName ?? entry.client ?? 'Client'),
    status: normalizeStatus(entry.status),
    budgetUsdc: Number(entry.budgetUsdc ?? entry.budget ?? entry.amount ?? entry.price ?? 0),
    createdAt: String(entry.createdAt ?? entry.created_at ?? entry.updatedAt ?? ''),
    rating: typeof entry.rating === 'number' ? entry.rating : undefined,
  };
}

export default function ArtistDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEarnings: 0,
    activeCommissions: 0,
    pendingRequests: 0,
    averageRating: 0,
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

        const [earningsResponse, commissionsResponse] = await Promise.all([
          apiClient.get('/analytics/earnings'),
          apiClient.get('/commissions'),
        ]);

        if (!active) {
          return;
        }

        const nextCommissions = normalizeCommissions(commissionsResponse.data);
        const activeCount = nextCommissions.filter((item) => item.status === 'ACTIVE').length;
        const pendingCount = nextCommissions.filter((item) => item.status === 'PENDING').length;
        
        const ratings = nextCommissions
          .map((item) => item.rating)
          .filter((value): value is number => typeof value === 'number' && value >= 1 && value <= 5);
        
        let averageRating = 0;
        if (ratings.length > 0) {
          const totalStars = ratings.reduce((sum, value) => sum + value, 0);
          averageRating = Math.round((totalStars / ratings.length) * 10) / 10;
          averageRating = Math.max(0, Math.min(5, averageRating));
        }

        setCommissions(nextCommissions.slice(0, 5));
        setStats({
          totalEarnings: normalizeEarnings(earningsResponse.data),
          activeCommissions: activeCount,
          pendingRequests: pendingCount,
          averageRating,
        });
      } catch (error) {
        if (active) {
          setError('We could not load the artist overview right now. Showing the latest sample data instead.');
          setCommissions(FALLBACK_COMMISSIONS);
          setStats({
            totalEarnings: 1250,
            activeCommissions: 2,
            pendingRequests: 1,
            averageRating: 4.8,
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
              <span>Artist overview</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Welcome back, your studio is moving.
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Track earnings, outstanding requests, and your latest commissions in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/artist/portfolios/new"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <PlusCircle className="h-4 w-4" />
              New Portfolio
            </Link>
            <Link
              href="/dashboard/artist/services"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <PlusCircle className="h-4 w-4" />
              Add Service
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
                  label: 'Total earnings',
                  value: `$${stats.totalEarnings.toLocaleString()} USDC`,
                  helper: 'Lifetime volume',
                },
                {
                  label: 'Active commissions',
                  value: stats.activeCommissions.toString(),
                  helper: 'Live work in progress',
                },
                {
                  label: 'Pending requests',
                  value: stats.pendingRequests.toString(),
                  helper: 'Awaiting your reply',
                },
                {
                  label: 'Average rating',
                  value: `${stats.averageRating.toFixed(1)} ★`,
                  helper: 'Based on recent feedback',
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

            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent commissions
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    The most recent work and requests from your clients.
                  </p>
                </div>
                <Link
                  href="/dashboard/artist/commissions"
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  View all
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {recentCommissions.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                  No commissions yet. New requests will appear here.
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
                    <thead>
                      <tr className="text-gray-500 dark:text-gray-400">
                        <th className="px-3 py-2 font-medium">Commission</th>
                        <th className="px-3 py-2 font-medium">Client</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Budget</th>
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
                          <td className="px-3 py-3">{commission.clientName}</td>
                          <td className="px-3 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[commission.status].className}`}
                            >
                              {STATUS_BADGE[commission.status].label}
                            </span>
                          </td>
                          <td className="px-3 py-3">${commission.budgetUsdc.toFixed(2)} USDC</td>
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
