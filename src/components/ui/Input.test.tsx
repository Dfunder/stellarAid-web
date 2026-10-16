import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Input from './Input'

describe('Input accessibility wiring (#797)', () => {
  it('describes the field with both the error and the hint when both are present', () => {
    render(<Input label="Email" error="Enter a valid email." hint="Use your work email." />)

    const input = screen.getByLabelText('Email')
    const describedBy = input.getAttribute('aria-describedby') ?? ''

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(describedBy).toContain(`${input.id}-error`)
    expect(describedBy).toContain(`${input.id}-hint`)
    expect(screen.getByText('Enter a valid email.')).toBeInTheDocument()
    expect(screen.getByText('Use your work email.')).toBeInTheDocument()
  })

  it('describes the field with the hint alone when there is no error', () => {
    render(<Input label="Email" hint="Use your work email." />)

    const input = screen.getByLabelText('Email')

    expect(input).toHaveAttribute('aria-describedby', `${input.id}-hint`)
    expect(input).not.toHaveAttribute('aria-invalid')
  })

  it('merges a caller-supplied aria-describedby instead of replacing its own', () => {
    render(<Input label="Email" error="Required." aria-describedby="external-help" />)

    const input = screen.getByLabelText('Email')
    const describedBy = input.getAttribute('aria-describedby') ?? ''

    expect(describedBy).toContain('external-help')
    expect(describedBy).toContain(`${input.id}-error`)
  })

  it('keeps its own invalid state when a caller passes aria-invalid', () => {
    render(<Input label="Email" error="Required." aria-invalid={false} />)

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-invalid', 'true')
  })

  it('still forwards ordinary input props to the field', async () => {
    const user = userEvent.setup()
    let typed = ''
    render(
      <Input
        label="Email"
        onChange={(event) => {
          typed = event.target.value
        }}
      />,
    )

    await user.type(screen.getByLabelText('Email'), 'hi')

    expect(typed).toBe('hi')
  })
})
