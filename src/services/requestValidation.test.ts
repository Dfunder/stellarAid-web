import { beforeEach, describe, expect, it } from 'vitest'
import {
  ARTIST_RATE_LIMIT,
  assertValidArtistId,
  checkRequestRateLimit,
  resetRateLimitsForTests,
  validateArtistId,
  validateMarketplaceId,
  validatePortfolioId,
  validateRequestPath,
} from './requestValidation'

beforeEach(() => {
  resetRateLimitsForTests()
})

describe('validateRequestPath', () => {
  it('accepts normal artist, marketplace and portfolio paths', () => {
    expect(validateRequestPath('/profiles/elena_art')).toBeNull()
    expect(validateRequestPath('/listings/123e4567-e89b-12d3-a456-426614174000')).toBeNull()
    expect(validateRequestPath('/artworks/abc-123')).toBeNull()
    expect(validateRequestPath('/orders/42?page=1')).toBeNull()
    expect(validateRequestPath('/transactions/deadbeef/status')).toBeNull()
    expect(validateRequestPath('/auth/reset-password/token.with.dots')).toBeNull()
  })

  it('accepts the same paths when they are absolute URLs', () => {
    expect(validateRequestPath('https://api.example.com/profiles/elena_art')).toBeNull()
  })

  it('rejects path traversal attempts', () => {
    expect(validateRequestPath('/profiles/../../etc/passwd')).not.toBeNull()
    expect(validateRequestPath('/profiles/..%2F..%2Fetc%2Fpasswd')).not.toBeNull()
    expect(validateRequestPath('/profiles/%2e%2e%2f%2e%2e%2fetc')).not.toBeNull()
    expect(validateRequestPath('/wallets/GABC/..%5C..%5Cwindows')).not.toBeNull()
    expect(validateRequestPath('/profiles/%00')).not.toBeNull()
  })

  it('rejects SQL/NoSQL injection payloads', () => {
    expect(validateRequestPath('/artworks/1%27%20OR%20%271%27%3D%271')).not.toBeNull()
    expect(validateRequestPath('/listings/1%3BDROP%20TABLE%20users')).not.toBeNull()
    expect(validateRequestPath('/orders/1--')).not.toBeNull()
    expect(validateRequestPath('/orders/1/*comment*/')).not.toBeNull()
    expect(validateRequestPath('/orders/%7B%22%24ne%22%3A%20null%7D')).not.toBeNull()
  })

  it('rejects protocol-relative and malformed URLs', () => {
    expect(validateRequestPath('//evil.example.com/steal')).not.toBeNull()
    expect(validateRequestPath('/profiles/%E0%A4%A')).not.toBeNull()
  })
})

describe('artist and resource identifiers', () => {
  it('accepts positive integers and UUIDs as artist ids', () => {
    expect(validateArtistId('1')).toBe(true)
    expect(validateArtistId('42')).toBe(true)
    expect(validateArtistId('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(assertValidArtistId(' 42 ')).toBe('42')
  })

  it('rejects invalid artist ids', () => {
    expect(validateArtistId('0')).toBe(false)
    expect(validateArtistId('-1')).toBe(false)
    expect(validateArtistId('')).toBe(false)
    expect(validateArtistId('abc')).toBe(false)
    expect(validateArtistId('1 OR 1=1')).toBe(false)
    expect(validateArtistId('../../etc/passwd')).toBe(false)
    expect(validateArtistId('1;DROP TABLE users')).toBe(false)
    expect(() => assertValidArtistId('../1')).toThrow(/positive integer or uuid/i)
  })

  it('accepts safe marketplace/portfolio ids and rejects unsafe ones', () => {
    expect(validateMarketplaceId('listing-123')).toBe(true)
    expect(validateMarketplaceId('123e4567-e89b-12d3-a456-426614174000')).toBe(true)
    expect(validatePortfolioId('artwork_42')).toBe(true)

    expect(validateMarketplaceId('../listing')).toBe(false)
    expect(validateMarketplaceId('listing 123')).toBe(false)
    expect(validateMarketplaceId('listing--123')).toBe(false)
    expect(validatePortfolioId("42' OR '1'='1")).toBe(false)
  })
})

describe('checkRequestRateLimit', () => {
  it('allows artist GETs up to the limit and then blocks the bucket', () => {
    for (let request = 0; request < ARTIST_RATE_LIMIT.limit; request += 1) {
      expect(checkRequestRateLimit('/profiles/elena_art', 'get', 0)).toBeNull()
    }

    const blocked = checkRequestRateLimit('/profiles/elena_art', 'GET', 0)
    expect(blocked).toMatch(/too many artist requests/i)
  })

  it('resets the bucket after the window elapses', () => {
    for (let request = 0; request < ARTIST_RATE_LIMIT.limit; request += 1) {
      checkRequestRateLimit('/artists/42', 'get', 0)
    }

    expect(checkRequestRateLimit('/artists/42', 'get', ARTIST_RATE_LIMIT.windowMs)).toBeNull()
  })

  it('does not limit non-artist or non-GET requests', () => {
    for (let request = 0; request < ARTIST_RATE_LIMIT.limit + 5; request += 1) {
      expect(checkRequestRateLimit('/listings/42', 'get', 0)).toBeNull()
      expect(checkRequestRateLimit('/profiles/elena_art', 'post', 0)).toBeNull()
    }

    expect(checkRequestRateLimit(undefined, 'get', 0)).toBeNull()
  })
})
