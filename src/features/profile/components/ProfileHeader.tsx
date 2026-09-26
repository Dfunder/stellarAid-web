import { useState } from 'react'
import { Button } from '@/components/ui'
import { profileService } from '../services/profileService'
import type { ArtistProfileExtended } from '../types'
import CommissionRequestModal from './CommissionRequestModal'
import ShareModal from './ShareModal'

export interface ProfileHeaderProps {
  profile: ArtistProfileExtended
  onTabChange?: (tab: 'services' | 'portfolio') => void
}

export default function ProfileHeader({ profile, onTabChange }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(Boolean(profile.isFollowing))
  const [followersCount, setFollowersCount] = useState(profile.followersCount)
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const [isCommissionModalOpen, setCommissionModalOpen] = useState(false)

  const handleFollowToggle = async () => {
    const res = await profileService.toggleFollow(profile.username)
    setIsFollowing(res.isFollowing)
    setFollowersCount(res.followersCount)
  }

  const defaultCoverGradient =
    'bg-gradient-to-r from-brand-purple-900 via-neutral-900 to-amber-950'

  return (
    <div className="relative">
      {/* Cover Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-card md:h-64 lg:h-80">
        {profile.coverUrl ? (
          <img
            src={profile.coverUrl}
            alt={`${profile.displayName} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className={`h-full w-full ${defaultCoverGradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
      </div>

      {/* Main Profile Info Header */}
      <div className="relative -mt-16 px-4 pb-6 sm:-mt-20 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Avatar and Main Identifiers */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-background bg-surface shadow-elevated sm:h-36 sm:w-36">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gold/30 to-primary/40 text-display font-bold text-foreground">
                  {profile.displayName.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-h2 font-bold text-foreground">{profile.displayName}</h1>
                {profile.verified && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-caption-sm font-semibold text-gold"
                    title="Verified Stellar Creator"
                  >
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified
                  </span>
                )}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-3 text-caption text-muted">
                <span className="font-medium text-foreground/80">@{profile.username}</span>
                <span>•</span>
                <span className="capitalize">{profile.role}</span>
                {profile.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {profile.location}
                    </span>
                  </>
                )}
                {profile.website && (
                  <>
                    <span>•</span>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1 text-primary hover:underline"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons: Follow, Share, Hire CTA */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 sm:pt-0">
            <Button
              variant={isFollowing ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleFollowToggle}
              className="min-w-24"
            >
              {isFollowing ? 'Following' : 'Follow'} ({followersCount})
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShareModalOpen(true)}
              title="Share profile"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setCommissionModalOpen(true)}
              className="bg-gold text-neutral-950 hover:bg-gold/90"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Hire Creator
            </Button>
          </div>
        </div>

        {/* Short Bio snippet */}
        {profile.bio && (
          <p className="mt-4 max-w-3xl text-body text-foreground/90 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Social Links Row */}
        {profile.socials && Object.values(profile.socials).some(Boolean) && (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {profile.socials.twitter && (
              <a
                href={profile.socials.twitter.startsWith('http') ? profile.socials.twitter : `https://x.com/${profile.socials.twitter}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-control bg-surface-muted px-2.5 py-1 text-caption-sm text-muted transition hover:text-foreground"
              >
                <span>X / Twitter</span>
              </a>
            )}
            {profile.socials.github && (
              <a
                href={profile.socials.github.startsWith('http') ? profile.socials.github : `https://github.com/${profile.socials.github}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-control bg-surface-muted px-2.5 py-1 text-caption-sm text-muted transition hover:text-foreground"
              >
                <span>GitHub</span>
              </a>
            )}
            {profile.socials.instagram && (
              <a
                href={profile.socials.instagram.startsWith('http') ? profile.socials.instagram : `https://instagram.com/${profile.socials.instagram}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-control bg-surface-muted px-2.5 py-1 text-caption-sm text-muted transition hover:text-foreground"
              >
                <span>Instagram</span>
              </a>
            )}
            {profile.socials.artstation && (
              <a
                href={profile.socials.artstation.startsWith('http') ? profile.socials.artstation : `https://artstation.com/${profile.socials.artstation}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-control bg-surface-muted px-2.5 py-1 text-caption-sm text-muted transition hover:text-foreground"
              >
                <span>ArtStation</span>
              </a>
            )}
          </div>
        )}
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        profile={profile}
      />

      <CommissionRequestModal
        isOpen={isCommissionModalOpen}
        onClose={() => setCommissionModalOpen(false)}
        profile={profile}
      />
    </div>
  )
}
