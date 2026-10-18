/**
 * Shared focus-visible styles for navigation (#939 / WCAG 2.4.7).
 * Uses the primary ring token (contrast ≥ 3:1 against backgrounds).
 */
export const NAV_FOCUS_CLASSES =
  'rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const NAV_LINK_BASE =
  `text-caption font-semibold text-muted transition-colors hover:text-foreground ${NAV_FOCUS_CLASSES}`
