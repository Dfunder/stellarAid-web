'use client';

import React, { useState, useEffect, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Donation {
  id: string;
  donor: string | null;
  amount: string;
  asset: string;
  project: { id: string; title: string };
  transactionHash: string;
  createdAt: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED';
}

interface PaginatedDonations {
  data: Donation[];
  total: number;
  page: number;
  pageSize: number;
}

interface Filters {
  projectId: string;
  dateFrom: string;
  dateTo: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HORIZON_EXPLORER =
  process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL ||
  'https://stellar.expert/explorer/testnet/tx';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const PAGE_SIZE = 10;

function truncateHash(hash: string) {
  return `${hash.slice(0, 6)}…${hash.slice(-6)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="rd-skeleton-row" aria-hidden="true">
      <span className="rd-skel rd-skel--name" />
      <span className="rd-skel rd-skel--amount" />
      <span className="rd-skel rd-skel--project" />
      <span className="rd-skel rd-skel--date" />
      <span className="rd-skel rd-skel--hash" />
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="rd-empty">
      <span className="rd-empty__icon">🌌</span>
      <p className="rd-empty__title">
        {filtered ? 'No donations match your filters' : 'No donations yet'}
      </p>
      <p className="rd-empty__sub">
        {filtered
          ? 'Try adjusting the date range or project.'
          : 'Be the first to support a project on StellarAid.'}
      </p>
    </div>
  );
}

// ─── Donation Row ─────────────────────────────────────────────────────────────

function DonationRow({ donation }: { donation: Donation }) {
  const statusClass = `rd-badge rd-badge--${donation.status.toLowerCase()}`;
  return (
    <div className="rd-row" role="row">
      <span className="rd-row__donor">
        {donation.donor ?? <em className="rd-anon">Anonymous</em>}
      </span>
      <span className="rd-row__amount">
        {parseFloat(donation.amount).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 7,
        })}{' '}
        <span className="rd-row__asset">{donation.asset}</span>
      </span>
      <span className="rd-row__project">{donation.project.title}</span>
      <span className="rd-row__date">{formatDate(donation.createdAt)}</span>
      <span className="rd-row__hash">
        <a
          href={`${HORIZON_EXPLORER}/${donation.transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
          title={donation.transactionHash}
          className="rd-link"
        >
          {truncateHash(donation.transactionHash)}
          <svg
            width="11"
            height="11"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3.5 1H11M11 1V8.5M11 1L1 11"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
        <span className={statusClass}>{donation.status}</span>
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface RecentDonationsProps {
  /** Optionally pin to a specific project */
  projectId?: string;
  /** Override token for authenticated requests */
  authToken?: string;
}

export function RecentDonations({ projectId, authToken }: RecentDonationsProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    projectId: projectId ?? '',
    dateFrom: '',
    dateTo: '',
  });

  const isFiltered = !!(filters.projectId || filters.dateFrom || filters.dateTo);

  const buildUrl = useCallback(
    (p: number) => {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(PAGE_SIZE),
      });
      if (filters.projectId) params.set('projectId', filters.projectId);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      return `${API_BASE}/donations?${params.toString()}`;
    },
    [filters],
  );

  const fetchDonations = useCallback(
    async (p: number, append: boolean) => {
      try {
        append ? setLoadingMore(true) : setLoading(true);
        setError(null);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const res = await fetch(buildUrl(p), { headers });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json: PaginatedDonations = await res.json();
        setTotal(json.total);
        setDonations((prev) => (append ? [...prev, ...json.data] : json.data));
      } catch (err: any) {
        setError(err.message ?? 'Failed to load donations');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [buildUrl, authToken],
  );

  // Reset and reload when filters change
  useEffect(() => {
    setPage(1);
    setDonations([]);
    fetchDonations(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchDonations(next, true);
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const hasMore = donations.length < total;

  return (
    <>
      <style>{CSS}</style>
      <section className="rd-root" aria-label="Recent Donations">
        {/* Header */}
        <div className="rd-header">
          <h2 className="rd-title">Recent Donations</h2>
          {!loading && (
            <span className="rd-count">
              {total.toLocaleString()} total
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="rd-filters" role="group" aria-label="Donation filters">
          {!projectId && (
            <input
              className="rd-input"
              type="text"
              name="projectId"
              placeholder="Filter by project ID"
              value={filters.projectId}
              onChange={handleFilterChange}
              aria-label="Project ID filter"
            />
          )}
          <input
            className="rd-input"
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleFilterChange}
            aria-label="From date"
          />
          <input
            className="rd-input"
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleFilterChange}
            aria-label="To date"
          />
          {isFiltered && (
            <button
              className="rd-clear-btn"
              onClick={() =>
                setFilters({ projectId: projectId ?? '', dateFrom: '', dateTo: '' })
              }
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Column Headers */}
        <div className="rd-col-headers" role="row" aria-hidden="true">
          <span>Donor</span>
          <span>Amount</span>
          <span>Project</span>
          <span>Date</span>
          <span>Transaction</span>
        </div>

        {/* Content */}
        <div className="rd-list" role="list" aria-live="polite" aria-busy={loading}>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : error ? (
            <div className="rd-error" role="alert">
              ⚠️ {error}{' '}
              <button className="rd-retry" onClick={() => fetchDonations(1, false)}>
                Retry
              </button>
            </div>
          ) : donations.length === 0 ? (
            <EmptyState filtered={isFiltered} />
          ) : (
            donations.map((d) => <DonationRow key={d.id} donation={d} />)
          )}
        </div>

        {/* Load More */}
        {!loading && !error && hasMore && (
          <div className="rd-footer">
            <button
              className="rd-load-more"
              onClick={handleLoadMore}
              disabled={loadingMore}
              aria-label="Load more donations"
            >
              {loadingMore ? (
                <span className="rd-spinner" aria-hidden="true" />
              ) : (
                `Load more (${total - donations.length} remaining)`
              )}
            </button>
          </div>
        )}
      </section>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Fraunces:opsz,wght@9..144,300;9..144,600&display=swap');

  .rd-root {
    --rd-bg: #0d0f12;
    --rd-surface: #141619;
    --rd-border: #232529;
    --rd-accent: #5ef0a0;
    --rd-text: #e8eaed;
    --rd-muted: #6b7280;
    --rd-link: #7dd3fc;
    --rd-fail: #f87171;
    --rd-pending: #fbbf24;
    --rd-confirmed: #34d399;
    --rd-radius: 10px;
    --rd-font-display: 'Fraunces', Georgia, serif;
    --rd-font-mono: 'DM Mono', 'Courier New', monospace;

    background: var(--rd-bg);
    border: 1px solid var(--rd-border);
    border-radius: var(--rd-radius);
    padding: 28px 24px;
    font-family: var(--rd-font-mono);
    color: var(--rd-text);
    max-width: 960px;
    margin: 0 auto;
  }

  .rd-header {
    display: flex;
    align-items: baseline;
    gap: 14px;
    margin-bottom: 20px;
  }

  .rd-title {
    font-family: var(--rd-font-display);
    font-size: 1.6rem;
    font-weight: 300;
    letter-spacing: -0.02em;
    color: var(--rd-text);
    margin: 0;
  }

  .rd-count {
    font-size: 0.75rem;
    color: var(--rd-muted);
    background: #1e2025;
    border: 1px solid var(--rd-border);
    padding: 2px 10px;
    border-radius: 999px;
  }

  .rd-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 18px;
  }

  .rd-input {
    background: #1a1d22;
    border: 1px solid var(--rd-border);
    color: var(--rd-text);
    font-family: var(--rd-font-mono);
    font-size: 0.78rem;
    padding: 7px 12px;
    border-radius: 6px;
    outline: none;
    transition: border-color 0.15s;
    flex: 1;
    min-width: 140px;
  }
  .rd-input:focus { border-color: var(--rd-accent); }
  .rd-input::placeholder { color: var(--rd-muted); }
  .rd-input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); }

  .rd-clear-btn {
    background: none;
    border: 1px solid var(--rd-border);
    color: var(--rd-muted);
    font-family: var(--rd-font-mono);
    font-size: 0.75rem;
    padding: 7px 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .rd-clear-btn:hover { color: var(--rd-text); border-color: var(--rd-muted); }

  .rd-col-headers {
    display: grid;
    grid-template-columns: 1.6fr 1.2fr 1.8fr 1fr 1.6fr;
    padding: 0 12px 8px;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--rd-muted);
    border-bottom: 1px solid var(--rd-border);
    margin-bottom: 4px;
  }

  .rd-list { display: flex; flex-direction: column; gap: 2px; }

  .rd-row {
    display: grid;
    grid-template-columns: 1.6fr 1.2fr 1.8fr 1fr 1.6fr;
    align-items: center;
    padding: 11px 12px;
    border-radius: 6px;
    font-size: 0.82rem;
    background: transparent;
    border: 1px solid transparent;
    transition: background 0.15s, border-color 0.15s;
  }
  .rd-row:hover { background: #1a1d22; border-color: var(--rd-border); }

  .rd-row__donor { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .rd-anon { font-style: italic; color: var(--rd-muted); font-weight: 400; }
  .rd-row__amount { color: var(--rd-accent); font-weight: 500; }
  .rd-row__asset { font-size: 0.7rem; color: var(--rd-muted); }
  .rd-row__project { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #c4cad4; }
  .rd-row__date { color: var(--rd-muted); font-size: 0.78rem; }
  .rd-row__hash { display: flex; align-items: center; gap: 8px; }

  .rd-link {
    color: var(--rd-link);
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 0.78rem;
    transition: opacity 0.15s;
  }
  .rd-link:hover { opacity: 0.75; text-decoration: underline; }

  .rd-badge {
    font-size: 0.62rem;
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 999px;
    border: 1px solid;
    white-space: nowrap;
  }
  .rd-badge--confirmed { color: var(--rd-confirmed); border-color: var(--rd-confirmed); background: rgba(52,211,153,0.08); }
  .rd-badge--pending  { color: var(--rd-pending);   border-color: var(--rd-pending);   background: rgba(251,191,36,0.08); }
  .rd-badge--failed   { color: var(--rd-fail);      border-color: var(--rd-fail);      background: rgba(248,113,113,0.08); }

  /* Skeleton */
  .rd-skeleton-row {
    display: grid;
    grid-template-columns: 1.6fr 1.2fr 1.8fr 1fr 1.6fr;
    padding: 11px 12px;
    gap: 8px;
  }
  .rd-skel {
    display: block;
    height: 14px;
    border-radius: 4px;
    background: linear-gradient(90deg, #1e2025 25%, #252830 50%, #1e2025 75%);
    background-size: 200% 100%;
    animation: rd-shimmer 1.4s infinite;
  }
  .rd-skel--name    { width: 70%; }
  .rd-skel--amount  { width: 55%; }
  .rd-skel--project { width: 80%; }
  .rd-skel--date    { width: 60%; }
  .rd-skel--hash    { width: 75%; }
  @keyframes rd-shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* Empty & Error */
  .rd-empty {
    text-align: center;
    padding: 60px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }
  .rd-empty__icon { font-size: 2.4rem; }
  .rd-empty__title { font-family: var(--rd-font-display); font-size: 1.1rem; font-weight: 600; margin: 0; }
  .rd-empty__sub   { font-size: 0.82rem; color: var(--rd-muted); margin: 0; }

  .rd-error {
    padding: 20px;
    color: var(--rd-fail);
    font-size: 0.85rem;
    text-align: center;
  }
  .rd-retry {
    background: none; border: 1px solid var(--rd-fail); color: var(--rd-fail);
    font-family: var(--rd-font-mono); font-size: 0.78rem; padding: 4px 12px;
    border-radius: 6px; cursor: pointer; margin-left: 10px;
    transition: background 0.15s;
  }
  .rd-retry:hover { background: rgba(248,113,113,0.1); }

  /* Footer / Load more */
  .rd-footer { display: flex; justify-content: center; margin-top: 18px; }
  .rd-load-more {
    background: #1a1d22;
    border: 1px solid var(--rd-border);
    color: var(--rd-text);
    font-family: var(--rd-font-mono);
    font-size: 0.8rem;
    padding: 10px 28px;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 200px;
    justify-content: center;
  }
  .rd-load-more:hover:not(:disabled) { border-color: var(--rd-accent); background: #1e2228; }
  .rd-load-more:disabled { opacity: 0.5; cursor: not-allowed; }

  .rd-spinner {
    width: 14px; height: 14px;
    border: 2px solid var(--rd-border);
    border-top-color: var(--rd-accent);
    border-radius: 50%;
    animation: rd-spin 0.7s linear infinite;
  }
  @keyframes rd-spin { to { transform: rotate(360deg); } }

  /* Responsive */
  @media (max-width: 680px) {
    .rd-col-headers { display: none; }
    .rd-row, .rd-skeleton-row {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto auto;
      gap: 4px;
    }
    .rd-row__project { grid-column: 1 / -1; }
    .rd-row__hash    { grid-column: 1 / -1; flex-wrap: wrap; }
  }
`;

export default RecentDonations;