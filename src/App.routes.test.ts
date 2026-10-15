import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC_DIR = resolve(__dirname)

const APP_SOURCE = readFileSync(join(SRC_DIR, 'App.tsx'), 'utf8')

/**
 * Every route path declared in `App.tsx`, e.g. `checkout/:artworkId`.
 * The catch-all `*` is excluded — it absorbs misses instead of resolving them.
 */
const DECLARED_ROUTES = [...APP_SOURCE.matchAll(/path="([^"]+)"/g)]
  .map((match) => match[1])
  .filter((path): path is string => Boolean(path) && path !== '*')

const HAS_INDEX_ROUTE = APP_SOURCE.includes('<Route index')

interface LinkRef {
  path: string
  line: number
}

/** Every literal internal `to=`/`href=` link in a source file, with its line. */
function extractLinks(source: string): LinkRef[] {
  const links: LinkRef[] = []
  const patterns = [/(?<=\s)(?:to|href)=\{?"([^"]*)"/g, /(?<=\s)(?:to|href)=\{?`([^`]*)`/g]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const raw = match[1]
      if (!raw) continue
      // External (`https://…`), protocol-relative and in-page targets are out
      // of scope; only internal paths must exist in the route table.
      if (!raw.startsWith('/') || raw.startsWith('//')) continue
      const path = raw.split('?')[0]?.split('#')[0] ?? '/'
      const line = source.slice(0, match.index ?? 0).split('\n').length
      links.push({ path, line })
    }
  }
  return links
}

function listTsxFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) files.push(...listTsxFiles(full))
    else if (entry.name.endsWith('.tsx') && !entry.name.endsWith('.test.tsx')) files.push(full)
  }
  return files
}

function matchesRoute(pathname: string, pattern: string): boolean {
  const linkSegments = pathname.split('/').filter(Boolean)
  const routeSegments = pattern.split('/').filter(Boolean)
  if (linkSegments.length !== routeSegments.length) return false
  return routeSegments.every((segment, index) => {
    const linkSegment = linkSegments[index] ?? ''
    if (segment.startsWith(':')) return true
    // Template segments such as `${artworkId}` are dynamic as well.
    if (linkSegment.includes('${')) return true
    return segment === linkSegment
  })
}

function resolves(pathname: string): boolean {
  if (pathname === '/') return HAS_INDEX_ROUTE
  return DECLARED_ROUTES.some((route) => matchesRoute(pathname, route))
}

describe('internal links vs the route table', () => {
  it('reads a non-trivial route table out of App.tsx', () => {
    expect(DECLARED_ROUTES.length).toBeGreaterThan(10)
    expect(HAS_INDEX_ROUTE).toBe(true)
  })

  it('never links to a route that does not exist', () => {
    const offenders: string[] = []

    for (const file of listTsxFiles(SRC_DIR)) {
      const source = readFileSync(file, 'utf8')
      const relative = file.slice(SRC_DIR.length + 1)
      for (const link of extractLinks(source)) {
        if (!resolves(link.path)) {
          offenders.push(`${relative}:${link.line} → ${link.path}`)
        }
      }
    }

    expect(offenders, `unresolvable internal links:\n${offenders.join('\n')}`).toEqual([])
  })
})
