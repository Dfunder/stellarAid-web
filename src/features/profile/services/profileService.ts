import { http } from '@/services'
import { queryClient } from '@/stores'
import type { User } from '@/features/auth/types'
import type { ArtistProfileExtended, ArtistServicePackage, ProfileEditFormValues } from '../types'
import { SEEDED_ARTISTS } from '../mocks/fixtures'

// Re-exported so `features/profile`'s public surface is unchanged after the seed
// data moved into `mocks/fixtures.ts` (#834).
export { SEEDED_ARTISTS }

// In-memory profile storage to persist updates during the session
const dynamicProfiles: Record<string, ArtistProfileExtended> = { ...SEEDED_ARTISTS }

export const profileService = {
  /**
   * Fetches an artist's full public profile by username.
   */
  async getProfileByUsername(username: string): Promise<ArtistProfileExtended | null> {
    const cleanUsername = username.trim().toLowerCase().replace(/^@/, '')

    // Check dynamic local cache
    if (dynamicProfiles[cleanUsername]) {
      return { ...dynamicProfiles[cleanUsername] }
    }

    try {
      const profile = await http.get<ArtistProfileExtended>(`/profiles/${encodeURIComponent(cleanUsername)}`)
      if (profile) {
        dynamicProfiles[cleanUsername] = profile
        return profile
      }
    } catch {
      // Backend not running or profile not on server: check if it matches seeded data
    }

    return null
  },

  /**
   * Checks whether a username is available.
   */
  async checkUsernameAvailability(
    username: string,
    currentUserId?: string,
  ): Promise<{ available: boolean; message?: string }> {
    const clean = username.trim().toLowerCase().replace(/^@/, '')

    if (!clean) {
      return { available: false, message: 'Username cannot be empty.' }
    }
    if (clean.length < 3) {
      return { available: false, message: 'Username must be at least 3 characters.' }
    }
    if (clean.length > 30) {
      return { available: false, message: 'Username cannot exceed 30 characters.' }
    }
    if (!/^[a-z0-9_]+$/.test(clean)) {
      return { available: false, message: 'Username can only contain letters, numbers, and underscores.' }
    }

    // Check if taken in dynamic local profiles
    const existing = dynamicProfiles[clean]
    if (existing && existing.userId !== currentUserId) {
      return { available: false, message: 'That username is already taken.' }
    }

    try {
      const res = await http.get<{ available: boolean }>(`/profiles/check-username/${encodeURIComponent(clean)}`)
      return res
    } catch {
      // #834 — this returned `{ available: true }`, so a network outage painted
      // the field green and the user could commit to a taken username. Report an
      // honest third state instead: not available, and not claimed either way.
      return { available: false, message: 'Could not verify — try again.' }
    }
  },

  /**
   * Updates the current user's profile details.
   */
  async updateProfile(user: User, values: Partial<ProfileEditFormValues>): Promise<User> {
    const cleanUsername = (values.username || user.username || user.name.toLowerCase().replace(/\s+/g, '_'))
      .trim()
      .toLowerCase()
      .replace(/^@/, '')

    const updatedUser: User = {
      ...user,
      name: values.displayName ? values.displayName.trim() : user.name,
      username: cleanUsername,
      bio: values.bio !== undefined ? values.bio.trim() : user.bio,
      location: values.location !== undefined ? values.location.trim() : user.location,
      website: values.website !== undefined ? values.website.trim() : user.website,
      avatarUrl: values.avatarUrl !== undefined ? values.avatarUrl.trim() : user.avatarUrl,
      coverUrl: values.coverUrl !== undefined ? values.coverUrl.trim() : user.coverUrl,
      skills: values.skills ? values.skills.split(',').map((s) => s.trim()).filter(Boolean) : user.skills,
      socials: {
        twitter: values.twitter,
        github: values.github,
        instagram: values.instagram,
        discord: values.discord,
        artstation: values.artstation,
      },
    }

    // Save to dynamic profiles so public page immediately reflects changes
    const existingExtended = dynamicProfiles[cleanUsername] || {
      id: `artist-${user.id}`,
      userId: user.id,
      username: cleanUsername,
      displayName: updatedUser.name,
      role: user.role,
      bio: updatedUser.bio || '',
      location: updatedUser.location || '',
      website: updatedUser.website || '',
      avatarUrl: updatedUser.avatarUrl || null,
      coverUrl: updatedUser.coverUrl || null,
      skills: updatedUser.skills || [],
      socials: updatedUser.socials || {},
      verified: true,
      rating: 5.0,
      reviewCount: 0,
      artworksCount: 0,
      completedCommissionsCount: 0,
      followersCount: 1,
      isFollowing: false,
      publicKey: user.publicKey,
      createdAt: user.createdAt || new Date().toISOString(),
      memberSince: 'Recently joined',
      services: [],
      portfolio: [],
      reviews: [],
    }

    // #834 — the PATCH used to sit in a `catch {}` and then return updatedUser
    // regardless, so a failed save still told the UI it had succeeded. Persist
    // first, and only touch the local cache once the server has accepted it.
    await http.patch<User>('/profiles/me', values)

    dynamicProfiles[cleanUsername] = {
      ...existingExtended,
      displayName: updatedUser.name,
      username: cleanUsername,
      bio: updatedUser.bio || '',
      location: updatedUser.location || '',
      website: updatedUser.website || '',
      avatarUrl: updatedUser.avatarUrl || null,
      coverUrl: updatedUser.coverUrl || null,
      skills: updatedUser.skills || [],
      socials: updatedUser.socials || {},
    }

    return updatedUser
  },

  /**
   * Toggles following an artist.
   */
  async toggleFollow(username: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const clean = username.trim().toLowerCase().replace(/^@/, '')
    const profile = dynamicProfiles[clean]

    // #834 — this never called `http`; it only flipped a module-level singleton,
    // so follows were per-browser, lost on reload, and shared across accounts.
    // The server is now the source of truth for the resulting state.
    const res = await http.post<{ isFollowing: boolean; followersCount: number }>(
      `/profiles/${encodeURIComponent(clean)}/follow`,
    )

    if (profile) {
      profile.isFollowing = res.isFollowing
      profile.followersCount = res.followersCount
    }

    // The artist profile view is cached under ['artistProfile', username].
    await queryClient.invalidateQueries({ queryKey: ['artistProfile', clean] })

    return res
  },
}
