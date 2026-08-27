'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getEarnings } from '@/lib/api/analytics';
import ErrorMessage from '@/app/components/common/ErrorMessage';
import Spinner from '@/app/components/common/Spinner';

interface EarningsChartProps {
  title?: string;
  description?: string;
  data?: unknown;
}

interface ChartPoint {
  label: string;
  amount: number;
}

function getChartLabel(value: unknown): string {
  if (!value && value !== 0) {
    return '';
  }

  const valueString = String(value).trim();
  if (!valueString) {
    return '';
  }

  const isoMonth = /^\d{4}-\d{2}$/;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const yearMonth = isoMonth.test(valueString);
  const fullDate = isoDate.test(valueString);

  if (yearMonth || fullDate) {
    const date = new Date(valueString + (yearMonth ? '-01' : ''));
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString('en-US', { month: 'short' });
    }
  }

  const parsed = new Date(valueString);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleString('en-US', { month: 'short' });
  }

  return valueString;
}

function normalizeEarnings(payload: unknown): ChartPoint[] {
  if (!payload) {
    return [];
  }

  let items: unknown[] = [];

  if (Array.isArray(payload)) {
    items = payload;
  } else if (typeof payload === 'object') {
    const candidate = payload as Record<string, unknown>;
    if (Array.isArray(candidate.data)) {
      items = candidate.data;
    } else if (Array.isArray(candidate.earnings)) {
      items = candidate.earnings;
    } else if (Array.isArray(candidate.monthlyEarnings)) {
      items = candidate.monthlyEarnings;
    } else if (Array.isArray(candidate.rows)) {
      items = candidate.rows;
    } else if (Array.isArray(candidate.series)) {
      items = candidate.series;
    }
  }

  const points = items
    .map((item) => {
      const entry = (item ?? {}) as Record<string, unknown>;
      const rawLabel = entry.month ?? entry.label ?? entry.date ?? entry.period ?? entry.name ?? '';
      const amount = Number(entry.amount ?? entry.earnings ?? entry.value ?? entry.total ?? 0);
      return {
        label: getChartLabel(rawLabel) || String(entry.month ?? entry.label ?? entry.date ?? ''),
        amount: Number.isFinite(amount) ? amount : 0,
      };
    })
    .filter((point) => point.label);

  if (points.length >= 6) {
    return points.slice(-6);
  }

  const now = new Date();
  const filled: ChartPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString('en-US', { month: 'short' });
    const existing = points.find((p) => p.label === label);
    filled.push({ label, amount: existing ? existing.amount : 0 });
  }
  return filled;
}

function formatMoney(value: number): string {
  return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} USDC`;
}

export default function EarningsChart({
  title = 'Earnings',
  description = 'Monthly earnings for the last six months.',
  data,
}: EarningsChartProps) {
  const [earningsData, setEarningsData] = useState<unknown | null>(data ?? null);
  const [loading, setLoading] = useState(!Boolean(data));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    const loadEarnings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getEarnings();
        if (!active) return;
        setEarningsData(response);
      } catch (cause) {
        setError('Unable to load earnings chart. Please try again later.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadEarnings();

    return () => {
      active = false;
    };
  }, [data]);

  const chartPoints = useMemo(() => normalizeEarnings(earningsData), [earningsData]);
  const totalEarnings = chartPoints.reduce((sum, point) => sum + point.amount, 0);
  const lastPoint = chartPoints[chartPoints.length - 1];
  const currentMonthEarnings = lastPoint ? lastPoint.amount : 0;

  return (
    <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-blue-600">{title}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total earnings</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {formatMoney(totalEarnings)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current month</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
              {formatMoney(currentMonthEarnings)}
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      ) : loading ? (
        <div className="mt-6 flex min-h-[24rem] items-center justify-center">
          <Spinner size="lg" className="text-blue-600" />
        </div>
      ) : chartPoints.length === 0 ? (
        <div className="mt-6 flex min-h-[24rem] items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-400">
          No earnings data available for the last six months.
        </div>
      ) : (
        <div className="mt-6 h-[24rem]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartPoints} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value) => formatMoney(Number(value ?? 0))}
                cursor={{ fill: 'rgba(59, 130, 246, 0.08)' }}
              />
              <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
