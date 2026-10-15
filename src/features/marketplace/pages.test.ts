import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Source-level guards for the routed marketplace pages (#781, #782).
 *
 * The three pages declared required props (`artworkId`, `listingId`, `slug`)
 * that the router never passed — `useParams` was not used anywhere — so each
 * query's `enabled` flag stayed false and the pages spun forever. Rendering
 * the pages needs a DOM test environment this repo does not have, so the
 * structural properties are guarded here (same approach as `App.test.ts`).
 */
const read = (name: string): string => readFileSync(resolve(__dirname, name), 'utf8')

const checkout = read('CheckoutPage.tsx')
const editListing = read('EditListing.tsx')
const category = read('CategoryLandingPage.tsx')
const recentlyViewed = read('RecentlyViewed.tsx')
const app = read(resolve(__dirname, '../../App.tsx'))

describe('route params (#782)', () => {
  it('each page reads its own param with useParams and a prop fallback', () => {
    expect(checkout).toMatch(/const artworkId = artworkIdProp \?\? params\.artworkId/)
    expect(editListing).toMatch(/const listingId = listingIdProp \?\? params\.listingId/)
    expect(category).toMatch(/const slug = slugProp \?\? params\.slug/)
  })

  it('the route params are optional — no non-null assertions', () => {
    expect(checkout).not.toMatch(/params\.\w+!/)
    expect(editListing).not.toMatch(/params\.\w+!/)
    expect(category).not.toMatch(/params\.\w+!/)
  })

  it('App keeps rendering the bare route elements', () => {
    expect(app).toMatch(/<CheckoutPage \/>/)
    expect(app).toMatch(/<EditListing \/>/)
    expect(app).toMatch(/<CategoryLandingPage \/>/)
  })
})

describe('skeleton imports (#781)', () => {
  it('RecentlyViewed imports the skeleton components it renders', () => {
    expect(recentlyViewed).toMatch(
      /import \{[^}]*SkeletonText[^}]*\} from '@\/components\/ui'/
    )
    expect(recentlyViewed).toMatch(
      /import \{[^}]*SkeletonCard[^}]*\} from '@\/components\/ui'/
    )
  })

  it('CategoryLandingPage imports the skeleton components it renders', () => {
    expect(category).toMatch(/import \{[^}]*SkeletonText[^}]*\} from '@\/components\/ui'/)
    expect(category).toMatch(/import \{[^}]*SkeletonGrid[^}]*\} from '@\/components\/ui'/)
  })
})
