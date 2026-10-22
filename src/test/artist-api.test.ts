import { beforeEach, describe, expect, it } from 'vitest'
import {
  artistIdSchema,
  hasPathTraversal,
  hasSqlInjection,
  marketplaceIdSchema,
  portfolioIdSchema,
  validateArtistId,
  validateMarketplaceId,
  validatePortfolioId,
} from '@/validators/artist-id.validator'
import {
  ARTIST_ROUTE_LIMIT,
  GET as artistGet,
  default as artistHandler,
  resetArtistApiRateLimits,
} from '@/api/artist/[id]'
import { GET as marketplaceGet, default as marketplaceHandler } from '@/api/marketplace/[id]'
import { GET as portfolioGet, default as portfolioHandler } from '@/api/portfolio/[id]'

describe('artist-id validator (#940)', () => {
  it('accepts valid positive integers', () => {
    expect(validateArtistId('1').success).toBe(true)
    expect(validateArtistId('42').success).toBe(true)
    expect(validateArtistId('99999').success).toBe(true)
    expect(artistIdSchema.parse('42')).toBe('42')
  })

  it('accepts valid UUIDs', () => {
    const validUuid = '123e4567-e89b-12d3-a456-426614174000'
    expect(validateArtistId(validUuid).success).toBe(true)
    expect(artistIdSchema.parse(validUuid)).toBe(validUuid)
  })

  it('rejects zero, negative integers, and decimals', () => {
    expect(validateArtistId('0').success).toBe(false)
    expect(validateArtistId('-1').success).toBe(false)
    expect(validateArtistId('-42').success).toBe(false)
    expect(validateArtistId('3.14').success).toBe(false)
    expect(validateArtistId('').success).toBe(false)
  })

  it('blocks path traversal attempts', () => {
    expect(hasPathTraversal('../../etc/passwd')).toBe(true)
    expect(hasPathTraversal('..%2f..%2fetc%2fpasswd')).toBe(true)
    expect(hasPathTraversal('..\\..\\windows')).toBe(true)
    expect(hasPathTraversal('artist/42')).toBe(true)
    expect(hasPathTraversal('42\0')).toBe(true)

    const result = validateArtistId('../../etc/passwd')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toMatch(/path traversal/i)
    }
  })

  it('blocks SQL injection attempts', () => {
    expect(hasSqlInjection("1' OR '1'='1")).toBe(true)
    expect(hasSqlInjection('1; DROP TABLE users')).toBe(true)
    expect(hasSqlInjection('1--')).toBe(true)
    expect(hasSqlInjection('1/*comment*/')).toBe(true)
    expect(hasSqlInjection("1' UNION SELECT * FROM users--")).toBe(true)

    const result = validateArtistId("1' OR '1'='1")
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toMatch(/sql injection/i)
    }
  })

  it('validates marketplace and portfolio IDs', () => {
    expect(validateMarketplaceId('42').success).toBe(true)
    expect(validateMarketplaceId('listing-123').success).toBe(true)
    expect(marketplaceIdSchema.parse('listing-123')).toBe('listing-123')
    expect(validateMarketplaceId('../etc/passwd').success).toBe(false)
    expect(validateMarketplaceId("1' OR '1'='1").success).toBe(false)

    expect(validatePortfolioId('artwork-99').success).toBe(true)
    expect(portfolioIdSchema.parse('artwork-99')).toBe('artwork-99')
    expect(validatePortfolioId('../../passwd').success).toBe(false)
    expect(validatePortfolioId('1; DROP TABLE').success).toBe(false)
  })
})

