export interface ErrorReportInfo {
  componentStack: string | null
}

export type ErrorReporter = (error: Error, info: ErrorReportInfo) => void

let errorReporter: ErrorReporter | null = null

/**
 * Registers the analytics handler invoked for render errors. Replacing the
 * default console-only reporting (e.g. with a real analytics SDK).
 */
export function setErrorReporter(reporter: ErrorReporter | null): void {
  errorReporter = reporter
}

/** Logs a render error to the console and forwards it to the registered reporter. */
export function reportError(error: Error, info: ErrorReportInfo): void {
  if (info.componentStack) {
    console.error('[ErrorBoundary] render error:', error, info.componentStack)
  } else {
    console.error('[ErrorBoundary] render error:', error)
  }

  if (!errorReporter) return
  try {
    errorReporter(error, info)
  } catch {
    // A reporter must never mask the original error.
  }
}
