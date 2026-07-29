'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import Spinner from '@/app/components/common/Spinner';
import { apiClient } from '@/utils/apiClient';

interface MonthlyEarningsPoint {
  month: string;
  earnings: number;
}

interface EarningsChartProps {
  data?: MonthlyEarningsPoint[];
  loading?: boolean;
  error?: string | null;
}

function normalizeChartData(payload: unknown): MonthlyEarningsPoint[] {
  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        const entry = (item ?? {}) as Record<string, unknown>;
        const month = String(entry.month ?? entry.label ?? entry.period ?? entry.name ?? '');
        const earnings = Number(
          entry.earnings ?? entry.amount ?? entry.value ?? entry.total ?? entry.usdc ?? 0
        );

        if (!month) {
          return null;
        }

        return {
          month,
          earnings: Number.isFinite(earnings) ? earnings : 0,
        };
      })
      .filter((item): item is MonthlyEarningsPoint => Boolean(item));
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;
    const candidates = [candidate.data, candidate.monthlyEarnings, candidate.earnings, candidate.results];

    for (const value of candidates) {
      if (Array.isArray(value)) {
        return normalizeChartData(value);
      }
    }
  }

  return [];
}

function formatUSDC(value: number) {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDC`;
}

export default function EarningsChart({ data, loading, error }: EarningsChartProps) {
  const [chartData, setChartData] = useState<MonthlyEarningsPoint[]>([]);
  const [internalLoading, setInternalLoading] = useState(!data);
  const [internalError, setInternalError] = useState<string | null>(null);

  const resolvedData = data ?? chartData;
  const resolvedLoading = loading ?? internalLoading;
  const resolvedError = error ?? internalError;

  useEffect(() => {
    if (data) {
      return;
    }

    let active = true;

    const loadData = async () => {
      try {
        setInternalLoading(true);
        setInternalError(null);

        const response = await apiClient.get('/analytics/earnings');

        if (!active) {
          return;
        }

        setChartData(normalizeChartData(response.data).slice(-6));
      } catch {
        if (active) {
          setInternalError('We could not load the latest earnings history right now.');
        }
      } finally {
        if (active) {
          setInternalLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [data]);

  const summary = useMemo(() => {
    const total = resolvedData.reduce((sum, item) => sum + item.earnings, 0);
    const current = resolvedData[resolvedData.length - 1]?.earnings ?? 0;

    return {
      total,
      current,
    };
  }, [resolvedData]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-blue-600">
            <TrendingUp className="h-4 w-4" />
            <span>Weekly earnings trend</span>
          </div>
          <h2 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">
            Earnings overview
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review your recent monthly earnings in USDC.
          </p>
        </div>
      </div>

      {resolvedError ? (
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-blue-200">
          {resolvedError}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total earnings</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {formatUSDC(summary.total)}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/50">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current month</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
            {formatUSDC(summary.current)}
          </p>
        </div>
      </div>

      {resolvedLoading ? (
        <div className="mt-8 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-8 dark:border-gray-700 dark:bg-gray-950/40">
          <div className="flex flex-col items-center gap-3 text-gray-500 dark:text-gray-400">
            <Spinner size="lg" className="text-blue-600" />
            <p className="text-sm">Loading earnings history…</p>
          </div>
        </div>
      ) : resolvedData.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No earning data available for the last six months.
        </div>
      ) : (
        <div className="mt-8 h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={resolvedData} margin={{ top: 8, right: 12, left: -16, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
                formatter={(value: number | string | readonly (number | string)[] | undefined) =>
                  formatUSDC(Number(Array.isArray(value) ? value[0] ?? 0 : value ?? 0))
                }
              />
              <Bar dataKey="earnings" radius={[8, 8, 0, 0]}>
                {resolvedData.map((entry, index) => (
                  <Cell key={`${entry.month}-${index}`} fill={index === resolvedData.length - 1 ? '#2563EB' : '#93C5FD'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
