'use client';

/**
 * Pagination — server-side pagination controls (#146)
 *
 * Features:
 *  - Page size selector (12 / 24 / 48 per page)
 *  - Previous / Next navigation
 *  - Page number buttons with ellipsis
 *  - Total count display
 *  - Keyboard navigation (← / →)
 *  - URL query params: ?page=2&size=24
 */

import React, { useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const PAGE_SIZE_OPTIONS = [12, 24, 48] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export interface PaginationProps {
  /** Current 1-based page number */
  page: number;
  /** Number of items per page */
  pageSize: PageSize;
  /** Total number of items across all pages */
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: PageSize) => void;
  /** Whether to listen for ← / → keyboard navigation */
  enableKeyboard?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Returns an array of page numbers / ellipsis markers to render */
function buildPageRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '…')[] = [1];

  if (current > 3) pages.push('…');

  const start = clamp(current - 1, 2, total - 1);
  const end = clamp(current + 1, 2, total - 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('…');

  pages.push(total);
  return pages;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  enableKeyboard = true,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const goTo = useCallback(
    (p: number) => onPageChange(clamp(p, 1, totalPages)),
    [onPageChange, totalPages],
  );

  // Keyboard navigation
  useEffect(() => {
    if (!enableKeyboard) return;

    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (e.key === 'ArrowLeft') goTo(page - 1);
      else if (e.key === 'ArrowRight') goTo(page + 1);
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enableKeyboard, page, goTo]);

  const pageRange = buildPageRange(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between"
    >
      {/* Total count */}
      <p className="text-sm text-neutral-500">
        {total === 0 ? (
          'No results'
        ) : (
          <>
            Showing <span className="font-medium text-neutral-900">{from}–{to}</span> of{' '}
            <span className="font-medium text-neutral-900">{total}</span> campaigns
          </>
        )}
      </p>

      <div className="flex items-center gap-3">
        {/* Page size selector */}
        <div className="flex items-center gap-2 text-sm text-neutral-600">
          <label htmlFor="page-size-select" className="whitespace-nowrap">
            Per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value) as PageSize);
              onPageChange(1);
            }}
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Prev / page numbers / Next */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous page"
            disabled={page <= 1}
            onClick={() => goTo(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageRange.map((item, idx) =>
            item === '…' ? (
              <span
                key={`ellipsis-${idx}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-neutral-400"
              >
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => goTo(item)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition
                  ${item === page
                    ? 'bg-primary-600 text-white shadow-sm'
                    : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-100'
                  }`}
              >
                {item}
              </button>
            ),
          )}

          <button
            type="button"
            aria-label="Next page"
            disabled={page >= totalPages}
            onClick={() => goTo(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Pagination;
