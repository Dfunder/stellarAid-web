'use client';

import { MessageSquare } from 'lucide-react';

interface ReviewsTabProps {
  artistId: string;
}

export default function ReviewsTab({ artistId: _artistId }: ReviewsTabProps) {
  return (
    <div className="text-center py-16">
      <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
        <MessageSquare className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        No Reviews Yet
      </h3>
      <p className="text-neutral-400 dark:text-neutral-500 text-sm max-w-sm mx-auto">
        Reviews will appear here once clients share their experiences.
      </p>
    </div>
  );
}
