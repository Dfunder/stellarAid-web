import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const SRC = resolve(__dirname)

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.tsx$/.test(name) && !/\.(test|rtl\.test)\.tsx$/.test(name) ? [path] : []
  })
}

describe('internal navigation', () => {
  it('uses react-router <Link>, not a raw <a href="/..."> anchor, for in-app destinations', () => {
    const offenders = sourceFiles(SRC).flatMap((file) =>
      readFileSync(file, 'utf8')
        .split('\n')
        .flatMap((line, index) =>
          /<a\s[^>]*href=(\{`\/|"\/)/.test(line) && !/target="_blank"/.test(line)
            ? [`${file.replace(SRC, 'src')}:${index + 1}`]
            : [],
        ),
    )

    expect(offenders).toEqual([])
  })
})
