import { http } from '@/services'
import type { User } from '@/features/auth/types'
import type { ArtistProfileExtended, ArtistServicePackage, ProfileEditFormValues } from '../types'

/** Seeded artist profiles for realistic fallback, testing, and initial catalog. */
export const SEEDED_ARTISTS: Record<string, ArtistProfileExtended> = {
  elena_art: {
    id: 'artist-elena-001',
    userId: 'user-elena-001',
    username: 'elena_art',
    displayName: 'Elena Rostova',
    role: 'artist',
    bio: 'Digital illustrator and concept artist specializing in cyberpunk aesthetics, neo-surrealism, and celestial worldbuilding. Based in Berlin, creating on Stellar.',
    location: 'Berlin, Germany',
    website: 'https://elenarostova.art',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80',
    skills: ['Digital Illustration', 'Concept Art', 'Blender 3D', 'Character Design', 'Matte Painting'],
    socials: {
      twitter: 'https://x.com/elena_illustrates',
      github: 'https://github.com/elena-art',
      instagram: 'https://instagram.com/elena.rostova.art',
      discord: 'elena#4092',
      artstation: 'https://artstation.com/elenarostova',
    },
    verified: true,
    rating: 4.95,
    reviewCount: 48,
    artworksCount: 24,
    completedCommissionsCount: 62,
    followersCount: 1420,
    isFollowing: false,
    publicKey: 'GBCX7Z7L4Z5PZ34MRO5N2XVR6N6G7B2F6Z6E2YQ6F5N4V3L2K1J0H9G8',
    createdAt: '2023-11-15T10:00:00.000Z',
    memberSince: 'November 2023',
    services: [
      {
        id: 'srv-1',
        artistId: 'artist-elena-001',
        title: 'Custom Character Illustration',
        description: 'High-resolution character portrait or full-body illustration in stylized cyberpunk or sci-fi aesthetic with full commercial rights.',
        startingPrice: { amount: '250.0000000', asset: { code: 'XLM', issuer: null } },
        turnaroundDays: 7,
        deliverables: ['4K PNG + JPEG', 'Layered PSD source file', 'Commercial license document'],
        category: 'Character Design',
      },
      {
        id: 'srv-2',
        artistId: 'artist-elena-001',
        title: 'Environment & Concept Scene',
        description: 'Detailed background or landscape artwork with cinematic lighting, atmosphere and composition.',
        startingPrice: { amount: '500.0000000', asset: { code: 'XLM', issuer: null } },
        turnaroundDays: 14,
        deliverables: ['8K Render PNG', '3 Mood sketch iterations', 'Source files + 3D pass'],
        category: 'Environment Art',
      },
      {
        id: 'srv-3',
        artistId: 'artist-elena-001',
        title: 'NFT / On-Chain Series Artwork',
        description: 'Bespoke high-tier digital artwork prepared for Stellar Soroban smart contract minting and metadata creation.',
        startingPrice: { amount: '800.0000000', asset: { code: 'XLM', issuer: null } },
        turnaroundDays: 21,
        deliverables: ['Vector/Ultra-HD Assets', 'Metadata JSON', 'IPFS Pinning Certificate'],
        category: 'Web3 & NFTs',
      },
    ],
    portfolio: [
      {
        id: 'art-1',
        artistId: 'artist-elena-001',
        title: 'Neon Horizon 2099',
        description: 'A sprawling cyberpunk skyline under twin violet moons.',
        category: 'Concept Art',
        imageUrls: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'],
        price: { amount: '350.0000000', asset: { code: 'XLM', issuer: null } },
        status: 'published',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: 'art-2',
        artistId: 'artist-elena-001',
        title: 'Celestial Sentinel',
        description: 'Guardian of the orbital relay network.',
        category: 'Illustration',
        imageUrls: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80'],
        price: { amount: '420.0000000', asset: { code: 'XLM', issuer: null } },
        status: 'published',
        createdAt: new Date('2024-02-14'),
        updatedAt: new Date('2024-02-14'),
      },
      {
        id: 'art-3',
        artistId: 'artist-elena-001',
        title: 'Quantum Mirage',
        description: 'Visual study on light refraction and gravitational lensing.',
        category: 'Abstract',
        imageUrls: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80'],
        price: { amount: '290.0000000', asset: { code: 'XLM', issuer: null } },
        status: 'sold',
        createdAt: new Date('2024-03-01'),
        updatedAt: new Date('2024-03-01'),
      },
      {
        id: 'art-4',
        artistId: 'artist-elena-001',
        title: 'Stellar Bloom',
        description: 'Synthesizing organic flora with crystalline space minerals.',
        category: 'Illustration',
        imageUrls: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80'],
        price: { amount: '480.0000000', asset: { code: 'XLM', issuer: null } },
        status: 'published',
        createdAt: new Date('2024-03-18'),
        updatedAt: new Date('2024-03-18'),
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        authorId: 'user-kai-01',
        artistId: 'artist-elena-001',
        rating: 5,
        comment: 'Elena delivered beyond expectations! The attention to lighting and detail is world-class. Smooth Stellar transaction too.',
        createdAt: new Date('2024-02-20'),
      },
      {
        id: 'rev-2',
        authorId: 'user-maya-02',
        artistId: 'artist-elena-001',
        rating: 5,
        comment: 'Incredible work on our game concept art. She finished 3 days ahead of deadline.',
        createdAt: new Date('2024-03-05'),
      },
      {
        id: 'rev-3',
        authorId: 'user-dev-03',
        artistId: 'artist-elena-001',
        rating: 4.8,
        comment: 'Great communication and beautiful style. Will definitely commission again!',
        createdAt: new Date('2024-03-15'),
      },
    ],
  },
  stellar_nova: {
    id: 'artist-nova-002',
    userId: 'user-nova-002',
    username: 'stellar_nova',
    displayName: 'Nova Chen',
    role: 'artist',
    bio: '3D motion designer, generative artist, and XR creator. Exploring decentralized art economies and generative math on Stellar.',
    location: 'Tokyo / Remote',
    website: 'https://novachen.io',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1600&q=80',
    skills: ['3D Modeling', 'Houdini Generative', 'Three.js', 'Motion Design', 'AR/VR'],
    socials: {
      twitter: 'https://x.com/stellar_nova',
      github: 'https://github.com/novachen',
      instagram: 'https://instagram.com/nova.chen.3d',
    },
    verified: true,
    rating: 4.9,
    reviewCount: 32,
    artworksCount: 18,
    completedCommissionsCount: 45,
    followersCount: 980,
    isFollowing: false,
    publicKey: 'GAA5R4N3M2L1K0J9H8G7F6E5D4C3B2A1Z0Y9X8W7V6U5T4S3R2Q1P0O9',
    createdAt: '2024-01-08T14:30:00.000Z',
    memberSince: 'January 2024',
    services: [
      {
        id: 'srv-nova-1',
        artistId: 'artist-nova-002',
        title: '3D Product or Brand Animation',
        description: 'Smooth 60fps 3D loop or product reveal with realistic textures and physics simulations.',
        startingPrice: { amount: '400.0000000', asset: { code: 'XLM', issuer: null } },
        turnaroundDays: 10,
        deliverables: ['ProRes 4444 Video', 'GLTF/GLB 3D Web Model', 'Loopable MP4'],
        category: '3D & Motion',
      },
    ],
    portfolio: [
      {
        id: 'art-nova-1',
        artistId: 'artist-nova-002',
        title: 'Hypercube Resonance',
        description: 'Procedural 4D projection sculpture with reactive lighting.',
        category: '3D Motion',
        imageUrls: ['https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80'],
        price: { amount: '600.0000000', asset: { code: 'XLM', issuer: null } },
        status: 'published',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
    ],
    reviews: [
      {
        id: 'rev-nova-1',
        authorId: 'user-sam-01',
        artistId: 'artist-nova-002',
        rating: 5,
        comment: 'Nova is a wizard with 3D particles. Elevated our web experience significantly.',
        createdAt: new Date('2024-02-28'),
      },
    ],
  },
}

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
      // Fallback: available if not found in local registry
      return { available: true }
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

    try {
      await http.patch<User>('/profiles/me', values)
    } catch {
      // Best effort update
    }

    return updatedUser
  },

  /**
   * Toggles following an artist.
   */
  async toggleFollow(username: string): Promise<{ isFollowing: boolean; followersCount: number }> {
    const clean = username.trim().toLowerCase().replace(/^@/, '')
    const profile = dynamicProfiles[clean]
    if (profile) {
      const isFollowing = !profile.isFollowing
      const followersCount = isFollowing ? profile.followersCount + 1 : Math.max(0, profile.followersCount - 1)
      profile.isFollowing = isFollowing
      profile.followersCount = followersCount
      return { isFollowing, followersCount }
    }
    return { isFollowing: true, followersCount: 1 }
  },
}
