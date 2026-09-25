import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib'
import Spinner from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner and blocks interaction while an action is in flight. */
  isLoading?: boolean
  children: ReactNode
}

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 rounded-control font-semibold shadow-card transition-colors focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-50'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-contrast hover:bg-primary-strong',
  secondary: 'border border-line bg-surface text-foreground hover:bg-surface-muted',
  danger: 'bg-danger text-primary-contrast hover:bg-danger/90',
  ghost: 'bg-transparent text-muted shadow-none hover:bg-surface-muted hover:text-foreground',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-caption-sm',
  md: 'px-5 py-2.5 text-body',
}

/** Design-system button with the four semantic variants used across the app. */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading || undefined}
      className={cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)}
      {...rest}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  )
}
