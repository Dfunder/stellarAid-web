import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button asChild support', () => {
  it('renders a single anchor element when asChild is true', () => {
    const { container } = render(
      <Button asChild variant="primary" size="md">
        <a href="/test-link">Test Link</a>
      </Button>
    )

    // Should NOT contain a button element
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBe(0)

    // Should contain exactly one anchor element
    const anchor = screen.getByRole('link', { name: /test link/i })
    expect(anchor).toBeInTheDocument()
    expect(anchor).toHaveAttribute('href', '/test-link')
    expect(anchor.className).toContain('inline-flex')
    expect(anchor.className).toContain('bg-primary')
  })

  it('renders standard button when asChild is false or omitted', () => {
    render(<Button>Standard Button</Button>)
    const button = screen.getByRole('button', { name: /standard button/i })
    expect(button).toBeInTheDocument()
  })
})
