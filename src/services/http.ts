import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { env } from '@/config'
import type { ApiErrorDto } from '@/types/api'
import { useUiStore } from '@/stores/useUiStore'

/** Supplies the bearer token attached to every request. */
export type AuthTokenProvider = () => string | null | Promise<string | null>

/** Runs when an API call returns 401 and the session could not be refreshed. */
export type UnauthorizedHandler = () => void

/** Obtains a new access token (or `null` when refreshing is impossible/failed). */
export type TokenRefresher = () => Promise<string | null>

let authTokenProvider: AuthTokenProvider = () => null
let unauthorizedHandler: UnauthorizedHandler = () => {}
let tokenRefresher: TokenRefresher = async () => null

/**
 * Registers the function used to obtain the auth token. Called before every
 * request; the returned value is sent as a `Bearer` token when present.
 */
export function setAuthTokenProvider(provider: AuthTokenProvider): void {
  authTokenProvider = provider
}

/**
 * Registers the handler invoked when a 401 response cannot be recovered by a
 * token refresh, so the app can clear the session.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler
}

/**
 * Registers the function used to refresh the access token after a 401. The
 * original request is retried once with the new token.
 */
export function setTokenRefresher(refresher: TokenRefresher): void {
  tokenRefresher = refresher
}

let refreshInFlight: Promise<string | null> | null = null

/** Single-flight refresh: concurrent 401s share one refresh call. */
function refreshAccessToken(): Promise<string | null> {
  refreshInFlight ??= tokenRefresher()
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

/** Error responses whose status codes are safe to retry. */
const RETRYABLE_STATUS_CODES = new Set([429, 502, 503, 504])
const RETRYABLE_METHODS = new Set(['get', 'head', 'options'])
const MAX_RETRIES = 2
const RETRY_BASE_DELAY_MS = 500
const REQUEST_TIMEOUT_MS = 15_000

declare module 'axios' {
  export interface AxiosRequestConfig {
    retryCount?: number
    skipRetry?: boolean
    /** Do not attempt a token refresh when this request returns 401. */
    skipAuthRefresh?: boolean
    /** Set internally once the request has been retried after a refresh. */
    authRetried?: boolean
  }
}

/** A normalized, user-readable representation of a failed API call. */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: string
  /** Per-field validation messages sent by the server, keyed by field name. */
  readonly fieldErrors: Record<string, string>
  readonly requestId: string | null

  constructor(
    status: number | null,
    code: string,
    message: string,
    fieldErrors: Record<string, string> = {},
    requestId: string | null = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
    this.requestId = requestId
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

/** Maps any thrown value to a user-readable error message. */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  return 'An unexpected error occurred.'
}

type FieldErrorsDto =
  | Record<string, string>
  | Array<{ field?: string; path?: string | string[]; message?: string } | null>

/** Accepts `{ field: message }` or `[{ field | path, message }]` validation payloads. */
function parseFieldErrors(errors: FieldErrorsDto | undefined): Record<string, string> {
  if (!errors || typeof errors !== 'object') return {}
  if (!Array.isArray(errors)) {
    return Object.fromEntries(Object.entries(errors).filter(([, v]) => typeof v === 'string'))
  }
  const result: Record<string, string> = {}
  for (const item of errors) {
    // A null element must not replace the ApiError with a TypeError.
    if (!item) continue
    const field = item.field ?? (Array.isArray(item.path) ? item.path.join('.') : item.path)
    if (field && item.message && !(field in result)) result[field] = item.message
  }
  return result
}

const API_ERROR_MESSAGES: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'The email or password is incorrect.',
  AUTH_EMAIL_NOT_VERIFIED: 'Verify your email address before signing in.',
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_FORBIDDEN: 'You do not have permission to do that.',
  RESOURCE_NOT_FOUND: 'That resource could not be found.',
  RESOURCE_CONFLICT: 'That change conflicts with the current state.',
  VALIDATION_FAILED: 'Check the highlighted fields and try again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again later.',
  NETWORK_ERROR: 'Unable to reach the server. Please check your connection and try again.',
  TIMEOUT: 'The request timed out. Please try again.',
  HTTP_ERROR: 'The request could not be completed.',
}

/**
 * Maps an error code (with an HTTP status fallback) to user-facing copy.
 * `serverMessage` is the DTO's own message, used when no curated copy exists.
 */