describe('api/artist/[id].tsx route handler (#940)', () => {
  beforeEach(() => {
    resetArtistApiRateLimits()
  })

  it('returns 200 with artist data for valid positive integer ID', async () => {
    const response = await artistGet({} as Request, { params: { id: '42' } })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({ id: '42', verified: true })
  })

  it('returns 200 with artist data for valid UUID', async () => {
    const uuid = '123e4567-e89b-12d3-a456-426614174000'
    const response = await artistGet({} as Request, { params: { id: uuid } })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data).toMatchObject({ id: uuid, verified: true })
  })

  it('returns 400 Bad Request with clear error message for invalid ID format', async () => {
    const response = await artistGet({} as Request, { params: { id: 'invalid-string' } })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toMatch(/positive integer or uuid/i)
  })

  it('returns 400 Bad Request and blocks path traversal attempts', async () => {
    const response = await artistGet({} as Request, {
      params: { id: '..%2f..%2fetc%2fpasswd' },
    })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toMatch(/path traversal/i)
  })

  it('returns 400 Bad Request and blocks SQL injection attempts', async () => {
    const response = await artistGet({} as Request, {
      params: { id: "1' OR '1'='1" },
    })
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBe('Bad Request')
    expect(data.message).toMatch(/sql injection/i)
  })

  it('enforces rate limiting on artist API endpoint', async () => {
    // Exhaust requests up to limit
    for (let i = 0; i < ARTIST_ROUTE_LIMIT.maxRequests; i++) {
      const res = await artistGet({} as Request, { params: { id: '42' } })
      expect(res.status).toBe(200)
    }

    // Subsequent request must be rate limited (429)
    const blocked = await artistGet({} as Request, { params: { id: '42' } })
    expect(blocked.status).toBe(429)
    const data = await blocked.json()
    expect(data.error).toBe('Too Many Requests')
  })

  it('supports Pages Router / Express style handler interface', async () => {
    let statusCode = 0
    let jsonBody: unknown = null

    const mockRes = {
      status(code: number) {
        statusCode = code
        return this
      },
      json(body: unknown) {
        jsonBody = body
      },
    }

    await artistHandler({ query: { id: '42' } }, mockRes)
    expect(statusCode).toBe(200)
    expect(jsonBody).toMatchObject({ id: '42' })

    await artistHandler({ query: { id: "1' OR '1'='1" } }, mockRes)
    expect(statusCode).toBe(400)
    expect(jsonBody).toMatchObject({ error: 'Bad Request' })
  })
})

describe('api/marketplace/[id].tsx and api/portfolio/[id].tsx route handlers (#940)', () => {
  it('marketplace route validates valid ID and blocks injections', async () => {
    const validRes = await marketplaceGet({} as Request, { params: { id: 'listing-42' } })
    expect(validRes.status).toBe(200)

    const sqlRes = await marketplaceGet({} as Request, {
      params: { id: '1; DROP TABLE listings' },
    })
    expect(sqlRes.status).toBe(400)
    const sqlData = await sqlRes.json()
    expect(sqlData.message).toMatch(/sql injection/i)

    const traversalRes = await marketplaceGet({} as Request, {
      params: { id: '../../passwd' },
    })
    expect(traversalRes.status).toBe(400)
  })

  it('portfolio route validates valid ID and blocks injections', async () => {
    const validRes = await portfolioGet({} as Request, { params: { id: 'artwork-10' } })
    expect(validRes.status).toBe(200)

    const sqlRes = await portfolioGet({} as Request, {
      params: { id: "10' OR '1'='1" },
    })
    expect(sqlRes.status).toBe(400)

    const traversalRes = await portfolioGet({} as Request, {
      params: { id: '..\\..\\windows' },
    })
    expect(traversalRes.status).toBe(400)
  })

  it('supports Pages Router / Express style handlers for marketplace and portfolio', async () => {
    let statusCode = 0
    let jsonBody: unknown = null

    const mockRes = {
      status(code: number) {
        statusCode = code
        return this
      },
      json(body: unknown) {
        jsonBody = body
      },
    }

    await marketplaceHandler({ query: { id: 'listing-100' } }, mockRes)
    expect(statusCode).toBe(200)
    expect(jsonBody).toMatchObject({ id: 'listing-100' })

    await marketplaceHandler({ query: { id: "1' OR '1'='1" } }, mockRes)
    expect(statusCode).toBe(400)
    expect(jsonBody).toMatchObject({ error: 'Bad Request' })

    await portfolioHandler({ query: { id: 'artwork-500' } }, mockRes)
    expect(statusCode).toBe(200)
    expect(jsonBody).toMatchObject({ id: 'artwork-500' })

    await portfolioHandler({ query: { id: '../secret' } }, mockRes)
    expect(statusCode).toBe(400)
    expect(jsonBody).toMatchObject({ error: 'Bad Request' })
  })
})
