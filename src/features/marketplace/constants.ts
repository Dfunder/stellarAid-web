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
