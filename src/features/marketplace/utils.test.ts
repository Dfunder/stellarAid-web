import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { firstZodMessage, listingToFormValues } from './utils'

const Schema = z.object({
  title: z.string().min(3, 'Title is too short'),
  price: z.string().regex(/^\d+(\.\d{1,7})?$/, 'Price must be a positive number'),
})

describe('firstZodMessage (#777)', () => {
  it('surfaces the first issue message from a failing zod parse', () => {
    const parsed = Schema.safeParse({ title: 'ab', price: 'free' })

    expect(parsed.success).toBe(false)
    if (parsed.success) return
    // zod v4: the messages live on `err.issues` (the `errors` alias was removed).
    expect(parsed.error.issues).toHaveLength(2)
    expect(firstZodMessage(parsed.error)).toBe('Title is too short')
  })

  it('falls back when zod reports an empty-string message', () => {
    const error = new z.ZodError([{ code: 'custom', message: '', path: ['title'] }])

    expect(firstZodMessage(error, 'Enter a value')).toBe('Enter a value')
  })

  it('falls back for non-zod errors', () => {
    expect(firstZodMessage(new Error('boom'), 'Invalid value')).toBe('Invalid value')
  })
})

describe('listingToFormValues (#776)', () => {
  it('maps every server listing field onto the form shape', () => {
    const values = listingToFormValues({
      title: 'Neon Alley',
      description: 'A cyberpunk alley scene rendered in Blender.',
      category: 'Digital Art',
      tags: ['cyberpunk', 'neon'],
      price: '25.5',
      asset: 'USDC',
      licenseTerms: 'personal',
      images: ['https://cdn.test/one.png'],
    })

    expect(values).toEqual({
      title: 'Neon Alley',
      description: 'A cyberpunk alley scene rendered in Blender.',
      category: 'Digital Art',
      tags: ['cyberpunk', 'neon'],
      price: '25.5',
      asset: 'USDC',
      licenseTerms: 'personal',
      images: ['https://cdn.test/one.png'],
    })
  })
})
