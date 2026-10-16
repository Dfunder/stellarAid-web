import { describe, expect, it } from 'vitest'
import { authKeys } from './auth/queryKeys'
import { commissionKeys } from './commissions/queryKeys'
import { marketplaceKeys } from './marketplace/queryKeys'
import { messageKeys } from './messaging/queryKeys'
import { notificationKeys } from './notifications/queryKeys'
import { orderKeys } from './orders/queryKeys'
import { paymentKeys } from './payments/queryKeys'
import { portfolioKeys } from './portfolio/queryKeys'
import { transactionKeys } from './transactions/queryKeys'

/**
 * Query-key well-formedness baseline (issue #802).
 *
 * Each feature owns a `queryKeys.ts` factory. Divergent or colliding root
 * namespaces cause silent cache bugs (a wallet unlink that never invalidates
 * the dependent list, two components keyed the same with different shapes).
 * These assertions pin the two invariants every factory must honour: a
 * non-empty root, and a root that is unique across features.
 */
const FACTORIES: Record<string, { all: readonly unknown[] }> = {
  authKeys,
  commissionKeys,
  marketplaceKeys,
  messageKeys,
  notificationKeys,
  orderKeys,
  paymentKeys,
  portfolioKeys,
  transactionKeys,
}

describe('feature query-key factories', () => {
  it('each exposes a non-empty readonly root tuple', () => {
    for (const [name, factory] of Object.entries(FACTORIES)) {
      expect(Array.isArray(factory.all), `${name}.all must be an array`).toBe(true)
      expect(factory.all.length, `${name}.all must not be empty`).toBeGreaterThan(0)
      expect(typeof factory.all[0], `${name}.all[0] must be a string root`).toBe('string')
    }
  })

  it('uses a distinct root namespace per feature', () => {
    const roots = Object.entries(FACTORIES).map(([name, factory]) => ({ name, root: factory.all[0] }))
    const seen = new Map<unknown, string>()
    const collisions: string[] = []

    for (const { name, root } of roots) {
      const previous = seen.get(root)
      if (previous) collisions.push(`"${String(root)}" shared by ${previous} and ${name}`)
      else seen.set(root, name)
    }

    expect(collisions, `query-key root collisions:\n${collisions.join('\n')}`).toEqual([])
  })
})
