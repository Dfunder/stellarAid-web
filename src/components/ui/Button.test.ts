import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter, Link } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Button from './Button'

describe('Button asChild (#780)', () => {
  it('renders a single anchor when wrapping a react-router Link — no button wrapper', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(
          Button,
          { asChild: true },
          createElement(Link, { to: '/checkout/art-1' }, 'Checkout')
        )
      )
    )

    expect(html).toContain('href="/checkout/art-1"')
    expect(html.match(/<a /g)).toHaveLength(1)
    expect(html).not.toContain('<button')
    expect(html).toContain('Checkout')
  })

  it('merges button classes onto the child anchor', () => {
    const html = renderToStaticMarkup(
      createElement(
        Button,
        { asChild: true, className: 'mt-6', variant: 'secondary' },
        createElement('a', { href: '/' }, 'Home')
      )
    )

    expect(html).toContain('href="/"')
    expect(html).toContain('mt-6')
    // secondary variant styling reaches the anchor
    expect(html).toContain('border border-line')
    expect(html).not.toContain('<button')
  })

  it('still renders a plain <button> without asChild', () => {
    const html = renderToStaticMarkup(createElement(Button, null, 'Save'))

    expect(html).toContain('<button')
    expect(html).not.toContain('<a ')
    expect(html).toContain('Save')
  })
})
