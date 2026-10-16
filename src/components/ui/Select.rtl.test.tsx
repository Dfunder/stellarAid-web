import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Select from './Select'

describe('Select', () => {
  it('labels the control and associates the label by id', () => {
    render(
      <Select label="Category">
        <option value="a">A</option>
      </Select>,
    )

    expect(screen.getByLabelText('Category')).toBeInstanceOf(HTMLSelectElement)
  })

  it('marks the control invalid and describes it by the error', () => {
    render(
      <Select label="Asset" error="Choose an asset" hint="ignored when there is an error">
        <option value="">Select</option>
      </Select>,
    )

    const select = screen.getByLabelText('Asset')
    expect(select).toHaveAttribute('aria-invalid', 'true')
    const describedBy = select.getAttribute('aria-describedby') ?? ''
    expect(document.getElementById(describedBy)).toHaveTextContent('Choose an asset')
    expect(screen.queryByText('ignored when there is an error')).toBeNull()
  })

  it('describes the control by the hint when there is no error', () => {
    render(
      <Select label="Wallet" hint="Only linked wallets">
        <option value="x">X</option>
      </Select>,
    )

    const select = screen.getByLabelText('Wallet')
    expect(select).not.toHaveAttribute('aria-invalid')
    expect(document.getElementById(select.getAttribute('aria-describedby') ?? '')).toHaveTextContent(
      'Only linked wallets',
    )
  })

  it('does not forward the error prop to the DOM element', () => {
    const { container } = render(
      <Select label="Status" error="Nope">
        <option value="x">X</option>
      </Select>,
    )

    expect(container.querySelector('select')?.getAttribute('error')).toBeNull()
  })
})