export function getApiErrorMessage(
  code: string,
  status: number | null,
  serverMessage?: string,
): string {
  const mapped = API_ERROR_MESSAGES[code]
  const own = typeof serverMessage === 'string' ? serverMessage.trim() : ''
  // HTTP_ERROR means the response carried no code, so nothing is curated for
  // it: the server's own message wins when present.
  if (own && (!mapped || code === 'HTTP_ERROR')) return own
  if (mapped) return mapped
  if (status === 401) return API_ERROR_MESSAGES.AUTH_TOKEN_EXPIRED
  if (status === 403) return API_ERROR_MESSAGES.AUTH_FORBIDDEN
  if (status === 404) return API_ERROR_MESSAGES.RESOURCE_NOT_FOUND
  if (status === 409) return API_ERROR_MESSAGES.RESOURCE_CONFLICT
  if (status === 422) return API_ERROR_MESSAGES.VALIDATION_FAILED
  if (status !== null && status >= 500) return API_ERROR_MESSAGES.INTERNAL_ERROR
  return API_ERROR_MESSAGES.HTTP_ERROR
}

function normalizeError(error: AxiosError): ApiError {
  const response = error.response

  if (response) {
    // Non-JSON bodies (gateways, proxies) are not an ApiErrorDto — degrade to
    // undefined instead of trusting an unchecked cast.
    const body: unknown = response.data
    const data: ApiErrorDto | undefined =
      typeof body === 'object' && body !== null ? (body as ApiErrorDto) : undefined
    const code = data?.code ?? (response.status === 422 ? 'VALIDATION_FAILED' : 'HTTP_ERROR')
    return new ApiError(
      response.status,
      code,
      getApiErrorMessage(code, response.status, data?.message),
      parseFieldErrors(data?.errors),
      data?.requestId ?? null,
    )
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiError(null, 'TIMEOUT', getApiErrorMessage('TIMEOUT', null))
  }

  return new ApiError(null, 'NETWORK_ERROR', getApiErrorMessage('NETWORK_ERROR', null))
}

function reportUnexpectedError(error: ApiError, request: AxiosRequestConfig | undefined): void {
  if (!(error.code in API_ERROR_MESSAGES)) {
    console.error('Unexpected API error', {
      code: error.code,
      status: error.status,
      requestId: error.requestId,
      method: request?.method,
      url: request?.url,
    })
  }
}

/** Upper bound so a hostile or broken `Retry-After` cannot park a request for hours. */
const MAX_RETRY_AFTER_MS = 30_000

/**
 * Delay before the next retry: a `Retry-After` header (expressed in seconds)
 * wins when the response carries one; otherwise the base delay applies.
 */
export function retryDelayMs(error: AxiosError, attempt: number): number {
  const header = error.response?.headers?.['retry-after']
  if (typeof header === 'string' || typeof header === 'number') {
    const seconds = Number(header)
    if (Number.isFinite(seconds) && seconds >= 0) {
      return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS)
    }
  }
  return RETRY_BASE_DELAY_MS * attempt
}

function shouldRetry(error: AxiosError): boolean {
  const config = error.config
  if (!config || config.skipRetry) return false
  if (!RETRYABLE_METHODS.has((config.method ?? 'get').toLowerCase())) return false
  if (error.response) return RETRYABLE_STATUS_CODES.has(error.response.status)
  return error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK'
}

function buildClient(): AxiosInstance {
  const client = axios.create({
    baseURL: env.VITE_API_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  })

  client.interceptors.request.use(async (config) => {
    const token = await authTokenProvider()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const config = error.config

      // Refresh only for authenticated requests; login-style 401s pass through.
      if (
        error.response?.status === 401 &&
        config &&
        config.headers.Authorization &&
        !config.skipAuthRefresh &&
        !config.authRetried
      ) {
        const sentAuthorization = config.headers.Authorization
        const currentToken = await authTokenProvider()
        // Another request may already have refreshed the token; otherwise refresh now.
        const token =
          currentToken && `Bearer ${currentToken}` !== sentAuthorization
            ? currentToken
            : await refreshAccessToken()

        if (token) {
          config.authRetried = true
          return client(config)
        }
        unauthorizedHandler()
      } else if (error.response?.status === 401 && config?.authRetried) {
        // The refreshed token was rejected too: the session is no longer valid.
        unauthorizedHandler()
      }

      if (config && shouldRetry(error) && (config.retryCount ?? 0) < MAX_RETRIES) {
        config.retryCount = (config.retryCount ?? 0) + 1
        await delay(retryDelayMs(error, config.retryCount))
        return client(config)
      }

      const normalized = normalizeError(error)
      reportUnexpectedError(normalized, config)
      if (normalized.status !== 422) useUiStore.getState().pushToast(normalized.message, 'error')
      return Promise.reject(normalized)
    },
  )

  return client
}

const client = buildClient()

/** Typed HTTP helpers backed by the shared client. */
export interface Http {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T>
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
}

export const http: Http = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    (await client.get<T>(url, config)).data,
  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    (await client.post<T>(url, data, config)).data,
  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    (await client.put<T>(url, data, config)).data,
  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    (await client.patch<T>(url, data, config)).data,
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    (await client.delete<T>(url, config)).data,
}
