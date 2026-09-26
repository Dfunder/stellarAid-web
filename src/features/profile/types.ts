import type { UserRole } from '@/features/auth/types'
import type { Artwork, Money, Review } from '@/types'

export interface ArtistSocials {
  twitter?: string
  github?: string
  instagram?: string
  discord?: string
  artstation?: string
}

export interface ArtistServicePackage {
  id: string
  artistId: string
  title: string
  description: string
  startingPrice: Money
  turnaroundDays: number
  deliverables: string[]
  category: string
}

export interface ArtistProfileExtended {
  id: string
  userId: string
  username: string
  displayName: string
  role: UserRole
  bio: string
  location: string
  website: string
  avatarUrl: string | null
  coverUrl: string | null
  skills: string[]
  socials: ArtistSocials
  verified: boolean
  rating: number
  reviewCount: number
  artworksCount: number
  completedCommissionsCount: number
  followersCount: number
  isFollowing?: boolean
  publicKey: string | null
  createdAt: string
  memberSince: string
  services: ArtistServicePackage[]
  portfolio: Artwork[]
  reviews: Review[]
}

export interface ProfileEditFormValues {
  displayName: string
  username: string
  bio: string
  location: string
  website: string
  avatarUrl: string
  coverUrl: string
  skills: string
  twitter: string
  github: string
  instagram: string
  discord: string
  artstation: string
}

export type ProfileTabKey = 'portfolio' | 'services' | 'reviews' | 'about'
