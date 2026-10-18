import { describe, expect, it } from 'vitest'
import { NAV_FOCUS_CLASSES, NAV_LINK_BASE } from '../navFocus'

describe('nav focus styles (#939)', () => {
  it('includes focus-visible ring classes for WCAG 2.4.7', () => {
    expect(NAV_FOCUS_CLASSES).toMatch(/focus-visible:ring-2/)
    expect(NAV_FOCUS_CLASSES).toMatch(/focus-visible:ring-primary/)
    expect(NAV_LINK_BASE).toContain(NAV_FOCUS_CLASSES)
  })

  it('does not use outline:none without a ring replacement', () => {
    // outline-none is OK only when paired with ring
    expect(NAV_FOCUS_CLASSES).toMatch(/focus-visible:outline-none/)
    expect(NAV_FOCUS_CLASSES).toMatch(/focus-visible:ring-/)
  })
})
