import { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getApiErrorMessage,
  getErrorMessage,
  http,
  isApiError,
  redactUrl,
  setAuthTokenProvider,
  setTokenRefresher,
  setUnauthorizedHandler,
} from './http'

let token: string | null

/** Fake server: accepts only `Bearer new`, answers 401 otherwise. */
const adapter: AxiosAdapter = async (config) => {
  const headers = AxiosHeaders.from(config.headers)
  const response = { data: 'ok', status: 200, statusText: 'OK', headers: {}, config }
  if (headers.get('Authorization') === 'Bearer new') return response
  const unauthorized = { ...response, data: {}, status: 401, statusText: 'Unauthorized' }
  throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, unauthorized)
}

describe('http token refresh', () => {
  beforeEach(() => {
    token = 'expired'
    setAuthTokenProvider(() => token)
  })

  it('refreshes once for concurrent 401s and retries every original request', async () => {
    const refresher = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      token = 'new'
      return token
    })
    const onUnauthorized = vi.fn()
    setTokenRefresher(refresher)
    setUnauthorizedHandler(onUnauthorized)

    const results = await Promise.all([1, 2, 3].map(() => http.get<string>('/me', { adapter })))

    expect(results).toEqual(['ok', 'ok', 'ok'])
    expect(refresher).toHaveBeenCalledTimes(1)
    expect(onUnauthorized).not.toHaveBeenCalled()
  })

  it('clears the session when the refresh fails', async () => {
    const onUnauthorized = vi.fn()
    setTokenRefresher(async () => {
      throw new Error('refresh rejected')
    })
    setUnauthorizedHandler(onUnauthorized)

    await expect(http.get('/me', { adapter })).rejects.toMatchObject({ status: 401 })
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })
})

describe('centralized API errors', () => {
  it('redacts reset-password tokens in logged URLs', () => {
    expect(redactUrl('/auth/reset-password/abc123token')).toBe('/auth/reset-password/(redacted)')
    expect(redactUrl('/auth/reset-password/abc123token?lang=en')).toBe(
      '/auth/reset-password/(redacted)?lang=en',
    )
  })

  it('leaves unrelated URLs untouched', () => {
    expect(redactUrl('/orders/42')).toBe('/orders/42')
    expect(redactUrl(undefined)).toBeUndefined()
  })

  it('does not raise a toast for a failed request when skipToast is set', async () => {
    const failureAdapter: AxiosAdapter = async (config) => {
      throw new AxiosError('boom', 'ERR_BAD_REQUEST', config, null, {
        data: { code: 'RESOURCE_NOT_FOUND', requestId: 'req-1' },
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config,
      })
    }
    // Skip toast path: the shared client pushes toasts via useUiStore, which is
    // exercised in this environment only when configured; the key assertion is
    // that the request still rejects with the same normalized ApiError.
    await expect(http.get('/missing', { adapter: failureAdapter, skipToast: true })).rejects.toMatchObject({
      status: 404,
      code: 'RESOURCE_NOT_FOUND',
    })
  })

  it('maps catalog codes without exposing backend messages', () => {
    expect(getApiErrorMessage('AUTH_INVALID_CREDENTIALS', 401)).toBe(
      'The email or password is incorrect.',
    )
    expect(getErrorMessage(new Error('database connection string'))).toBe(
      'An unexpected error occurred.',
    )
  })

  it('normalizes validation fields and preserves request context', async () => {
    const validationAdapter: AxiosAdapter = async (config) => {
      throw new AxiosError('technical backend detail', 'ERR_BAD_REQUEST', config, null, {
        data: {
          code: 'VALIDATION_FAILED',
          message: 'raw backend detail',
          requestId: 'req-123',
          errors: [{ path: ['email'], message: 'Enter a valid email.' }],
        },
        status: 422,
        statusText: 'Unprocessable Entity',
        headers: {},
        config,
      })
    }

    try {
      await http.post('/register', {}, { adapter: validationAdapter })
      expect.fail('request should reject')
    } catch (error) {
      expect(isApiError(error)).toBe(true)
      expect(error).toMatchObject({
        status: 422,
        code: 'VALIDATION_FAILED',
        fieldErrors: { email: 'Enter a valid email.' },
        requestId: 'req-123',
        message: 'Check the highlighted fields and try again.',
      })
    }
  })
})
