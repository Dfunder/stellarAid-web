import { describe, expect, it } from 'vitest'
import { ESCROW_STEPS, escrowStepMeta, statusMeta, type AppStatus } from './status'

const ALL: AppStatus[] = [
  'pending', 'processing', 'completed', 'failed', 'refunded',
  'draft', 'active', 'sold', 'unpublished',
  'submitted', 'confirming', 'confirmed',
  'funded', 'in_progress', 'delivered', 'released', 'disputed', 'cancelled',
]

describe('statusMeta', () => {
  it('has a label, class and description for every status', () => {
    for (const status of ALL) {
      const meta = statusMeta(status)
      expect(meta.label).not.toBe('')
      expect(meta.className).not.toBe('')
      expect(meta.description).not.toBe('')
    }
  })

  it('never uses the undefined `blue` Tailwind colour', () => {
    for (const status of ALL) expect(statusMeta(status).className).not.toMatch(/\bblue\b/)
  })

  it('uses a real colour for the in-progress style statuses', () => {
    expect(statusMeta('in_progress').className).toContain('brand-purple')
    expect(statusMeta('processing').className).toContain('brand-purple')
    expect(statusMeta('confirming').className).toContain('brand-purple')
  })
})

describe('escrowStepMeta', () => {
  it('orders steps along the timeline', () => {
    expect(ESCROW_STEPS[0]).toBe('funded')
    expect(escrowStepMeta('delivered').index).toBe(ESCROW_STEPS.indexOf('delivered'))
  })

  it('gives steps outside the timeline index -1', () => {
    expect(escrowStepMeta('cancelled').index).toBe(-1)
  })
})
