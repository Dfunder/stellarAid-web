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
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: '#fafafa',
        color: '#1f2937',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '32rem',
          width: '100%',
          padding: '2rem',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderTop: '3px solid #4f46e5',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem' }}>Something went wrong</h1>
        <p style={{ margin: '0 0 1.5rem', lineHeight: 1.5 }}>
          An unexpected error occurred while rendering this page. You can try again, or report the
          issue so we can fix it.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onRetry}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              borderRadius: '0.375rem',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '0.925rem',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
          <a
            href={buildReportLink(error)}
            style={{
              padding: '0.6rem 1.25rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              backgroundColor: '#ffffff',
              color: '#374151',
              fontSize: '0.925rem',
              textDecoration: 'none',
            }}
          >
            Report issue
          </a>
        </div>
        {showDetails && (
          <details style={{ marginTop: '1.5rem' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>Error details</summary>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                padding: '0.75rem',
                fontSize: '0.8125rem',
                maxHeight: '16rem',
                overflowY: 'auto',
              }}
            >
              {error.stack ?? error.message}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}
