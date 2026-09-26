/**
 * Profile feature.
 *
 * User profiles: public creator/backer pages and account settings.
 * This barrel is the feature's public API; everything else stays private.
 */
export { default as ProfileAboutTab } from './components/ProfileAboutTab'
export { default as ProfileHeader } from './components/ProfileHeader'
export { default as ProfilePortfolioTab } from './components/ProfilePortfolioTab'
export { default as ProfileReviewsTab } from './components/ProfileReviewsTab'
export { default as ProfileServicesTab } from './components/ProfileServicesTab'
export { default as ProfileStats } from './components/ProfileStats'
export { default as ShareModal } from './components/ShareModal'
export { default as CommissionRequestModal } from './components/CommissionRequestModal'

export { artistProfileKey, useArtistProfile } from './hooks/useArtistProfile'
export { useCheckUsername } from './hooks/useCheckUsername'
export { useUpdateProfile } from './hooks/useUpdateProfile'

export { default as ArtistProfilePage } from './pages/ArtistProfilePage'
export { default as ProfileEditPage } from './pages/ProfileEditPage'
export { default as FavoritesPage, FavoriteButton, useFavorites } from './FavoritesPage'

export { SEEDED_ARTISTS, profileService } from './services/profileService'

export type {
  ArtistProfileExtended,
  ArtistServicePackage,
  ArtistSocials,
  ProfileEditFormValues,
  ProfileTabKey,
} from './types'
