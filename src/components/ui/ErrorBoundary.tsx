import { Component, Fragment, type ErrorInfo, type ReactNode } from 'react'
import { reportError, type ErrorReporter } from '@/lib/analytics'

const ISSUES_BASE_URL = 'https://github.com/Dfunder/stellarAid-web/issues/new'

interface ErrorBoundaryProps {
  children: ReactNode
  /** Optional replacement for the default console + analytics reporting. */
  onError?: ErrorReporter
}

interface ErrorBoundaryState {
  error: Error | null
  /** Incremented on every retry so the failed subtree is fully remounted. */
  attempt: number
}

/**
 * Global error boundary: catches unexpected render errors and shows a branded
 * recovery screen instead of a blank page.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, attempt: 0 }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const report: ErrorReporter = this.props.onError ?? reportError
    report(error, { componentStack: info.componentStack ?? null })
  }

  private handleRetry = (): void => {
    this.setState((state) => ({ error: null, attempt: state.attempt + 1 }))
  }

  render(): ReactNode {
    const { error, attempt } = this.state

    if (error) {
      return <ErrorBoundaryFallback error={error} onRetry={this.handleRetry} />
    }

    // Bump the key on each retry to force a full remount of the failed subtree.
    return <Fragment key={attempt}>{this.props.children}</Fragment>
  }
}

function buildReportLink(error: Error): string {
  const url = new URL(ISSUES_BASE_URL)
  url.searchParams.set('title', 'ErrorBoundary: Something went wrong')
  url.searchParams.set(
    'body',
    `## What happened\n\nDescribe what you were doing when the error appeared.\n\n## Details\n\n\`\`\`\n${error.message}\n\`\`\``,
  )
  return url.toString()
}

function ErrorBoundaryFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const showDetails = import.meta.env.DEV

  return (
    <main
      role="alert"
      className="flex min-h-screen items-center justify-center bg-background px-8 py-16 text-foreground"
    >
      <div className="w-full max-w-2xl border-t-4 border-t-primary rounded-card bg-surface p-8 shadow-elevated">
        <h1 className="text-h3">Something went wrong</h1>
        <p className="mt-2 text-body text-muted">
          An unexpected error occurred while rendering this page. You can try again, or report the
          issue so we can fix it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast focus-visible:shadow-focus-ring"
          >
            Try again
          </button>
          <a
            href={buildReportLink(error)}
            className="rounded-control border border-line bg-surface px-5 py-2.5 text-body font-semibold text-foreground shadow-card focus-visible:shadow-focus-ring"
          >
            Report issue
          </a>
        </div>
        {showDetails && (
          <details className="mt-6">
            <summary className="mb-2 cursor-pointer text-caption-sm font-semibold">
              Error details
            </summary>
            <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap break-words rounded-control border border-line bg-surface-muted p-3 text-caption-sm">
              {error.stack ?? error.message}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}
