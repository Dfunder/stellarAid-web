import { AxiosError, AxiosHeaders, type AxiosAdapter } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { http, setAuthTokenProvider, setTokenRefresher, setUnauthorizedHandler } from './http'

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
