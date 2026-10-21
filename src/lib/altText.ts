/**
 * Alt text helpers (#999).
 *
 * Screen-reader users should hear a description the uploader wrote, not a file
 * name. These helpers keep the flow honest: user copy always wins, a
 * description derived from the file name is only a last resort, and text that
 * carries no meaning ("IMG_1234.png", "image 1") is treated as absent.
 */

/** Longest alt text that is read in full by common screen readers. */
export const MAX_ALT_TEXT_LENGTH = 125

/** Shown when neither the user nor the source yields a usable description. */
export const DEFAULT_ALT_TEXT = 'Uploaded image'

/** Words that describe the container, not the picture. */
const MEANINGLESS_WORDS = new Set([
  'attachment',
  'art',
  'artwork',
  'blob',
  'camera',
  'copy',
  'dcim',
  'default',
  'download',
  'dsc',
  'file',
  'final',
  'image',
  'images',
  'img',
  'new',
  'photo',
  'photos',
  'pic',
  'pics',
  'picture',
  'pictures',
  'screenshot',
  'screenshots',
  'thumbnail',
  'untitled',
  'upload',
  'uploaded',
])

const EXTENSION_PATTERN = /\.(avif|bmp|gif|heic|heif|jpe?g|png|svg|tiff?|webp)$/i

/** Last path segment of a URL or file name, without query or hash. */
function baseName(source: string): string {
  const withoutQuery = source.split(/[?#]/)[0] ?? ''
  const segment = withoutQuery.split('/').pop() ?? ''
  try {
    return decodeURIComponent(segment)
  } catch {
    // A stray `%` must not throw and blank the field.
    return segment
  }
}

/** Collapses whitespace and enforces the length limit. */
export function normalizeAltText(value: string | null | undefined): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim().slice(0, MAX_ALT_TEXT_LENGTH)
}

/**
 * Derives a readable description from a file name or URL:
 * `harbor-at-dusk.jpg` → `harbor at dusk`.
 */
export function humanizeFileName(source: string | null | undefined): string {
  if (typeof source !== 'string' || source.trim() === '') return ''
  // Inline and temporary URLs carry payload bytes, not a name to read aloud.
  if (/^(data|blob):/i.test(source.trim())) return ''

  return baseName(source.trim())
    .replace(EXTENSION_PATTERN, '')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b[0-9a-f]{8,}\b/gi, ' ')
    .replace(/\b[A-Za-z0-9+/]{20,}={0,2}\b/g, ' ')
    .replace(/\b\d{4,}\b/g, ' ')
    .replace(/[^\p{L}\p{N}\s'&]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** True when the text says something a listener can use. */
export function isMeaningfulAltText(value: string | null | undefined): boolean {
  const normalized = normalizeAltText(value)
  if (normalized === '') return false

  const significantWords = normalized
    .toLowerCase()
    .split(/\s+/)
    // `IMG_1234` is the file-name word `img` with numbers attached, not a description.
    .map((word) => word.replace(/[^\p{L}]+/gu, ''))
    .filter((word) => word.length >= 3 && !MEANINGLESS_WORDS.has(word))

  return significantWords.length > 0
}

/**
 * Last-resort description: the humanized file name, then the caller's fallback
 * wording, then a generic label. Never returns an empty string, because an
 * empty `alt` marks the image decorative for assistive technology.
 */
export function generateAltText(
  source: string | null | undefined,
  fallback?: string | null,
): string {
  const fromSource = humanizeFileName(source)
  if (isMeaningfulAltText(fromSource)) return normalizeAltText(fromSource)

  const cleanedFallback = normalizeAltText(fallback)
  return isMeaningfulAltText(cleanedFallback) ? cleanedFallback : DEFAULT_ALT_TEXT
}

/**
 * The value to render as `alt`: the uploader's description when it says
 * something, otherwise a generated one.
 */
export function resolveAltText(
  userAltText: string | null | undefined,
  source?: string | null,
  fallback?: string | null,
): string {
  const cleaned = normalizeAltText(userAltText)
  if (isMeaningfulAltText(cleaned)) return cleaned
  return generateAltText(source, fallback)
}
