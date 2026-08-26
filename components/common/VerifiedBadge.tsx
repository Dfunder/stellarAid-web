'use client';

import { BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/cn';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ className = '', size = 'sm' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const containerClasses = {
    sm: 'px-1.5 py-0.5 gap-1 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full bg-blue-100 font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        containerClasses[size],
        className
      )}
      title="Verified Artist"
    >
      <BadgeCheck
        className={cn(sizeClasses[size], 'fill-blue-500 text-white dark:fill-blue-400')}
      />
      <span className="hidden sm:inline">Verified</span>
    </span>
  );
}
