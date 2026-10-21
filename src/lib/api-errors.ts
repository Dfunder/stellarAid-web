import { isApiError } from '@/services/http'
import type { ApiErrorResponse } from '@/types/api-error'

/** Copy used when a thrown value carries no user-facing message of its own. */
export const UNEXPECTED_ERROR_CODE = 'INTERNAL_ERROR'
export const UNEXPECTED_ERROR_MESSAGE = 'An unexpected error occurred.'

/**
 * Converts anything thrown by an API call into the canonical
 * `{ code, message, statusCode, timestamp }` shape (#998).
 *
 * Non-`ApiError` values are deliberately reduced to generic copy: an arbitrary
 * `Error` message can leak internals, and this payload may be rendered or
 * logged where a support engineer (or a user) can read it.
 */
export function toApiErrorResponse(error: unknown): ApiErrorResponse {
  if (isApiError(error)) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      timestamp: error.timestamp,
    }
  }

  return {
    code: UNEXPECTED_ERROR_CODE,
    message: UNEXPECTED_ERROR_MESSAGE,
    statusCode: null,
    timestamp: new Date().toISOString(),
  }
}

/** Outcome of a handler wrapped in `withErrorHandling`: never a thrown error. */
export type HandledResult<T> = { ok: true; data: T } | { ok: false; error: ApiErrorResponse }

/**
 * Wraps an async boundary so every rejection leaves it in the canonical error
 * shape instead of a mixture of thrown errors, strings and Axios objects
 * (#998). Callers get a discriminated result they can switch on, which keeps
 * error formatting out of individual call sites.
 */
export function withErrorHandling<Args extends unknown[], T>(
  handler: (...args: Args) => T | Promise<T>,
): (...args: Args) => Promise<HandledResult<T>> {
  return async (...args: Args): Promise<HandledResult<T>> => {
    try {
      return { ok: true, data: await handler(...args) }
    } catch (error) {
      return { ok: false, error: toApiErrorResponse(error) }
    }
  }
}
