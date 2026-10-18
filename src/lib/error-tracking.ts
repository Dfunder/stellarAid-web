/**
 * Server-side error monitoring (#936).
 * Posts structured error payloads to the monitoring endpoint.
 * User-facing UI must never display these internals.
 */

export interface ServerErrorPayload {
  message: string
  name: string
  stack?: string
  componentStack: string | null
  timestamp: string
  url?: string
  userAgent?: string
  source: 'error_boundary' | 'global_handler' | 'manual'
}

const DEFAULT_ENDPOINT = '/api/monitoring/errors'

let endpoint = DEFAULT_ENDPOINT

/** Override the monitoring endpoint (e.g. in tests). */
export function setErrorTrackingEndpoint(url: string): void {
  endpoint = url
}

/**
 * Fire-and-forget log of an error to the backend monitoring service.
 * Never throws to callers.
 */
export async function logErrorToServer(
  error: Error,
  info: { componentStack?: string | null; source?: ServerErrorPayload['source'] } = {},
): Promise<void> {
  const payload: ServerErrorPayload = {
    message: error.message,
    name: error.name,
    stack: error.stack,
    componentStack: info.componentStack ?? null,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    source: info.source ?? 'manual',
  }

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      // keepalive so the request can outlive a page unload
      keepalive: true,
    })
  } catch {
    // Monitoring must not break the app.
  }
}
