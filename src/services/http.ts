import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import { env } from '@/config'

/** Supplies the bearer token attached to every request. */
export type AuthTokenProvider = () => string | null | Promise<string | null>

/** Runs when an API call returns 401 (e.g. trigger the auth-refresh/logout flow). */
export type UnauthorizedHandler = () => void

let authTokenProvider: AuthTokenProvider = () => null
let unauthorizedHandler: UnauthorizedHandler = () => {}

/**
 * Registers the function used to obtain the auth token. Called before every
 * request; the returned value is sent as a `Bearer` token when present.
 */
export function setAuthTokenProvider(provider: AuthTokenProvider): void {
  authTokenProvider = provider
}

/**
 * Registers the handler invoked when a 401 response is received, so the app can
 * hook in the auth-refresh or logout flow.
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler
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
  }
}

/** A normalized, user-readable representation of a failed API call. */
export class ApiError extends Error {
  readonly status: number | null
  readonly code: string

  constructor(status: number | null, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
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
  if (error instanceof ApiError || error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred.'
}

function defaultStatusMessage(status: number): string {
  switch (status) {
    case 400:
      return 'The request was invalid.'
    case 401:
      return 'You need to sign in to continue.'
    case 403:
      return 'You do not have permission to do that.'
    case 404:
      return 'That resource could not be found.'
    case 409:
      return 'The request conflicts with the current state of the server.'
    case 422:
      return 'The server could not process the provided data.'
    case 500:
      return 'Something went wrong on our end. Please try again later.'
    default:
      return 'The request could not be completed.'
  }
}

function normalizeError(error: AxiosError): ApiError {
  const response = error.response

  if (response) {
    const data = response.data as { message?: string; error?: string } | undefined
    const message = (data?.message ?? data?.error) || defaultStatusMessage(response.status)
    return new ApiError(response.status, response.statusText || 'REQUEST_FAILED', message)
  }

  if (error.code === 'ECONNABORTED') {
    return new ApiError(
      null,
      'TIMEOUT',
      'The request timed out. Please check your connection and try again.',
    )
  }

  return new ApiError(
    null,
    'NETWORK_ERROR',
    'Unable to reach the server. Please check your connection and try again.',
  )
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
      if (error.response?.status === 401) {
        unauthorizedHandler()
      }

      const config = error.config
      if (config && shouldRetry(error) && (config.retryCount ?? 0) < MAX_RETRIES) {
        config.retryCount = (config.retryCount ?? 0) + 1
        await delay(RETRY_BASE_DELAY_MS * (config.retryCount ?? 1))
        return client(config)
      }

      return Promise.reject(normalizeError(error))
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
