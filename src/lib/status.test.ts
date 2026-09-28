import { describe, it, expect } from 'vitest'
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_CLASSES,
  LISTING_STATUS_LABELS,
  LISTING_STATUS_CLASSES,
  ESCROW_STATUS_LABELS,
  ESCROW_STATUS_CLASSES,
  TX_STATUS_LABELS,
  TX_STATUS_CLASSES,
} from './status'

const labelMaps = [
  ORDER_STATUS_LABELS,
  LISTING_STATUS_LABELS,
  ESCROW_STATUS_LABELS,
  TX_STATUS_LABELS,
]

const classMaps = [
  ORDER_STATUS_CLASSES,
  LISTING_STATUS_CLASSES,
  ESCROW_STATUS_CLASSES,
  TX_STATUS_CLASSES,
]

const VALID_TOKENS = ['primary', 'success', 'warning', 'danger', 'muted']

function assertValidClassNames(className: string) {
  const parts = className.trim().split(/\s+/)
  for (const part of parts) {
    const match = part.match(/^(bg|text)-([a-z-]+)(\/\d+)?$/)
    expect(match, `"${part}" is not a token utility`).not.toBeNull()
    const token = match![2]
    expect(VALID_TOKENS, `"${part}" uses unknown token "${token}"`).toContain(token)
  }
}

describe('status metadata', () => {
  it('covers every status with both a label and a className', () => {
    for (const map of labelMaps) {
      for (const status of Object.keys(map)) {
        expect(map[status], `label missing for ${status}`).toBeTruthy()
      }
    }
    for (const map of classMaps) {
      for (const status of Object.keys(map)) {
        expect(map[status], `className missing for ${status}`).toBeTruthy()
      }
    }
  })

  it('has label and class maps of equal size per domain', () => {
    labelMaps.forEach((labels, i) => {
      expect(Object.keys(classMaps[i]).sort()).toEqual(Object.keys(labels).sort())
    })
  })

  it('only uses Tailwind tokens that exist in the config', () => {
    for (const map of classMaps) {
      for (const className of Object.values(map)) {
        assertValidClassNames(className)
      }
    }
  })

  it('labels match the documented copy for ordering domain', () => {
    expect(ORDER_STATUS_LABELS.processing).toBe('Processing')
    expect(ORDER_STATUS_LABELS.refunded).toBe('Refunded')
  })
})