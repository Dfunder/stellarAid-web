/**
 * Shared marketplace constants (#779).
 *
 * `LICENSE_PRESETS` used to be declared independently in `EditListing`,
 * `CheckoutPage` (and imported un-exported from `EditListing` by
 * `LicenseTermsField`, which evaluated to `undefined` and crashed). One
 * declaration, imported from here by every consumer.
 */
export const LICENSE_PRESETS = [
  { value: 'personal', label: 'Personal Use', description: 'For personal, non-commercial use only' },
  { value: 'commercial', label: 'Commercial Use', description: 'Allows commercial use with attribution' },
  { value: 'exclusive', label: 'Exclusive Rights', description: 'Full exclusive rights, artwork removed from marketplace' },
] as const

/**
 * Deliverable upload limits. `DeliverableUpload` reads these instead of re-deriving them inline.
 */
export const ALLOWED_DELIVERABLE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
  'application/octet-stream',
  'video/mp4',
  'video/webm',
  'audio/mpeg',
  'audio/wav',
] as const

export const MAX_DELIVERABLE_FILE_SIZE = 500 * 1024 * 1024 // 500MB
export const MAX_DELIVERABLE_FILE_SIZE_LABEL = '500MB'
export const MAX_DELIVERABLE_FILES = 20
