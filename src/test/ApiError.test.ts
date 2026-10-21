import { AxiosError, type AxiosAdapter } from 'axios'
import { describe, expect, it } from 'vitest'
import { UNEXPECTED_ERROR_CODE, toApiErrorResponse, withErrorHandling } from '@/lib/api-errors'
import { ApiError, http, isApiError } from '@/services'
import { isApiErrorResponse } from '@/types/api-error'

/** Adapter that always fails with the given response body and status. */
const failingAdapter =
  (data: unknown, status: number): AxiosAdapter =>
  async (config) => {
    throw new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
      data,
      status,
      statusText: 'Error',
      headers: {},
      config,
    })
  }

/** Adapter that never reaches a server, so there is no HTTP status. */
const transportFailureAdapter =
  (code: 'ERR_NETWORK' | 'ECONNABORTED'): AxiosAdapter =>
  async (config) => {
    throw new AxiosError('Request failed', code, config)
  }

const CANONICAL_KEYS = ['code', 'message', 'statusCode', 'timestamp']

async function captureError(adapter: AxiosAdapter, url: string): Promise<unknown> {
  try {
    await http.post(url, {}, { adapter })
    expect.fail('request should reject')
  } catch (error) {
    return error
  }
}

describe('canonical API error contract (#998)', () => {
  it('normalizes a `{ error }` envelope into code, message, statusCode and timestamp', async () => {
    const error = await captureError(
      failingAdapter({ error: 'Artwork is not for sale.' }, 400),
      '/x',
    )

    expect(isApiError(error)).toBe(true)
    if (!isApiError(error)) return
    expect(error).toMatchObject({
      code: 'HTTP_ERROR',
      message: 'Artwork is not for sale.',
      statusCode: 400,
      status: 400,
    })
    expect(isApiErrorResponse(error.toJSON())).toBe(true)
    expect(Object.keys(error.toJSON()).sort()).toEqual([...CANONICAL_KEYS].sort())
    expect(Number.isNaN(Date.parse(error.timestamp))).toBe(false)
  })

  it('uses a short plain-text body as the message', async () => {
    const error = await captureError(failingAdapter('Service is warming up', 503), '/x')

    expect(isApiError(error)).toBe(true)
    if (!isApiError(error)) return
    expect(error.toJSON()).toMatchObject({
      code: 'HTTP_ERROR',
      message: 'Service is warming up',
      statusCode: 503,
    })
  })

  it('never surfaces an HTML error page as a message', async () => {
    const error = await captureError(
      failingAdapter('<html><body>502 Bad Gateway</body></html>', 502),
      '/x',
    )

    expect(isApiError(error)).toBe(true)
    if (!isApiError(error)) return
    expect(error.message).toBe('The request could not be completed.')
    expect(error.message).not.toContain('<')
    expect(isApiErrorResponse(error.toJSON())).toBe(true)
  })

  it('prefers curated copy for a known code over the server envelope', async () => {
    const error = await captureError(
      failingAdapter({ code: 'RATE_LIMITED', message: 'raw backend detail' }, 429),
      '/x',
    )

    expect(isApiError(error)).toBe(true)
    if (!isApiError(error)) return
    expect(error.message).toBe('Too many requests. Please wait a moment and try again.')
    expect(error.toJSON().statusCode).toBe(429)
  })

  it('reports a transport failure with a null statusCode', async () => {
    const error = await captureError(transportFailureAdapter('ERR_NETWORK'), '/x')

    expect(isApiError(error)).toBe(true)
    if (!isApiError(error)) return
    expect(error.toJSON()).toMatchObject({
      code: 'NETWORK_ERROR',
      statusCode: null,
      message: 'Unable to reach the server. Please check your connection and try again.',
    })
  })

  it('reports a timeout with a null statusCode', async () => {
    const error = await captureError(transportFailureAdapter('ECONNABORTED'), '/x')

    expect(isApiError(error)).toBe(true)
    if (!isApiError(error)) return
    expect(error.toJSON()).toMatchObject({ code: 'TIMEOUT', statusCode: null })
  })
})

describe('toApiErrorResponse', () => {
  it('reduces an arbitrary thrown value to generic copy without leaking internals', () => {
    const response = toApiErrorResponse(new Error('database password is hunter2'))

    expect(response).toMatchObject({
      code: UNEXPECTED_ERROR_CODE,
      message: 'An unexpected error occurred.',
      statusCode: null,
    })
    expect(response.message).not.toContain('hunter2')
    expect(isApiErrorResponse(response)).toBe(true)
  })

  it('is stable across every transport failure shape', async () => {
    const adapters: AxiosAdapter[] = [
      failingAdapter(
        { code: 'VALIDATION_FAILED', errors: [{ path: ['email'], message: 'Bad' }] },
        422,
      ),
      failingAdapter({}, 400),
      failingAdapter('', 500),
      transportFailureAdapter('ERR_NETWORK'),
    ]

    for (const adapter of adapters) {
      const error = await captureError(adapter, '/x')
      expect(isApiErrorResponse(toApiErrorResponse(error))).toBe(true)
      expect(Object.keys(toApiErrorResponse(error)).sort()).toEqual([...CANONICAL_KEYS].sort())
    }
  })
})

describe('withErrorHandling', () => {
  it('returns the handler result on success', async () => {
    const handler = withErrorHandling(async (value: number) => value * 2)

    await expect(handler(21)).resolves.toEqual({ ok: true, data: 42 })
  })

  it('returns the canonical error instead of throwing', async () => {
    const error = new ApiError(404, 'RESOURCE_NOT_FOUND', 'That resource could not be found.')
    const handler = withErrorHandling(async () => {
      throw error
    })

    const result = await handler()
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error).toMatchObject({
      code: 'RESOURCE_NOT_FOUND',
      message: 'That resource could not be found.',
      statusCode: 404,
    })
    expect(isApiErrorResponse(result.error)).toBe(true)
  })

  it('normalizes non-Error rejections too', async () => {
    const handler = withErrorHandling(async () => {
      throw 'boom'
    })

    const result = await handler()
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe(UNEXPECTED_ERROR_CODE)
    expect(isApiErrorResponse(result.error)).toBe(true)
  })
})
