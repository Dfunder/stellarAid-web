import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { registerSchema } from './schemas'

const valid = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  password: 'Str0ngPass',
  confirmPassword: 'Str0ngPass',
  accountType: 'artist',
}

function fieldErrors(input: Record<string, unknown>) {
  const result = registerSchema.safeParse(input)
  return result.success ? {} : z.flattenError(result.error).fieldErrors
}

describe('registerSchema', () => {
  it('accepts valid input and trims name/email', () => {
    const result = registerSchema.parse({ ...valid, name: '  Ada  ', email: ' ada@example.com ' })
    expect(result.name).toBe('Ada')
    expect(result.email).toBe('ada@example.com')
  })

  it('requires a name of at least 2 characters', () => {
    expect(fieldErrors({ ...valid, name: ' a ' }).name).toBeDefined()
  })

  it('rejects an invalid email', () => {
    expect(fieldErrors({ ...valid, email: 'not-an-email' }).email).toBeDefined()
  })

  it.each([
    ['too short', 'Ab1'],
    ['no uppercase', 'weakpass1'],
    ['no lowercase', 'WEAKPASS1'],
    ['no number', 'WeakPassword'],
  ])('rejects a weak password (%s)', (_, password) => {
    expect(fieldErrors({ ...valid, password, confirmPassword: password }).password).toBeDefined()
  })

  it('rejects mismatched passwords on confirmPassword', () => {
    const errors = fieldErrors({ ...valid, confirmPassword: 'Different1' })
    expect(errors.confirmPassword).toEqual(['Passwords do not match.'])
  })

  it('requires an account type of artist or client', () => {
    expect(fieldErrors({ ...valid, accountType: undefined }).accountType).toBeDefined()
    expect(fieldErrors({ ...valid, accountType: 'admin' }).accountType).toBeDefined()
    expect(registerSchema.safeParse({ ...valid, accountType: 'client' }).success).toBe(true)
  })
})
