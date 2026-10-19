import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom/vitest'
import ArtistCard from '@/components/ArtistCard'

describe('ArtistCard accessibility (#988)', () => {
  it('is a named button in the tab order', () => {
    render(<ArtistCard id="artist-1" displayName="Elena" headline="Digital artist" />)

    const card = screen.getByRole('button', { name: /Elena, Digital artist/i })
    expect(card).toHaveAttribute('tabIndex', '0')
    expect(card).toHaveAttribute('aria-roledescription', 'artist card')
    expect(screen.queryByRole('gridcell')).not.toBeInTheDocument()
  })

  it('activates with Enter and Space', async () => {
    const user = userEvent.setup()
    const onActivate = vi.fn()
    render(<ArtistCard id="artist-1" displayName="Elena" onActivate={onActivate} />)

    const card = screen.getByRole('button', { name: 'Elena' })
    card.focus()

    await user.keyboard('{Enter}')
    expect(onActivate).toHaveBeenCalledWith('artist-1')

    await user.keyboard(' ')
    expect(onActivate).toHaveBeenCalledTimes(2)
  })
})
