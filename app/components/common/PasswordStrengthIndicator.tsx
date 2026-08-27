'use client';

import React from 'react';
import { cn } from '@/lib/cn';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

// Pre-defined Tailwind classes for each strength level (0–5).
// Using static class maps instead of runtime dynamic `style` objects
// means Tailwind includes these classes at build time and the browser
// never allocates new style objects on every keystroke.
const STRENGTH_LABELS = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'] as const;

const STRENGTH_BAR_CLASSES = [
  'bg-red-500', // 0 – very weak
  'bg-orange-500', // 1 – weak
  'bg-yellow-400', // 2 – fair
  'bg-lime-500', // 3 – good
  'bg-green-500', // 4 – strong
  'bg-emerald-500', // 5 – very strong
] as const;

const STRENGTH_TEXT_CLASSES = [
  'text-red-600 dark:text-red-400',
  'text-orange-600 dark:text-orange-400',
  'text-yellow-600 dark:text-yellow-400',
  'text-lime-600 dark:text-lime-400',
  'text-green-600 dark:text-green-400',
  'text-emerald-600 dark:text-emerald-400',
] as const;

function getStrength(password?: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length > 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const strength = getStrength(password);
  const label = STRENGTH_LABELS[strength] ?? 'Very Weak';
  const barClass = STRENGTH_BAR_CLASSES[strength] ?? 'bg-red-500';
  const textClass = STRENGTH_TEXT_CLASSES[strength] ?? 'text-red-600 dark:text-red-400';
  // Width expressed as a fraction of 5 → mapped to Tailwind width utilities.
  // We use inline style only for the dynamic width percentage — this is the
  // correct pattern; the static color and shape come from pre-built classes.
  const widthPct = `${(strength / 5) * 100}%`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-600 dark:text-neutral-400 font-medium">
          Password strength
        </span>
        <span className={cn('font-semibold transition-colors', textClass)}>{label}</span>
      </div>

      {/* Track */}
      <div className="w-full h-2.5 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
        {/* Fill — only the width is dynamic; color comes from a pre-built class */}
        <div
          className={cn('h-full rounded-full transition-all duration-300', barClass)}
          style={{ width: widthPct }}
          role="meter"
          aria-valuenow={strength}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={`Password strength: ${label}`}
        />
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
