import { Button, Spinner } from '.'

interface ErrorStateProps {
  /** Error message */
  message: string
  /** Retry callback */
  onRetry?: () => void
  /** Retry button label */
  retryLabel?: string
  /** Additional CSS classes */
  className?: string
  /** Whether a retry is in progress */
  isRetrying?: boolean
  /** Error code for categorization */
  code?: string
}

export default function ErrorState({
  message,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
  isRetrying = false,
  code,
}: ErrorStateProps) {
  return (
    <div className={`rounded-control border border-danger/30 bg-danger/5 p-6 ${className}`} role="alert">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-danger/10 flex items-center justify-center flex-shrink-0">
            <svg className="h-5 w-5 text-danger" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div>
            <p className="text-caption-sm font-semibold text-danger">Something went wrong</p>
            <p className="mt-1 text-caption text-foreground">{message}</p>
            {code && <p className="mt-1 text-caption-xs text-muted">Error code: {code}</p>}
          </div>
        </div>
        {onRetry && (
          <Button
            size="sm"
            variant="secondary"
            onClick={onRetry}
            isLoading={isRetrying}
            disabled={isRetrying}
          >
            {isRetrying ? <Spinner className="h-4 w-4" /> : retryLabel}
          </Button>
        )}
      </div>
    </div>
  )
}