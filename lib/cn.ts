import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Canonical class-name utility.
 *
 * Combines clsx (conditional class logic) with tailwind-merge
 * (conflict resolution) so that duplicate or conflicting Tailwind
 * utilities are resolved at call-site rather than accumulating in
 * the DOM and causing recalculation jank.
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-primary-600', className)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
