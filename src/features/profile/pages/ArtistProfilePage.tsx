import { useEffect, useId, useRef } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Spinner } from '@/components/ui'
import ProfileAboutTab from '../components/ProfileAboutTab'
import ProfileHeader from '../components/ProfileHeader'
import ProfilePortfolioTab from '../components/ProfilePortfolioTab'
import ProfileReviewsTab from '../components/ProfileReviewsTab'
import ProfileServicesTab from '../components/ProfileServicesTab'
import ProfileStats from '../components/ProfileStats'
import { useArtistProfile } from '../hooks/useArtistProfile'
import type { ProfileTabKey } from '../types'

const VALID_TABS: ProfileTabKey[] = ['portfolio', 'services', 'reviews', 'about']

export default function ArtistProfilePage() {
  const { username } = useParams<{ username: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const baseId = useId()
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  const currentTab = (searchParams.get('tab') as ProfileTabKey) || 'portfolio'
  const activeTab: ProfileTabKey = VALID_TABS.includes(currentTab) ? currentTab : 'portfolio'

  const { data: profile, isLoading, isError } = useArtistProfile(username)

  // Update SEO meta tags dynamically. The previous description is restored (or
  // the tag we created is removed) on unmount so navigating artist → artist no
  // longer leaks the previous artist's copy (#857).
  useEffect(() => {
    if (!profile) return

    document.title = `${profile.displayName} (@${profile.username}) | Lumora Artist Profile`

    const existing = document.querySelector('meta[name="description"]')
    const previousContent = existing?.getAttribute('content') ?? null
    const metaDescription = existing ?? document.createElement('meta')
    if (!existing) {
      metaDescription.setAttribute('name', 'description')
      document.head.appendChild(metaDescription)
    }
    metaDescription.setAttribute(
      'content',
      profile.bio || `View ${profile.displayName}'s portfolio, commissions, and artworks on Lumora.`,
    )

    return () => {
      document.title = 'Lumora - Crowdfunding on Stellar'
      if (previousContent === null) metaDescription.remove()
      else metaDescription.setAttribute('content', previousContent)
    }
  }, [profile])

  const handleTabClick = (tab: ProfileTabKey) => {
    setSearchParams({ tab }, { replace: true })
  }

  const tabId = (tab: ProfileTabKey) => `${baseId}-tab-${tab}`
  const panelId = (tab: ProfileTabKey) => `${baseId}-panel-${tab}`

  if (isLoading) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center gap-3 py-24 text-muted">
        <Spinner label="Loading artist profile" className="h-8 w-8 text-primary" />
        <p className="text-body font-medium">Loading creator profile…</p>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="container flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger/10 text-danger">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="mt-4 text-h2 font-bold text-foreground">Creator not found</h1>
        <p className="mt-2 max-w-md text-body text-muted">
          We could not find an artist profile for <span className="font-semibold text-foreground">@{username}</span>. The creator may have changed their handle or deactivated their account.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-control bg-primary px-5 py-2.5 text-body font-semibold text-primary-contrast shadow-card hover:bg-primary-strong focus-visible:shadow-focus-ring"
          >
            Back to Home
          </Link>
          <Link
            to="/artists/elena_art"
            className="rounded-control border border-line bg-surface px-5 py-2.5 text-body font-semibold text-foreground shadow-card hover:bg-surface-muted focus-visible:shadow-focus-ring"
          >
            View Featured Artist (@elena_art)
          </Link>
        </div>
      </div>
    )
  }

  const tabs: { key: ProfileTabKey; label: string; count?: number }[] = [
    { key: 'portfolio', label: 'Portfolio', count: profile.portfolio?.length },
    { key: 'services', label: 'Services', count: profile.services?.length },
    { key: 'reviews', label: 'Reviews', count: profile.reviews?.length },
    { key: 'about', label: 'About' },
  ]

  // Roving-tabindex keyboard support for the tablist (#857).
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const lastIndex = tabs.length - 1
    let nextIndex: number | null = null
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = index === lastIndex ? 0 : index + 1
        break
      case 'ArrowLeft':
        nextIndex = index === 0 ? lastIndex : index - 1
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = lastIndex
        break
      default:
        return
    }

    event.preventDefault()
    const nextTab = tabs[nextIndex]
    if (!nextTab) return
    handleTabClick(nextTab.key)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="container max-w-6xl pt-6">
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-elevated">
          {/* Header Component */}
          <ProfileHeader
            profile={profile}
            onTabChange={(tab) => handleTabClick(tab)}
          />

          {/* Stats Bar */}
          <ProfileStats profile={profile} />

          {/* Deep-Linked Tabs Navigation */}
          <div className="border-b border-line px-4 sm:px-8">
            <nav className="flex space-x-8" role="tablist" aria-label="Profile Tabs">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    ref={(el) => {
                      tabRefs.current[index] = el
                    }}
                    id={`${baseId}-tab-${tab.key}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${baseId}-panel-${tab.key}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => handleTabClick(tab.key)}
                    onKeyDown={(event) => handleTabKeyDown(event, index)}
                    className={`relative py-4 text-body font-semibold transition-colors flex items-center gap-2 ${
                      isActive
                        ? 'text-primary'
                        : 'text-muted hover:text-foreground'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-caption-sm ${
                          isActive
                            ? 'bg-primary/15 text-primary'
                            : 'bg-surface-muted text-muted'
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content Panes */}
          <div
            role="tabpanel"
            id={`${baseId}-panel-${activeTab}`}
            aria-labelledby={`${baseId}-tab-${activeTab}`}
            tabIndex={0}
            className="p-4 sm:p-8 focus-visible:shadow-focus-ring"
          >
            {activeTab === 'portfolio' && <ProfilePortfolioTab profile={profile} />}
            {activeTab === 'services' && <ProfileServicesTab profile={profile} />}
            {activeTab === 'reviews' && <ProfileReviewsTab profile={profile} />}
            {activeTab === 'about' && <ProfileAboutTab profile={profile} />}
          </div>
        </div>
      </div>
    </div>
  )
}
