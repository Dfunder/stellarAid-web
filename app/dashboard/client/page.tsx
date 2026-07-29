'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MessageSquare, Search, ShoppingBag } from 'lucide-react';
import DashboardLayout from '@/app/components/layout/DashboardLayout';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import Spinner from '@/app/components/common/Spinner';
import { getSpending, normalizeSpending } from '@/lib/api/analytics';
import { getCommissions, normalizeCommissions, CommissionItem } from '@/lib/api/commissions';

type CommissionStatus = CommissionItem['status'];

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

function formatMoney(value: number): string {
  return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} USDC`;
}

function sortCommissionsByDate(a: CommissionItem, b: CommissionItem) {
  const aDate = new Date(a.createdAt).getTime();
  const bDate = new Date(b.createdAt).getTime();
  return bDate - aDate;
}

export default function ClientDashboardPage() {
  const [commissions, setCommissions] = useState<CommissionItem[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [activeCommissions, setActiveCommissions] = useState(0);
  const [artistsHired, setArtistsHired] = useState(0);
  const [pendingReviews, setPendingReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchOverview = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [spendingResponse, commissionsResponse] = await Promise.all([
          getSpending(),
          getCommissions({ role: 'client' }),
        ]);

        if (!active) return;

        const nextCommissions = normalizeCommissions(commissionsResponse);
        const activeStatusCount = nextCommissions.filter((item) => item.status === 'ACTIVE').length;
        const artistCount = new Set(nextCommissions.map((item) => item.artistId || item.artistName)).size;
        const reviewCount = nextCommissions.filter(
          (item) => item.status === 'COMPLETED' && item.rating === undefined,
        ).length;

        setCommissions(nextCommissions.sort(sortCommissionsByDate).slice(0, 5));
        setTotalSpent(normalizeSpending(spendingResponse));
        setActiveCommissions(activeStatusCount);
        setArtistsHired(artistCount);
        setPendingReviews(reviewCount);
      } catch (cause) {
        setError('Unable to load your client dashboard right now. Please try again later.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchOverview();

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
              <Search className="h-4 w-4" />
              <span>Client overview</span>
            </div>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              Your commission hub
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              See your most recent requests, spending, and what needs attention.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <ShoppingBag className="h-4 w-4" />
              Find Artist
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              <ArrowRight className="h-4 w-4" />
              Browse Marketplace
            </Link>
            <Link
              href="/dashboard/messages/1"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              <MessageSquare className="h-4 w-4" />
              View Messages
            </Link>
          </div>
        </header>

        {error ? <ErrorMessage message={error} className="border-blue-200 bg-blue-50 text-blue-800" /> : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Active commissions',
              value: isLoading ? '—' : activeCommissions,
              helper: 'Requests currently in progress',
            },
            {
              label: 'Total spent',
              value: isLoading ? '—' : formatMoney(totalSpent),
              helper: 'Amount spent in USDC',
            },
            {
              label: 'Artists hired',
              value: isLoading ? '—' : artistsHired,
              helper: 'Unique artists you’ve worked with',
            },
            {
              label: 'Pending reviews',
              value: isLoading ? '—' : pendingReviews,
              helper: 'Completed orders awaiting review',
            },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{card.helper}</p>
            </div>
          ))}
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent commissions</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Latest five commission requests from your account.
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

          {isLoading ? (
            <div className="mt-6 flex min-h-[18rem] items-center justify-center">
              <Spinner size="lg" className="text-blue-600" />
            </div>
          ) : recentCommissions.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
              No commissions found. New orders will appear here.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="px-3 py-2 font-medium">Commission</th>
                    <th className="px-3 py-2 font-medium">Artist</th>
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
                            {new Date(commission.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">{commission.artistName}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE[commission.status].className}`}>
                          {STATUS_BADGE[commission.status].label}
                        </span>
                      </td>
                      <td className="px-3 py-3">{formatMoney(commission.budgetUsdc)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </DashboardLayout>
  );
}
