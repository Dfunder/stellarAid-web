import { afterEach, describe, expect, it, vi } from 'vitest'
import { logErrorToServer, setErrorTrackingEndpoint } from '../error-tracking'

describe('logErrorToServer (#936)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    setErrorTrackingEndpoint('/api/monitoring/errors')
  })

  it('POSTs message, stack, componentStack, and timestamp', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    setErrorTrackingEndpoint('/test/errors')

    const err = new Error('boom')
    await logErrorToServer(err, {
      componentStack: 'at Foo',
      source: 'error_boundary',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/test/errors')
    expect(init.method).toBe('POST')
    const body = JSON.parse(String(init.body))
    expect(body.message).toBe('boom')
    expect(body.componentStack).toBe('at Foo')
    expect(body.timestamp).toBeTruthy()
    expect(body.source).toBe('error_boundary')
  })
})
