import { cn } from '@/lib'

export interface SpinnerProps {
  /** Announced to assistive technology; the spinner is decorative without it. */
  label?: string
  className?: string
}

/** Spinning indicator that inherits the surrounding text color. */
export default function Spinner({ label, className }: SpinnerProps) {
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn(
        'inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  )
}
