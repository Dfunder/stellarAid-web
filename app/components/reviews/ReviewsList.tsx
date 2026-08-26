'use client';

import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

export interface Review {
  id: string;
  authorName: string;
  authorInitials: string;
  stars: number;
  comment: string;
  postedAt: string;
}

interface ReviewsListProps {
  reviews: Review[];
  pageSize?: number;
}

function StarRow({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <Star
            key={star}
            className={
              'h-4 w-4 ' +
              (filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600')
            }
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

export default function ReviewsList({ reviews, pageSize = 5 }: ReviewsListProps) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [reviews]);

  const summary = useMemo(() => {
    if (reviews.length === 0) {
      return { average: 0, total: 0, distribution: [0, 0, 0, 0, 0] as number[] };
    }
    const distribution: number[] = [0, 0, 0, 0, 0];
    let totalStars = 0;
    let validCount = 0;
    for (const review of reviews) {
      const stars = typeof review.stars === 'number' ? review.stars : 0;
      if (stars >= 1 && stars <= 5) {
        const clamped = Math.round(stars);
        distribution[clamped - 1]! += 1;
        totalStars += stars;
        validCount++;
      }
    }
    const average = validCount > 0 ? Math.round((totalStars / validCount) * 10) / 10 : 0;
    return {
      average: Math.max(0, Math.min(5, average)),
      total: validCount,
      distribution,
    };
  }, [reviews]);

  const totalPages = Math.max(1, Math.ceil(reviews.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visible = reviews.slice(startIndex, startIndex + pageSize);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <section aria-label="Artist reviews" className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Client reviews</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            What people said after working with this artist.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="text-3xl font-semibold text-gray-900 dark:text-white">
            {summary.average.toFixed(1)}
          </div>
          <div className="flex flex-col">
            <StarRow value={Math.round(summary.average)} />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {summary.total} review{summary.total === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-2 rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.distribution[star - 1] ?? 0;
          const percent = summary.total === 0 ? 0 : Math.round((count / summary.total) * 100);
          return (
            <div
              key={star}
              className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300"
            >
              <span className="w-6 shrink-0 text-right">{star}</span>
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
              <div
                className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span
                aria-label={`${count} reviews`}
                className="w-10 text-right text-gray-500 dark:text-gray-400"
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
          No reviews yet.
        </p>
      ) : (
        <ul className="space-y-3" aria-label={`Page ${currentPage} of reviews`}>
          {visible.map((review) => (
            <li
              key={review.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-200">
                  {review.authorInitials}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {review.authorName}
                    </p>
                    <StarRow value={review.stars} />
                  </div>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">
                    {review.comment}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{review.postedAt}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <nav
          aria-label="Reviews pagination"
          className="flex items-center justify-between gap-2 pt-2"
        >
          <button
            type="button"
            onClick={goPrev}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {currentPage} of {totalPages}
          </p>
          <button
            type="button"
            onClick={goNext}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      )}
    </section>
  );
}
