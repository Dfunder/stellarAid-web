'use client';

import { useState, FormEvent } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/app/components/common/Modal';

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistName?: string;
  onSubmitted?: (payload: { stars: number; comment: string }) => void;
}

export default function LeaveReviewModal({
  isOpen,
  onClose,
  artistName = 'the artist',
  onSubmitted,
}: LeaveReviewModalProps) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const trimmedComment = comment.trim();
  const canSubmit = stars > 0 && trimmedComment.length >= 5 && !submitting;

  const reset = () => {
    setStars(0);
    setHoverStars(0);
    setComment('');
    setSubmitting(false);
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    // Mock submission — replace with a real API call when the reviews backend ships.
    window.setTimeout(() => {
      setSubmitting(false);
      toast.success(`Thanks for reviewing ${artistName}!`);
      onSubmitted?.({ stars, comment: trimmedComment });
      reset();
      onClose();
    }, 600);
  };

  const displayedStars = hoverStars || stars;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Leave a review" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            How was your experience working with <span className="font-semibold">{artistName}</span>
            ?
          </p>

          <div
            role="radiogroup"
            aria-label="Star rating"
            className="mt-3 flex items-center gap-1"
            onMouseLeave={() => setHoverStars(0)}
          >
            {[1, 2, 3, 4, 5].map((value) => {
              const filled = value <= displayedStars;
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={stars === value}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                  onClick={() => setStars(value)}
                  onMouseEnter={() => setHoverStars(value)}
                  onFocus={() => setHoverStars(value)}
                  onBlur={() => setHoverStars(0)}
                  className="rounded p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <Star
                    className={
                      'h-7 w-7 transition-colors ' +
                      (filled
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600')
                    }
                    aria-hidden="true"
                  />
                </button>
              );
            })}
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400" aria-live="polite">
              {displayedStars > 0 ? `${displayedStars} / 5` : 'Tap a star'}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="leave-review-comment"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Your review
          </label>
          <textarea
            id="leave-review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what stood out — communication, quality, timeliness…"
            rows={4}
            className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Minimum 5 characters.</p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit review'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
