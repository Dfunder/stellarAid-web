import { useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  /** Error message; when set the field is marked invalid and described by it. */
  error?: string | null
  /** Helper text shown when there is no error. */
  hint?: string | null
}

const BASE_CLASSES =
  'w-full rounded-control border bg-surface px-3.5 py-2.5 text-body text-foreground shadow-card placeholder:text-muted focus-visible:shadow-focus-ring disabled:cursor-not-allowed disabled:opacity-60'

/** Labelled text input with built-in error and hint messaging. */
export default function Input({
  label,
  error,
  hint,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  // The error and the hint are two descriptions, and a caller may supply a
  // third; the field is described by all of them at once (#797).
  const describedBy =
    [ariaDescribedBy, error ? errorId : null, hint ? hintId : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-caption-sm font-semibold text-foreground">
        {label}
      </label>
      {/* `{...rest}` is spread first, so a caller cannot strip the component's
          own invalid/description wiring by passing its own props (#797). */}
      <input
        id={inputId}
        {...rest}
        aria-invalid={error ? true : undefined}
        aria-required={rest.required ? true : undefined}
        aria-describedby={describedBy}
        className={cn(BASE_CLASSES, error ? 'border-danger' : 'border-line', className)}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-caption-sm text-danger">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="text-caption-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
