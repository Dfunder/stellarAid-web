import {
  cloneElement,
  isValidElement,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'
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
   * Renders the single child element (usually a react-router `<Link>` or an
   * `<a>`) in place of the `<button>`, merging the button's classes and
   * props onto it (#780). Without this, ~30 call sites produced invalid
   * `<button><a></button>` nesting that browsers refuse to make clickable.
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

  if (asChild && isValidElement(children)) {
    // Radix-Slot-style single-child merge: the child *is* the rendered
    // element, so a <Link>/<a> stays a real link (keyboard, middle-click,
    // screen readers) instead of being nested inside a <button>.
    const child = children as ReactElement<Record<string, unknown>>
    const childProps = child.props
    const childOnClick = childProps['onClick'] as
      ((event: React.MouseEvent<Element>) => void) | undefined
    const childClassName = childProps['className'] as string | false | null | undefined
    // `asChild` forwards a click from an arbitrary element (usually a link),
    // not necessarily an HTMLButtonElement.
    const onClick = rest.onClick as ((event: React.MouseEvent<Element>) => void) | undefined
    return cloneElement(child, {
      ...childProps,
      ...rest,
      className: cn(classes, childClassName),
      'aria-busy': isLoading || undefined,
      onClick: (event: React.MouseEvent<Element>) => {
        childOnClick?.(event)
        onClick?.(event)
      },
    })
  }

  return (
    <button
      type={type}
      disabled={disabled === true || isLoading}
      aria-busy={isLoading || undefined}
      className={classes}
      {...rest}
    >
      {isLoading ? <Spinner /> : null}
      {children}
    </button>
  )
}
