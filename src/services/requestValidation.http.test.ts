import type { AxiosAdapter } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// The UI store is unrelated to request validation and is currently broken on
// `main`; mock it so this test exercises the real HTTP interceptor chain.
vi.mock('@/stores/useUiStore', () => ({
  useUiStore: { getState: () => ({ pushToast: vi.fn() }) },
}))

import { http } from './http'
import { ARTIST_RATE_LIMIT, resetRateLimitsForTests } from './requestValidation'

let adapterCalls = 0

const adapter: AxiosAdapter = async (config) => {
  adapterCalls += 1
  return {
    data: 'ok',
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  }
}

beforeEach(() => {
  adapterCalls = 0
  resetRateLimitsForTests()
})

describe('HTTP request validation (#987)', () => {
  it('sends safe requests through to the adapter', async () => {
    await expect(http.get('/profiles/elena_art', { adapter })).resolves.toBe('ok')
    expect(adapterCalls).toBe(1)
  })

  it('rejects traversal before any request is sent', async () => {
    await expect(http.get('/profiles/..%2F..%2Fetc%2Fpasswd', { adapter })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
    })
    await expect(http.get('/profiles/../../etc/passwd', { adapter })).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
    })

    expect(adapterCalls).toBe(0)
  })

  it('rejects SQL injection payloads before any request is sent', async () => {
    await expect(
      http.get('/artworks/1%27%20OR%20%271%27%3D%271', { adapter }),
    ).rejects.toMatchObject({
      status: 400,
      code: 'VALIDATION_FAILED',
    })
    await expect(http.get('/listings/1%3BDROP%20TABLE%20users', { adapter })).rejects.toMatchObject(
      {
        status: 400,
        code: 'VALIDATION_FAILED',
      },
    )

    expect(adapterCalls).toBe(0)
  })

  it('returns 429 after the artist request budget is exhausted', async () => {
    for (let request = 0; request < ARTIST_RATE_LIMIT.limit; request += 1) {
      await http.get('/profiles/elena_art', { adapter })
    }

    await expect(http.get('/profiles/elena_art', { adapter })).rejects.toMatchObject({
      status: 429,
      code: 'RATE_LIMITED',
    })
    expect(adapterCalls).toBe(ARTIST_RATE_LIMIT.limit)
  })
})
