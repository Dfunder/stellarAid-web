import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Source-level guard for the `EditListing` population bug (#776).
 *
 * The form used to be filled inside a `useState` lazy initializer that
 * called `setFormData` and discarded the return value. The initializer runs
 * once on mount, when the async `listing` query is still `undefined`, so the
 * form never populated — and the attempt also triggered React's
 * "Cannot update a component while rendering a different component" warning.
 * A behavioural render test needs a DOM test environment this repo does not
 * have, so this guards the structural property instead (same approach as
 * `App.test.ts`).
 */
const SOURCE = readFileSync(resolve(__dirname, 'EditListing.tsx'), 'utf8')

describe('EditListing form population (#776)', () => {
  it('no longer calls setFormData inside a useState lazy initializer', () => {
    expect(SOURCE).not.toMatch(/useState\(\s*\(\)\s*=>\s*\{[\s\S]{0,300}setFormData/)
  })

  it('populates the form from a useEffect once the listing resolves', () => {
    expect(SOURCE).toMatch(/useEffect\(\s*\(\)\s*=>\s*\{[\s\S]{0,300}setFormData\(listingToFormValues\(listing\)\)/)
  })
})
