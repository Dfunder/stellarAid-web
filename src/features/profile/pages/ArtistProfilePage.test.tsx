import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

const useArtistProfile = vi.fn()

vi.mock('../hooks/useArtistProfile', () => ({
  useArtistProfile: () => useArtistProfile(),
}))

// Keep the test focused on the tab strip; the panels are covered elsewhere.
vi.mock('../components/ProfileHeader', () => ({ default: () => <div /> }))
vi.mock('../components/ProfileStats', () => ({ default: () => <div /> }))
vi.mock('../components/ProfilePortfolioTab', () => ({ default: () => <div>portfolio panel</div> }))
vi.mock('../components/ProfileServicesTab', () => ({ default: () => <div>services panel</div> }))
vi.mock('../components/ProfileReviewsTab', () => ({ default: () => <div>reviews panel</div> }))
vi.mock('../components/ProfileAboutTab', () => ({ default: () => <div>about panel</div> }))

import ArtistProfilePage from './ArtistProfilePage'

const profile = {
  displayName: 'Elena',
  username: 'elena_art',
  bio: 'Hand-thrown ceramics.',
  portfolio: [],
  services: [],
  reviews: [],
}

function renderPage(initialEntry = '/artists/elena_art') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/artists/:username" element={<ArtistProfilePage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useArtistProfile.mockReturnValue({ data: profile, isLoading: false, isError: false })
  document.querySelector('meta[name="description"]')?.remove()
})

describe('ArtistProfilePage tabs (#857)', () => {
  it('exposes a tablist with selected state on the active tab', () => {
    renderPage()

    expect(screen.getByRole('tablist', { name: 'Profile Tabs' })).toBeInTheDocument()

    const portfolioTab = screen.getByRole('tab', { name: 'Portfolio' })
    const servicesTab = screen.getByRole('tab', { name: 'Services' })

    expect(portfolioTab).toHaveAttribute('aria-selected', 'true')
    expect(servicesTab).toHaveAttribute('aria-selected', 'false')
    expect(portfolioTab).toHaveAttribute('tabindex', '0')
    expect(servicesTab).toHaveAttribute('tabindex', '-1')
  })

  it('moves selection with the arrow keys and follows focus', async () => {
    const user = userEvent.setup()
    renderPage()

    screen.getByRole('tab', { name: 'Portfolio' }).focus()
    await user.keyboard('{ArrowRight}')

    const servicesTab = screen.getByRole('tab', { name: 'Services' })
    expect(servicesTab).toHaveAttribute('aria-selected', 'true')
    expect(servicesTab).toHaveFocus()
  })

  it('labels the panel from the active tab and makes it focusable', () => {
    renderPage()

    const panel = screen.getByRole('tabpanel')
    expect(panel).toHaveAttribute('tabindex', '0')
    expect(panel).toHaveAccessibleName('Portfolio')
  })

  it('removes the injected meta description on unmount', () => {
    const { unmount } = renderPage()

    expect(document.querySelector('meta[name="description"]')).not.toBeNull()

    unmount()

    expect(document.querySelector('meta[name="description"]')).toBeNull()
  })
})
