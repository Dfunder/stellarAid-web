import { AxiosError, type AxiosAdapter } from 'axios'
import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, http, isApiError } from './http'

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

describe('http error normalization', () => {
  it('keeps the ApiError when a validation errors array contains null', async () => {
    const adapter = failingAdapter(
      {
        code: 'VALIDATION_FAILED',
        errors: [{ path: ['email'], message: 'Enter a valid email.' }, null],
      },
      422,
    )

    try {
      await http.post('/register', {}, { adapter })
      expect.fail('request should reject')
    } catch (error) {
      expect(isApiError(error)).toBe(true)
      expect(error).toMatchObject({
        status: 422,
        code: 'VALIDATION_FAILED',
        fieldErrors: { email: 'Enter a valid email.' },
        message: 'Check the highlighted fields and try again.',
      })
    }
  })

  it("uses the server's own message when no curated copy exists", async () => {
    const adapter = failingAdapter(
      { code: 'BILLING_CARD_DECLINED', message: 'Your card was declined.' },
      402,
    )

    try {
      await http.post('/payments', {}, { adapter })
      expect.fail('request should reject')
    } catch (error) {
      expect(isApiError(error)).toBe(true)
      expect(error).toMatchObject({
        status: 402,
        code: 'BILLING_CARD_DECLINED',
        message: 'Your card was declined.',
      })
    }
  })

  it('falls back to the explicit HTTP_ERROR copy when the body has no message', async () => {
    const adapter = failingAdapter({}, 400)

    try {
      await http.post('/things', {}, { adapter })
      expect.fail('request should reject')
    } catch (error) {
      expect(isApiError(error)).toBe(true)
      expect(error).toMatchObject({
        status: 400,
        code: 'HTTP_ERROR',
        message: 'The request could not be completed.',
      })
    }
  })

  it("uses the server's message when the body carries no code", async () => {
    const adapter = failingAdapter({ message: 'Slow down a little.' }, 429)

    try {
      await http.post('/things', {}, { adapter })
      expect.fail('request should reject')
    } catch (error) {
      expect(error).toMatchObject({
        status: 429,
        code: 'HTTP_ERROR',
        message: 'Slow down a little.',
      })
    }
  })

  it('degrades a non-JSON error body to a sane ApiError', async () => {
    const adapter = failingAdapter('<html><body>502 Bad Gateway</body></html>', 502)

    try {
      await http.post('/things', {}, { adapter })
      expect.fail('request should reject')
    } catch (error) {
      expect(isApiError(error)).toBe(true)
      expect(error).toMatchObject({
        status: 502,
        code: 'HTTP_ERROR',
        message: 'The request could not be completed.',
        name: 'ApiError',
      })
    }
  })
})

describe('getApiErrorMessage', () => {
  it('prefers a curated copy over the server message', () => {
    expect(getApiErrorMessage('AUTH_INVALID_CREDENTIALS', 401, 'raw backend detail')).toBe(
      'The email or password is incorrect.',
    )
  })

  it('has an explicit fallback for HTTP_ERROR and validation codes', () => {
    expect(getApiErrorMessage('HTTP_ERROR', 400)).toBe('The request could not be completed.')
    expect(getApiErrorMessage('VALIDATION_FAILED', 422)).toBe(
      'Check the highlighted fields and try again.',
    )
  })
})
