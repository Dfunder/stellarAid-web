import { StarIcon } from '@/components/ui'
import type { ArtistProfileExtended } from '../types'

export interface ProfileStatsProps {
  profile: ArtistProfileExtended
}

export default function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = [
    {
      label: 'Artworks',
      value: profile.artworksCount || profile.portfolio.length,
      icon: (
        <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Commissions Completed',
      value: profile.completedCommissionsCount,
      icon: (
        <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Rating',
      value: `${profile.rating.toFixed(1)} ★ (${profile.reviewCount})`,
      icon: (
        <StarIcon className="h-5 w-5 text-gold" />
      ),
    },
    {
      label: 'Member Since',
      value: profile.memberSince,
      icon: (
        <svg className="h-5 w-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 border-y border-line bg-surface/50 p-4 sm:grid-cols-4 sm:gap-4 sm:p-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface-muted">
            {stat.icon}
          </div>
          <div className="min-w-0">
            <p className="text-body font-bold text-foreground truncate">{stat.value}</p>
            <p className="text-caption-sm text-muted truncate">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
