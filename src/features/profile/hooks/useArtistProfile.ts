import { useQuery } from '@tanstack/react-query'
import { profileService } from '../services/profileService'
import type { ArtistProfileExtended } from '../types'

export const artistProfileKey = (username: string) => ['artist-profile', username.toLowerCase()]

export function useArtistProfile(username?: string) {
  return useQuery<ArtistProfileExtended | null>({
    queryKey: artistProfileKey(username ?? ''),
    queryFn: () => (username ? profileService.getProfileByUsername(username) : null),
    enabled: Boolean(username),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
