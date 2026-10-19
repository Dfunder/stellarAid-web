import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import PortfolioGrid from '@/components/PortfolioGrid'

const items = [
  { id: '1', title: 'Nebula', category: 'Digital' },
  { id: '2', title: 'Harbor', category: 'Oil' },
  { id: '3', title: 'Cascade', category: 'Photo' },
  { id: '4', title: 'Solstice', category: 'Digital' },
  { id: '5', title: 'Tide', category: 'Watercolour' },
]

describe('PortfolioGrid keyboard accessibility (#988)', () => {
  it('exposes a valid grid structure with one row per visual row', () => {
    render(<PortfolioGrid items={items} columns={2} label="Artist portfolio" />)

    const grid = screen.getByRole('grid', { name: 'Artist portfolio' })
    expect(grid).toHaveAttribute('aria-rowcount', '3')
    expect(grid).toHaveAttribute('aria-colcount', '2')

    const rows = screen.getAllByRole('row')
    expect(rows).toHaveLength(3)
    expect(within(rows[0]!).getAllByRole('gridcell')).toHaveLength(2)
    expect(within(rows[1]!).getAllByRole('gridcell')).toHaveLength(2)
    expect(within(rows[2]!).getAllByRole('gridcell')).toHaveLength(1)

    const cells = screen.getAllByRole('gridcell')
    expect(cells).toHaveLength(items.length)
    cells.forEach((cell, index) => {
      expect(cell).toHaveAttribute('aria-roledescription', 'portfolio item')
      expect(cell).toHaveAccessibleName(expect.stringContaining(items[index]!.title))
      expect(cell).toHaveAttribute('aria-colindex', String((index % 2) + 1))
    })
  })

  it('keeps exactly one cell in the tab order and moves it with the arrow keys', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid items={items} columns={2} />)

    const cells = screen.getAllByRole('gridcell')
    expect(cells[0]).toHaveAttribute('tabIndex', '0')
    expect(cells[1]).toHaveAttribute('tabIndex', '-1')

    cells[0]!.focus()
    await user.keyboard('{ArrowRight}')

    expect(cells[1]).toHaveFocus()
    expect(cells[0]).toHaveAttribute('tabIndex', '-1')
    expect(cells[1]).toHaveAttribute('tabIndex', '0')

    await user.keyboard('{ArrowDown}')
    expect(cells[3]).toHaveFocus()
    await user.keyboard('{ArrowUp}')
    expect(cells[1]).toHaveFocus()
    await user.keyboard('{ArrowLeft}')
    expect(cells[0]).toHaveFocus()
  })

  it('supports Home and End navigation', async () => {
    const user = userEvent.setup()
    render(<PortfolioGrid items={items} columns={2} />)

    const cells = screen.getAllByRole('gridcell')
    cells[2]!.focus()

    await user.keyboard('{End}')
    expect(cells[4]).toHaveFocus()
    expect(cells[4]).toHaveAttribute('tabIndex', '0')
    expect(cells[2]).toHaveAttribute('tabIndex', '-1')

    await user.keyboard('{Home}')
    expect(cells[0]).toHaveFocus()
    expect(cells[0]).toHaveAttribute('tabIndex', '0')
  })

  it('activates the focused item with Enter and Space', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()
    render(<PortfolioGrid items={items} onItemActivate={onActivate} />)

    const cells = screen.getAllByRole('gridcell')
    cells[0]!.focus()
    await user.keyboard('{Enter}')
    expect(onActivate).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }))

    cells[1]!.focus()
    await user.keyboard(' ')
    expect(onActivate).toHaveBeenLastCalledWith(expect.objectContaining({ id: '2' }))
  })

  it('renders an empty state when there are no items', () => {
    render(<PortfolioGrid items={[]} emptyMessage="Nothing here yet" />)
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.queryByRole('grid')).not.toBeInTheDocument()
  })
})
