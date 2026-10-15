import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { truncateMiddle } from '@/lib/format'
import Button from './Button'

/**
 * Sample component test for the jsdom + React Testing Library setup (#791):
 * renders into a real DOM, asserts with jest-dom matchers, and proves the
 * `@/` alias resolves inside tests.
 */
describe('React Testing Library setup', () => {
  it('renders a Button and asserts on it through the DOM', () => {
    render(<Button variant="secondary">Save changes</Button>)

    const button = screen.getByRole('button', { name: 'Save changes' })
    expect(button).toBeInTheDocument()
    expect(button).toBeEnabled()
    expect(button).toHaveClass('inline-flex')
    // secondary variant styling reached the DOM
    expect(button).toHaveClass('border-line')
  })

  it('keeps the @/ path alias resolvable from tests', () => {
    render(<Button>{truncateMiddle('ABCDEFGHIJKLMNOPQRST')}</Button>)

    expect(screen.getByRole('button')).toHaveTextContent('ABCDEF…QRST')
  })
})
