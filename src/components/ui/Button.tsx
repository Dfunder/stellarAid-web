import { cloneElement, isValidElement } from 'react'
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import { cn } from '@/lib'
import Spinner from './Spinner'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Shows a spinner and blocks interaction while an action is in flight. */
  isLoading?: boolean
  /**
   * Renders the single child element instead of a <button>, forwarding the
   * button's classes and props to it. Use to style a link or router link.
   */
  asChild?: boolean
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
  lg: 'px-6 py-3 text-body',
}

/** Design-system button with the four semantic variants used across the app. */
export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  asChild = false,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], SIZE_CLASSES[size], className)
  const isDisabled = disabled === true || isLoading

  if (asChild) {
    if (!isValidElement(children)) {
      throw new Error('Button with asChild expects a single React element child')
    }
    const child = children as ReactElement<{ className?: string }>
    return cloneElement(child, {
      className: cn(classes, child.props.className),
      'aria-busy': isLoading || undefined,
      ...rest,
    })
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={classes}
      {...rest}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  )
}
