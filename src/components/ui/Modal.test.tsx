import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Modal from './Modal'

describe('Modal behaviour (#797)', () => {
  it('renders nothing while closed', () => {
    render(
      <Modal isOpen={false} title="Delete listing" onClose={() => {}}>
        body
      </Modal>,
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('takes its accessible name from the visible title', () => {
    render(
      <Modal isOpen title="Delete listing" onClose={() => {}}>
        body
      </Modal>,
    )

    const dialog = screen.getByRole('dialog')

    expect(dialog).toHaveAccessibleName('Delete listing')
    expect(screen.getByRole('heading', { name: 'Delete listing' })).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen title="Delete listing" onClose={onClose}>
        body
      </Modal>,
    )

    await user.keyboard('{Escape}')

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('closes on a backdrop click', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal isOpen title="Delete listing" onClose={onClose}>
        body
      </Modal>,
    )

    const backdrop = screen.getByRole('dialog').previousElementSibling as HTMLElement
    await user.click(backdrop)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks the body scroll while open and restores it on unmount', () => {
    const { unmount } = render(
      <Modal isOpen title="Delete listing" onClose={() => {}}>
        body
      </Modal>,
    )

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })

  it('moves focus into the dialog on open', () => {
    render(
      <Modal isOpen title="Delete listing" onClose={() => {}}>
        body
      </Modal>,
    )

    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
  })

  it('returns focus to the trigger when it closes', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Modal isOpen={open} title="Delete" onClose={() => setOpen(false)}>
            body
          </Modal>
        </>
      )
    }

    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Open' })

    await user.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    expect(trigger).toHaveFocus()
  })

  it('traps Tab within the dialog', async () => {
    const user = userEvent.setup()
    render(
      <Modal isOpen title="Delete listing" onClose={() => {}}>
        <button type="button">Confirm</button>
      </Modal>,
    )

    const dialog = screen.getByRole('dialog')

    await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)

    await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('exposes the backdrop as a real control rather than a clickable div', () => {
    render(
      <Modal isOpen title="Delete listing" onClose={() => {}}>
        body
      </Modal>,
    )

    const backdrop = screen.getByRole('dialog').previousElementSibling
    expect(backdrop?.tagName).toBe('BUTTON')
  })
})
