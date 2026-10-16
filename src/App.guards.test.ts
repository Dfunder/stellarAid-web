import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Route-guard baseline (issue #803).
 *
 * `App.tsx` is a large route table with no tests, so it is easy to add a
 * sensitive route and forget its guard. This reads the source and asserts
 * that every authenticated / artist-only route is wrapped in a route guard,
 * giving one place to catch a dropped guard. (Link resolution is covered
 * separately in `App.routes.test.ts`.)
 */
const SRC_DIR = resolve(__dirname)
const APP_SOURCE = readFileSync(join(SRC_DIR, 'App.tsx'), 'utf8')
const LINES = APP_SOURCE.split(/\r?\n/)

const GUARDS = ['RequireAuth', 'ArtistRoute']

/** Route paths that must never be reachable without a guard. */
const PROTECTED_PATH =
  /^(artist\/|dashboard$|transactions$|earnings\/|purchases$|checkout\/|payment\/|settings\/|profile\/|order\/)/

describe('App route guards', () => {
  it('wraps every authenticated/artist route in a guard', () => {
    const offenders: string[] = []

    LINES.forEach((line, index) => {
      const match = line.match(/path="([^"]+)"/)
      if (!match || !PROTECTED_PATH.test(match[1])) return
      // The guard wraps the element a few lines below the `path=` line.
      const windowText = LINES.slice(index, index + 9).join('\n')
      if (!GUARDS.some((guard) => windowText.includes(guard))) {
        offenders.push(`src/App.tsx:${index + 1} — "${match[1]}" is not wrapped in a route guard`)
      }
    })

    expect(offenders, `unguarded protected routes:\n${offenders.join('\n')}`).toEqual([])
  })
})
