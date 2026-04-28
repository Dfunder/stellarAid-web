'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DonationDataPoint {
  date: string;        // ISO date string "2024-01-15"
  totalAmount: number;
  count: number;
}

interface AggregatedResponse {
  data: DonationDataPoint[];
  totalInRange: number;
  asset: string;
}

type Range = '7d' | '30d' | '90d' | 'all';

interface RangeOption {
  label: string;
  value: Range;
  days: number | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const RANGES: RangeOption[] = [
  { label: '7D',    value: '7d',  days: 7   },
  { label: '30D',   value: '30d', days: 30  },
  { label: '90D',   value: '90d', days: 90  },
  { label: 'All',   value: 'all', days: null },
];

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  asset,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
  asset: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as DonationDataPoint;
  return (
    <div className="dc-tooltip">
      <p className="dc-tooltip__date">
        {new Date(label!).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      <p className="dc-tooltip__amount">
        {d.totalAmount.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{' '}
        <span className="dc-tooltip__asset">{asset}</span>
      </p>
      <p className="dc-tooltip__count">{d.count} donation{d.count !== 1 ? 's' : ''}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface DonationChartProps {
  projectId?: string;
  authToken?: string;
}

export function DonationChart({ projectId, authToken }: DonationChartProps) {
  const [range, setRange] = useState<Range>('30d');
  const [data, setData] = useState<DonationDataPoint[]>([]);
  const [totalInRange, setTotalInRange] = useState(0);
  const [asset, setAsset] = useState('XLM');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ range });
      if (projectId) params.set('projectId', projectId);

      const headers: Record<string, string> = {};
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      const res = await fetch(`${API_BASE}/donations/chart?${params}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json: AggregatedResponse = await res.json();
      setData(json.data);
      setTotalInRange(json.totalInRange);
      setAsset(json.asset);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [range, projectId, authToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatXAxis = (dateStr: string) => {
    const d = new Date(dateStr);
    if (range === '7d')  return d.toLocaleDateString('en-US', { weekday: 'short' });
    if (range === '30d') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isEmpty = !loading && !error && data.length === 0;

  return (
    <>
      <style>{CSS}</style>
      <section className="dc-root" aria-label="Donation Trends Chart">
        {/* Header */}
        <div className="dc-header">
          <div className="dc-header__left">
            <h2 className="dc-title">Donation Trends</h2>
            {!loading && !error && (
              <p className="dc-total">
                <span className="dc-total__num">
                  {totalInRange.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>{' '}
                {asset} raised
              </p>
            )}
          </div>

          {/* Range selector */}
          <div className="dc-range" role="group" aria-label="Time range">
            {RANGES.map((r) => (
              <button
                key={r.value}
                className={`dc-range__btn${range === r.value ? ' dc-range__btn--active' : ''}`}
                onClick={() => setRange(r.value)}
                aria-pressed={range === r.value}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart area */}
        <div className="dc-chart-wrap" aria-live="polite" aria-busy={loading}>
          {loading ? (
            <div className="dc-loading" aria-label="Loading chart">
              <div className="dc-loading__bars">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="dc-loading__bar"
                    style={{ animationDelay: `${i * 0.05}s`, height: `${30 + Math.random() * 70}%` }}
                  />
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="dc-error" role="alert">
              ⚠️ {error}{' '}
              <button className="dc-retry" onClick={fetchData}>Retry</button>
            </div>
          ) : isEmpty ? (
            <div className="dc-empty">
              <span className="dc-empty__icon">📊</span>
              <p className="dc-empty__title">No donation data yet</p>
              <p className="dc-empty__sub">Data will appear here once donations are recorded.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="dc-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--dc-accent)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--dc-accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--dc-border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fill: 'var(--dc-muted)', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fill: 'var(--dc-muted)', fontSize: 11, fontFamily: 'DM Mono, monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                  }
                  width={48}
                />
                <Tooltip
                  content={<ChartTooltip asset={asset} />}
                  cursor={{ stroke: 'var(--dc-accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="totalAmount"
                  stroke="var(--dc-accent)"
                  strokeWidth={2}
                  fill="url(#dc-grad)"
                  dot={false}
                  activeDot={{ r: 5, fill: 'var(--dc-accent)', strokeWidth: 0 }}
                  animationDuration={600}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap');

  .dc-root {
    --dc-bg: hsl(var(--background));
    --dc-surface: hsl(var(--card));
    --dc-border: hsl(var(--border));
    --dc-accent: hsl(var(--primary));
    --dc-text: hsl(var(--foreground));
    --dc-muted: hsl(var(--muted-foreground));
    --dc-fail: hsl(var(--destructive));

    background: var(--dc-bg);
    border: 1px solid var(--dc-border);
    border-radius: 10px;
    padding: 28px 24px;
    font-family: 'DM Mono', 'Courier New', monospace;
    color: var(--dc-text);
    max-width: 960px;
    margin: 0 auto;
  }

  .dc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }

  .dc-title {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 1.6rem;
    font-weight: 300;
    letter-spacing: -0.02em;
    margin: 0 0 4px;
  }

  .dc-total {
    font-size: 0.8rem;
    color: var(--dc-muted);
    margin: 0;
  }
  .dc-total__num {
    font-size: 1.4rem;
    font-weight: 500;
    color: var(--dc-accent);
    letter-spacing: -0.02em;
  }

  .dc-range {
    display: flex;
    gap: 4px;
    background: var(--dc-surface);
    border: 1px solid var(--dc-border);
    border-radius: 8px;
    padding: 4px;
  }
  .dc-range__btn {
    background: none;
    border: none;
    color: var(--dc-muted);
    font-family: 'DM Mono', monospace;
    font-size: 0.75rem;
    padding: 5px 14px;
    border-radius: 5px;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    letter-spacing: 0.04em;
  }
  .dc-range__btn:hover { color: var(--dc-text); }
  .dc-range__btn--active {
    background: var(--dc-bg);
    color: var(--dc-accent);
    font-weight: 500;
  }

  .dc-chart-wrap {
    height: 280px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Skeleton loading bars */
  .dc-loading {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 3px;
    padding: 20px 48px 30px;
    box-sizing: border-box;
  }
  .dc-loading__bars { display: flex; align-items: flex-end; gap: 3px; width: 100%; height: 100%; }
  .dc-loading__bar {
    flex: 1;
    border-radius: 3px 3px 0 0;
    background: linear-gradient(180deg, #252830 0%, #1e2025 100%);
    animation: dc-pulse 1.4s ease-in-out infinite;
  }
  @keyframes dc-pulse {
    0%, 100% { opacity: 0.4; }
    50%       { opacity: 0.9; }
  }

  /* Tooltip */
  .dc-tooltip {
    background: #1a1d22;
    border: 1px solid #2e3138;
    border-radius: 8px;
    padding: 12px 16px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
  }
  .dc-tooltip__date   { font-size: 0.7rem; color: var(--dc-muted); margin: 0 0 6px; text-transform: uppercase; letter-spacing: 0.07em; }
  .dc-tooltip__amount { font-size: 1.05rem; font-weight: 500; color: var(--dc-accent); margin: 0 0 2px; }
  .dc-tooltip__asset  { font-size: 0.72rem; color: var(--dc-muted); font-weight: 400; }
  .dc-tooltip__count  { font-size: 0.75rem; color: var(--dc-muted); margin: 0; }

  /* Empty & Error */
  .dc-empty {
    text-align: center;
    display: flex; flex-direction: column; align-items: center; gap: 8px;
  }
  .dc-empty__icon  { font-size: 2.4rem; }
  .dc-empty__title { font-family: 'Fraunces', serif; font-size: 1.1rem; font-weight: 600; margin: 0; }
  .dc-empty__sub   { font-size: 0.82rem; color: var(--dc-muted); margin: 0; }

  .dc-error {
    color: var(--dc-fail);
    font-size: 0.85rem;
    text-align: center;
  }
  .dc-retry {
    background: none; border: 1px solid var(--dc-fail); color: var(--dc-fail);
    font-family: 'DM Mono', monospace; font-size: 0.78rem; padding: 4px 12px;
    border-radius: 6px; cursor: pointer; margin-left: 10px;
    transition: background 0.15s;
  }
  .dc-retry:hover { background: rgba(248,113,113,0.1); }

  @media (max-width: 520px) {
    .dc-header { flex-direction: column; }
    .dc-range  { align-self: stretch; justify-content: space-between; }
  }
`;

export default DonationChart;