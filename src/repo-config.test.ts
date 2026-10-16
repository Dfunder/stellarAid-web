import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = resolve(__dirname, '..')
const read = (path: string) => readFileSync(resolve(ROOT, path), 'utf8')

describe('repository configuration', () => {
  it('declares the documented Node range in package.json engines', () => {
    const pkg = JSON.parse(read('package.json')) as { engines?: { node?: string } }
    expect(pkg.engines?.node).toBe('^20.19.0 || >=22.12.0')
  })

  it('pins an .nvmrc inside the supported range', () => {
    const [major = 0, minor = 0] = read('.nvmrc').trim().split('.').map(Number)
    const supported = (major === 20 && minor >= 19) || major > 22 || (major === 22 && minor >= 12)
    expect(supported).toBe(true)
  })

  it('has an .editorconfig that agrees with .prettierrc', () => {
    const prettier = JSON.parse(read('.prettierrc')) as { tabWidth: number; endOfLine: string }
    const editorconfig = read('.editorconfig')
    expect(editorconfig).toContain(`indent_size = ${prettier.tabWidth}`)
    expect(editorconfig).toContain(`end_of_line = ${prettier.endOfLine}`)
    expect(editorconfig).toContain('insert_final_newline = true')
    expect(editorconfig).toMatch(/\[\*\.md\]\s+trim_trailing_whitespace = false/)
  })

  it('keeps the ignore files consistent about dist and coverage', () => {
    for (const file of ['.prettierignore', '.eslintignore', 'eslint.config.js']) {
      const text = read(file)
      expect(text, file).toContain('dist')
      expect(text, file).toContain('coverage')
    }
  })

  it('ships the husky hooks the contributing guide documents', () => {
    expect(read('.husky/pre-commit')).toContain('lint-staged')
    expect(read('.husky/pre-push')).toContain('npm run type-check')
    expect(read('CONTRIBUTING.md')).toContain('## Git Hooks')
  })

  it('only references repository paths that exist in CONTRIBUTING.md', () => {
    const paths = [...read('CONTRIBUTING.md').matchAll(/`((?:src|\.husky)\/[A-Za-z0-9_./-]+)`/g)].map(
      (match) => match[1] as string,
    )
    const missing = paths.filter((path) => !path.includes('<') && !path.includes('...') && !existsSync(resolve(ROOT, path)))
    expect(missing).toEqual([])
  })
})
