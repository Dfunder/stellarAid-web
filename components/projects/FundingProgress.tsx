'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface FundingProgressProps {
  currentAmount: number | string;
  targetAmount: number | string;
  donorCount?: number;
  daysRemaining?: number;
  className?: string;
  onRefresh?: () => void;
  autoRefreshIntervalMs?: number;
}

function toNumber(value: number | string | undefined) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatMoney(value: number) {
  return value.toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function getFundingStage(percentage: number) {
  if (percentage >= 100) {
    return {
      label: 'Funded',
      bar: 'from-success-500 to-emerald-400',
      badge: 'bg-success-50 text-success-700',
      message: 'Goal reached',
    };
  }

  if (percentage >= 90) {
    return {
      label: 'Final push',
      bar: 'from-secondary-400 to-warning-500',
      badge: 'bg-warning-50 text-warning-700',
      message: 'Almost there!',
    };
  }

  if (percentage >= 65) {
    return {
      label: 'Strong momentum',
      bar: 'from-primary-500 to-success-500',
      badge: 'bg-primary-50 text-primary-700',
      message: 'Almost there!',
    };
  }

  if (percentage >= 30) {
    return {
      label: 'Building support',
      bar: 'from-primary-500 to-accent-500',
      badge: 'bg-primary-50 text-primary-700',
      message: 'Momentum is growing',
    };
  }

  return {
    label: 'Getting started',
    bar: 'from-neutral-700 to-primary-500',
    badge: 'bg-neutral-100 text-neutral-700',
    message: 'Early support matters',
  };
}

export function FundingProgress({
  currentAmount,
  targetAmount,
  donorCount = 0,
  daysRemaining,
  className,
  onRefresh,
  autoRefreshIntervalMs,
}: FundingProgressProps) {
  const [isMounted, setIsMounted] = useState(false);
  const current = toNumber(currentAmount);
  const target = toNumber(targetAmount);
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const stage = getFundingStage(percentage);

  const milestones = useMemo(
    () => [
      { value: 25, label: '25%' },
      { value: 50, label: '50%' },
      { value: 75, label: 'Almost there!' },
      { value: 100, label: 'Funded' },
    ],
    []
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!onRefresh || !autoRefreshIntervalMs) {
      return;
    }

    const interval = window.setInterval(onRefresh, autoRefreshIntervalMs);
    return () => window.clearInterval(interval);
  }, [autoRefreshIntervalMs, onRefresh]);

  return (
    <section className={clsx('rounded-xl border border-neutral-200 bg-white p-5 shadow-sm', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-neutral-500">Funding Progress</p>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-3xl font-extrabold text-neutral-900">{formatMoney(current)}</span>
            <span className="text-sm font-medium text-neutral-500">raised of {formatMoney(target)}</span>
          </div>
        </div>
        <span className={clsx('rounded-full px-3 py-1 text-xs font-bold uppercase', stage.badge)}>
          {stage.label}
        </span>
      </div>

      <div className="mt-5" aria-live="polite">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-neutral-600">{stage.message}</span>
          <span className="font-extrabold text-neutral-900">{percentage}%</span>
        </div>
        <div className="relative h-4 overflow-hidden rounded-full bg-neutral-100">
          <div
            className={clsx(
              'h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
              stage.bar
            )}
            style={{ width: `${isMounted ? percentage : 0}%` }}
          />
          {milestones.map((milestone) => (
            <span
              key={milestone.value}
              className={clsx(
                'absolute top-1/2 h-5 w-px -translate-y-1/2 bg-white/80',
                milestone.value === 100 ? 'right-0' : ''
              )}
              style={milestone.value === 100 ? undefined : { left: `${milestone.value}%` }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-4 text-[10px] font-semibold uppercase text-neutral-400">
          {milestones.map((milestone) => (
            <span
              key={milestone.value}
              className={clsx(
                milestone.value === 100 && 'text-right',
                milestone.value === 75 && 'text-center',
                milestone.value === 50 && 'text-center'
              )}
            >
              {milestone.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-neutral-50 px-3 py-3">
          <Users className="h-4 w-4 text-primary-500" />
          <p className="mt-2 text-lg font-extrabold text-neutral-900">{donorCount.toLocaleString()}</p>
          <p className="text-xs font-medium text-neutral-500">Donors</p>
        </div>
        <div className="rounded-lg bg-neutral-50 px-3 py-3">
          <CalendarDays className="h-4 w-4 text-warning-500" />
          <p className="mt-2 text-lg font-extrabold text-neutral-900">
            {typeof daysRemaining === 'number' ? Math.max(daysRemaining, 0) : 'Open'}
          </p>
          <p className="text-xs font-medium text-neutral-500">Days left</p>
        </div>
        <div className="rounded-lg bg-neutral-50 px-3 py-3">
          {percentage >= 100 ? (
            <CheckCircle2 className="h-4 w-4 text-success-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-accent-500" />
          )}
          <p className="mt-2 text-lg font-extrabold text-neutral-900">
            {formatMoney(Math.max(target - current, 0))}
          </p>
          <p className="text-xs font-medium text-neutral-500">Remaining</p>
        </div>
      </div>
    </section>
  );
}

export default FundingProgress;

