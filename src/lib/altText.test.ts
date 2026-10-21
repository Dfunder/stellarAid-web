import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ALT_TEXT,
  MAX_ALT_TEXT_LENGTH,
  generateAltText,
  humanizeFileName,
  isMeaningfulAltText,
  normalizeAltText,
  resolveAltText,
} from './altText'

describe('humanizeFileName (#999)', () => {
  it('turns separators and camelCase into words', () => {
    expect(humanizeFileName('harbor-at-dusk.jpg')).toBe('harbor at dusk')
    expect(humanizeFileName('BeachSunset_2024.png')).toBe('Beach Sunset')
  })

  it('reads the last path segment of a URL and ignores query strings', () => {
    expect(humanizeFileName('https://cdn.lumora.art/works/yellow-koi.webp?w=800')).toBe(
      'yellow koi',
    )
  })

  it('drops content hashes and long numbers', () => {
    expect(humanizeFileName('IMG_4f9c2ab1e7.png')).toBe('IMG')
    expect(humanizeFileName('1700000000.jpg')).toBe('')
  })
})

describe('isMeaningfulAltText (#999)', () => {
  it('accepts a description a listener can use', () => {
    expect(isMeaningfulAltText('Watercolour painting of a harbour at dusk')).toBe(true)
    expect(isMeaningfulAltText('Yellow koi')).toBe(true)
  })

  it('rejects empty, decorative and file-name-shaped text', () => {
    for (const value of ['', '   ', null, undefined, '12345', 'IMG_1234', 'image 1', 'photo']) {
      expect(isMeaningfulAltText(value)).toBe(false)
    }
  })
})

describe('generateAltText (#999)', () => {
  it('prefers a description derived from the file name', () => {
    expect(generateAltText('harbor-at-dusk.jpg')).toBe('harbor at dusk')
  })

  it('falls back to the caller wording when the file name says nothing', () => {
    expect(
      generateAltText('https://cdn.lumora.art/a1b2c3d4e5f6.jpg', 'Artist portfolio piece'),
    ).toBe('Artist portfolio piece')
  })

  it('never returns empty text, because an empty alt marks the image decorative', () => {
    expect(generateAltText(undefined)).toBe(DEFAULT_ALT_TEXT)
    expect(generateAltText('image-1.png', '   ')).toBe(DEFAULT_ALT_TEXT)
  })

  it('ignores inline and temporary URLs, which carry bytes rather than a name', () => {
    const inline =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8'
    expect(generateAltText(inline)).toBe(DEFAULT_ALT_TEXT)
    expect(generateAltText('blob:https://lumora.art/8f14e45f-ceea-467f-a1f1-0a7a1b2c3d4e')).toBe(
      DEFAULT_ALT_TEXT,
    )
  })
})

describe('resolveAltText (#999)', () => {
  it('lets the uploader’s own description win', () => {
    expect(resolveAltText('Blue ceramic bowl on a linen cloth', 'harbor.jpg')).toBe(
      'Blue ceramic bowl on a linen cloth',
    )
  })

  it('generates a description when the field is blank or meaningless', () => {
    expect(resolveAltText('', 'harbor-at-dusk.jpg')).toBe('harbor at dusk')
    expect(resolveAltText('IMG_0001', 'harbor-at-dusk.jpg')).toBe('harbor at dusk')
  })

  it('caps length and collapses whitespace', () => {
    const long = `  ${'a'.repeat(MAX_ALT_TEXT_LENGTH + 40)}  `
    const resolved = resolveAltText(long)
    expect(resolved).toHaveLength(MAX_ALT_TEXT_LENGTH)
    expect(normalizeAltText('  two   words ')).toBe('two words')
  })
})
