/**
 * Canonical API error contract (#998).
 *
 * Every failed API call is normalized into this shape before it reaches a
 * caller, so components, logging and tests never have to cope with the
 * different envelopes the backend and its gateways produce
 * (`{ message }`, `{ error }`, plain text, HTML error pages).
 */
export interface ApiErrorResponse {
  /** Stable, machine-readable code, e.g. `VALIDATION_FAILED`. */
  code: string
  /** User-readable copy. Already curated, so it is safe to render. */
  message: string
  /** HTTP status, or `null` when the request never reached the server. */
  statusCode: number | null
  /** ISO-8601 timestamp of when the failure was normalized. */
  timestamp: string
}

/**
 * Shape of an error body before normalization. Mirrors the wire DTO but is
 * intentionally loose: proxies and gateways send partial envelopes.
 */
export interface ApiErrorPayload {
  code?: string
  message?: string
  error?: string
  errors?:
    | Record<string, string>
    | Array<{
        field?: string
        path?: string | string[]
        message?: string
      } | null>
  requestId?: string
}

/** Type guard for the canonical error shape. */
export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Partial<ApiErrorResponse>
  return (
    typeof candidate.code === 'string' &&
    typeof candidate.message === 'string' &&
    (typeof candidate.statusCode === 'number' || candidate.statusCode === null) &&
    typeof candidate.timestamp === 'string' &&
    !Number.isNaN(Date.parse(candidate.timestamp))
  )
}
