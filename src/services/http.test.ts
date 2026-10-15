import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { AxiosError, AxiosHeaders, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getApiErrorMessage,
  getErrorMessage,
  http,
  isApiError,
  retryDelayMs,
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

afterEach(() => {
  // Module-level HTTP state must not leak between tests (#794), otherwise
  // test order can mask the concurrency bugs this file exists to cover.
  setAuthTokenProvider(() => null)
  setTokenRefresher(async () => null)
  setUnauthorizedHandler(() => {})
})

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

describe('401 on the refresh endpoint', () => {
  it('does not re-enter the refresh branch (no request storm)', async () => {
    token = 'expired'
    setAuthTokenProvider(() => token)

    const refreshCalls = vi.fn()
    const adapter: AxiosAdapter = async (config) => {
      if (config.url === '/auth/refresh') refreshCalls()
      throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
        data: {},
        status: 401,
        statusText: 'Unauthorized',
        headers: {},
        config,
      })
    }

    const onUnauthorized = vi.fn()
    setUnauthorizedHandler(onUnauthorized)
    const refresher = vi.fn(async () => {
      try {
        // Mirrors authService.refresh / authApi.refresh: the refresh call
        // itself opts out of the 401 branch.
        await http.post('/auth/refresh', {}, { adapter, skipAuthRefresh: true, skipRetry: true })
      } catch {
        return null
      }
      return null
    })
    setTokenRefresher(refresher)

    await expect(http.get('/me', { adapter })).rejects.toMatchObject({ status: 401 })

    expect(refresher).toHaveBeenCalledTimes(1)
    expect(refreshCalls).toHaveBeenCalledTimes(1)
    expect(onUnauthorized).toHaveBeenCalledTimes(1)
  })
})

describe('authApi.refresh', () => {
  it('sets skipAuthRefresh so a rejected refresh never loops (source guard)', () => {
    const source = readFileSync(resolve(__dirname, '../features/auth/services/authApi.ts'), 'utf8')
    const call = source.indexOf("'/auth/refresh'")
    expect(call).toBeGreaterThan(-1)
    expect(source.slice(call, call + 240)).toContain('skipAuthRefresh: true')
  })
})

describe('retryDelayMs', () => {
  function responseError(status: number, headers: Record<string, string>): AxiosError {
    const config = {
      method: 'get',
      url: '/resource',
      headers: {},
    } as unknown as InternalAxiosRequestConfig
    const response = { data: {}, status, statusText: '', headers, config }
    return new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, response)
  }

  it('honours the Retry-After header on a 429 (seconds → ms)', () => {
    expect(retryDelayMs(responseError(429, { 'retry-after': '2' }), 1)).toBe(2000)
  })

  it('caps an absurd Retry-After value', () => {
    expect(retryDelayMs(responseError(429, { 'retry-after': '3600' }), 1)).toBe(30_000)
  })

  it('falls back to the base delay when the header is missing or malformed', () => {
    expect(retryDelayMs(responseError(429, {}), 1)).toBe(500)
    expect(retryDelayMs(responseError(429, { 'retry-after': 'soon' }), 2)).toBe(1000)
  })
})
