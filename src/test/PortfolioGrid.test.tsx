import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import PortfolioGrid from '@/components/PortfolioGrid'

const items = [
  { id: '1', title: 'Nebula', category: 'Digital' },
  { id: '2', title: 'Harbor', category: 'Oil' },
  { id: '3', title: 'Cascade', category: 'Photo' },
]

describe('PortfolioGrid keyboard accessibility (#935)', () => {
  it('exposes role=grid and role=gridcell with aria labels', () => {
    render(<PortfolioGrid items={items} label="Artist portfolio" />)

    expect(screen.getByRole('grid', { name: 'Artist portfolio' })).toBeInTheDocument()
    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(3)
    expect(cells[0]).toHaveAttribute('aria-roledescription', 'portfolio item')
    expect(cells[0]).toHaveAccessibleName(/Nebula/)
  })

  it('makes the first item tabbable and activates on Enter', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()
    render(<PortfolioGrid items={items} onItemActivate={onActivate} />)

    const cells = screen.getAllByRole('gridcell')
    expect(cells[0]).toHaveAttribute('tabIndex', '0')
    cells[0]!.focus()
    await user.keyboard('{Enter}')
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))
  })

  it('navigates between items with arrow keys', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid items={items} columns={3} />)

    const cells = screen.getAllByRole('gridcell')
    cells[0]!.focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(cells[1])
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(cells[0])
  })
})
