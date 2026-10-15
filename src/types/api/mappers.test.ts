import { describe, expect, it } from 'vitest'
import type { UserRole as AuthRole } from '@/features/auth/types'
import type { UserDto } from './dto'
import { mapArtwork, mapUser } from './mappers'
import type { UserRole as ModelRole } from './models'

/** Compile-time guard: both import paths expose the same canonical role union. */
type IsSameUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false

const FULL_DTO: UserDto = {
  id: 'user_1',
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  username: 'ada',
  role: 'artist',
  emailVerified: true,
  avatarUrl: 'https://cdn.example.com/ada.png',
}

describe('mapUser', () => {
  it('maps every field of a complete DTO', () => {
    expect(mapUser(FULL_DTO)).toStrictEqual({
      id: 'user_1',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      username: 'ada',
      role: 'artist',
      emailVerified: true,
      avatarUrl: 'https://cdn.example.com/ada.png',
    })
  })

  it('populates username so callers never fall back to the raw user id', () => {
    expect(mapUser(FULL_DTO).username).toBe('ada')
  })

  it('applies the documented defaults for a sparse DTO', () => {
    const sparse: UserDto = {
      id: 'user_2',
      name: 'Sparse Sam',
      email: 'sam@example.com',
      role: 'client',
      emailVerified: false,
    }

    expect(mapUser(sparse)).toStrictEqual({
      id: 'user_2',
      name: 'Sparse Sam',
      email: 'sam@example.com',
      username: undefined,
      role: 'client',
      emailVerified: false,
      avatarUrl: null,
    })
  })

  it('keeps an admin role instead of silently downgrading it', () => {
    expect(mapUser({ ...FULL_DTO, role: 'admin' }).role).toBe('admin')
  })

  it('falls back to client for an unexpected role instead of casting it', () => {
    expect(mapUser({ ...FULL_DTO, role: 'superuser' }).role).toBe('client')
  })

  it('exposes one canonical UserRole from both entry points', () => {
    const sameRole: IsSameUnion<ModelRole, AuthRole> = true
    expect(sameRole).toBe(true)
  })
})

describe('mapArtwork status', () => {
  const dto = {
    id: 'a1',
    artistId: 'u1',
    title: 't',
    category: 'c',
    price: { amount: '1', asset: { code: 'XLM' } },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  }

  it('maps the legacy published status to active', () => {
    expect(mapArtwork({ ...dto, status: 'published' }).status).toBe('active')
  })

  it('keeps known statuses and falls back to draft for unknown ones', () => {
    expect(mapArtwork({ ...dto, status: 'sold' }).status).toBe('sold')
    expect(mapArtwork({ ...dto, status: 'nonsense' }).status).toBe('draft')
  })
})
