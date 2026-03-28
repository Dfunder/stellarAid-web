import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Card } from './Card';
import { ArrowUpRight, ArrowDownRight, Minus, Info } from 'lucide-react';

export type StatType = 'currency' | 'percentage' | 'count';

export interface StatCardProps {
  title: string;
  value: number | string;
  previousValue?: number;
  type?: StatType;
  currency?: string;
  precision?: number;
  description?: string;
  info?: string;
  icon?: ReactNode;
  iconBg?: string;
  loading?: boolean;
  className?: string;
}

function formatValue(value: number | string, type: StatType, currency: string, precision: number) {
  if (typeof value === 'string') {
    return value;
  }

  if (!Number.isFinite(value)) {
    return '-';
  }

  if (type === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value);
  }

  if (type === 'percentage') {
    const normalized = Math.abs(value) <= 1 ? value * 100 : value;
    return `${normalized.toFixed(precision)}%`;
  }

  // count
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

export const StatCard = ({
  title,
  value,
  previousValue,
  type = 'count',
  currency = 'USD',
  precision = 2,
  description,
  info,
  icon,
  iconBg = 'bg-gray-100',
  loading = false,
  className,
  ...props
}: StatCardProps & React.HTMLAttributes<HTMLDivElement>) => {
  if (loading) {
    return (
      <Card variant="elevated" padding="lg" className={twMerge('animate-pulse', className)}>
        <div className="h-4 w-1/3 mb-3 bg-gray-200 rounded" />
        <div className="h-10 w-3/4 mb-2 bg-gray-200 rounded" />
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </Card>
    );
  }

  const stat = formatValue(value, type, currency, precision);
  let trendLabel = '';
  let trendColor = 'text-gray-500';
  let TrendIcon = Minus;
  let trendValueStr = '';
  let trendPctStr = '';

  if (typeof previousValue === 'number' && typeof value === 'number' && Number.isFinite(previousValue)) {
    const diff = value - previousValue;
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
    const absDiff = Math.abs(diff);
    const diffFormatted = formatValue(absDiff, type, currency, precision);

    if (direction === 'up') {
      trendLabel = `+${diffFormatted}`;
      trendColor = 'text-emerald-600';
      TrendIcon = ArrowUpRight;
    } else if (direction === 'down') {
      trendLabel = `-${diffFormatted}`;
      trendColor = 'text-red-500';
      TrendIcon = ArrowDownRight;
    } else {
      trendLabel = 'No change';
      trendColor = 'text-gray-400';
      TrendIcon = Minus;
    }

    if (previousValue !== 0) {
      const pct = (diff / Math.abs(previousValue)) * 100;
      trendPctStr = ` (${pct.toFixed(1)}%)`;
    }

    trendValueStr = `${trendLabel}${trendPctStr}`;
  }

  return (
    <Card variant="elevated" padding="lg" className={twMerge('relative', className)} {...props}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
            {info && (
              <span className="group relative inline-flex items-center">
                <Info className="w-3.5 h-3.5 text-gray-400" />
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {info}
                </span>
              </span>
            )}
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-gray-900 leading-none mt-1">{stat}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          {trendValueStr && (
            <div className={twMerge('inline-flex items-center gap-1.5 text-sm font-medium mt-2', trendColor)}>
              <TrendIcon className="w-4 h-4" />
              <span>{trendValueStr}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={twMerge('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconBg)}>
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;
