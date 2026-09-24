/**
 * Shared UI components (design system).
 *
 * Presentational only: props in, markup out. No business logic, data
 * fetching, or domain state belongs here.
 */
export { default as Button } from './Button'
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button'
export { default as ErrorBoundary } from './ErrorBoundary'
export { default as Input } from './Input'
export type { InputProps } from './Input'
export { default as Modal } from './Modal'
export type { ModalProps } from './Modal'
export { default as Spinner } from './Spinner'
export type { SpinnerProps } from './Spinner'
export { default as ThemeProvider } from './ThemeProvider'
export { default as ThemeToggle } from './ThemeToggle'
export { useTheme } from './useTheme'
