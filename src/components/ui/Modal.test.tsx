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
})
