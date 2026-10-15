import { type ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import type { ArtistProfileExtended, ProfileTabKey } from '../types'
import ProfileAboutTab from './ProfileAboutTab'
import ProfilePortfolioTab from './ProfilePortfolioTab'
import ProfileReviewsTab from './ProfileReviewsTab'
import ProfileServicesTab from './ProfileServicesTab'

const profile: ArtistProfileExtended = {
  id: 'p1',
  userId: 'u1',
  username: 'elena_art',
  displayName: 'Elena Art',
  role: 'artist',
  bio: 'Digital artist crafting stellar worlds.',
  location: 'Lisbon, PT',
  website: 'https://elena.example',
  avatarUrl: null,
  coverUrl: null,
  skills: ['Concept art', 'Illustration'],
  socials: {},
  verified: true,
  rating: 4.5,
  reviewCount: 12,
  artworksCount: 3,
  completedCommissionsCount: 7,
  followersCount: 128,
  publicKey: null,
  createdAt: '2024-01-15T00:00:00.000Z',
  memberSince: 'Jan 2024',
  services: [],
  portfolio: [],
  reviews: [],
}

/** Renders a tab to static markup — the baseline every profile tab must keep. */
function renderTab(tab: ReactElement): string {
  return renderToStaticMarkup(tab)
}

const TABS: Array<{ key: ProfileTabKey; element: ReactElement }> = [
  { key: 'portfolio', element: <ProfilePortfolioTab profile={profile} /> },
  { key: 'services', element: <ProfileServicesTab profile={profile} /> },
  { key: 'reviews', element: <ProfileReviewsTab profile={profile} /> },
  { key: 'about', element: <ProfileAboutTab profile={profile} /> },
]

describe('profile tabs — component-test baseline (#803)', () => {
  it('covers every ProfileTabKey', () => {
    const keys = TABS.map((tab) => tab.key).sort()
    const declared: ProfileTabKey[] = ['about', 'portfolio', 'reviews', 'services']
    expect(keys).toEqual(declared)
  })

  it.each(TABS.map((tab) => [tab.key, tab.element] as const))(
    'renders the %s tab without throwing',
    (_key, element) => {
      const html = renderTab(element)
      expect(html.length).toBeGreaterThan(0)
      expect(html).not.toContain('[object Object]')
      expect(html).not.toContain('undefined')
    },
  )

  it('shows biography and skills on the about tab', () => {
    const html = renderTab(<ProfileAboutTab profile={profile} />)
    expect(html).toContain('Biography')
    expect(html).toContain('Digital artist crafting stellar worlds.')
    expect(html).toContain('Concept art')
  })

  it('falls back to empty states for an unpopulated profile', () => {
    expect(renderTab(<ProfilePortfolioTab profile={profile} />)).toContain('No artworks listed yet')
    expect(renderTab(<ProfileReviewsTab profile={profile} />)).toContain('No reviews yet')
    const services = renderTab(<ProfileServicesTab profile={profile} />)
    expect(services).toContain('Commission Offerings &amp; Services')
    expect(services).toContain('No direct service packages listed')
  })

  it('renders services and a hire action when packages exist', () => {
    const withServices: ArtistProfileExtended = {
      ...profile,
      services: [
        {
          id: 's1',
          artistId: 'p1',
          title: 'Character portrait',
          description: 'Half-body portrait with simple background.',
          startingPrice: { amount: '25', asset: { code: 'XLM', issuer: null } },
          turnaroundDays: 5,
          deliverables: ['PNG', 'PSD'],
          category: 'Portrait',
        },
      ],
    }
    const html = renderTab(<ProfileServicesTab profile={withServices} />)
    expect(html).toContain('Character portrait')
    expect(html).toContain('Hire')
  })
})
