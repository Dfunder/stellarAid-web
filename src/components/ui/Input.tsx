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
export default function Input({ label, error, hint, className, id, ...rest }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  let describedBy: string | undefined
  if (error) describedBy = errorId
  else if (hint) describedBy = hintId

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-caption-sm font-semibold text-foreground">
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(BASE_CLASSES, error ? 'border-danger' : 'border-line', className)}
        {...rest}
      />
      {error ? (
        <p id={errorId} className="text-caption-sm text-danger">
          {error}
        </p>
      ) : null}
      {!error && hint ? (
        <p id={hintId} className="text-caption-sm text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
