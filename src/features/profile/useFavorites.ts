import { useState, useEffect, useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { http } from '@/services'
import { useAuth } from '@/features/auth'

export interface FavoriteItem {
  id: string
  type: 'artwork' | 'artist'
  artworkId?: string
  artistId?: string
  createdAt: string
  artwork?: {
    id: string
    title: string
    thumbnail?: string
    price: string
    asset: string
  }
  artist?: {
    id: string
    username: string
    name: string
    avatarUrl?: string
  }
}

const GUEST_STORAGE_KEY = 'guestFavorites'
const EMPTY_FAVORITES: FavoriteItem[] = []

function getGuestFavorites(): FavoriteItem[] {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setGuestFavorites(favorites: FavoriteItem[]) {
  try {
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(favorites))
  } catch {
    // Ignore
  }
}

export function useFavorites() {
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const [guestFavorites, setGuestFavoritesState] = useState<FavoriteItem[]>(() => getGuestFavorites())

  // Load server favorites when authenticated
  const { data: serverFavorites, isPending } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async (): Promise<FavoriteItem[]> => {
      const response = await http.get<{ favorites: FavoriteItem[] }>('/favorites')
      return response.favorites
    },
    enabled: !!isAuthenticated,
  })

  // Merge guest and server favorites (stable empty array avoids re-running isFavorite)
  const allFavorites = useMemo<FavoriteItem[]>(
    () => (isAuthenticated ? (serverFavorites ?? EMPTY_FAVORITES) : guestFavorites),
    [isAuthenticated, serverFavorites, guestFavorites],
  )

  const toggleFavorite = useMutation({
    mutationFn: async ({ type, id }: { type: 'artwork' | 'artist'; id: string }) => {
      if (isAuthenticated) {
        return http.post<{ favorite: FavoriteItem }>('/favorites/toggle', { type, id })
      } else {
        const existing = guestFavorites.find((f) => f.type === type && (f.artworkId === id || f.artistId === id))
        if (existing) {
          const updated = guestFavorites.filter((f) => f !== existing)
          setGuestFavorites(updated)
          setGuestFavoritesState(updated)
          return { favorite: null }
        } else {
          const newFav: FavoriteItem = {
            id: `guest-${Date.now()}`,
            type,
            [type === 'artwork' ? 'artworkId' : 'artistId']: id,
            createdAt: new Date().toISOString(),
          }
          const updated = [newFav, ...guestFavorites]
          setGuestFavorites(updated)
          setGuestFavoritesState(updated)
          return { favorite: newFav }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] })
    },
  })

  const isFavorite = useCallback((type: 'artwork' | 'artist', id: string) => {
    return allFavorites.some((f) => f.type === type && (f.artworkId === id || f.artistId === id))
  }, [allFavorites])

  // Merge guest favorites on login
  useEffect(() => {
    if (!(isAuthenticated && guestFavorites.length > 0 && !isPending)) return
    let cancelled = false
    void (async () => {
      for (const fav of guestFavorites) {
        if (cancelled) return
        await toggleFavorite.mutateAsync({ type: fav.type, id: fav.artworkId ?? fav.artistId ?? '' })
      }
      if (cancelled) return
      setGuestFavorites([])
      setGuestFavoritesState([])
    })()
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, guestFavorites, isPending, toggleFavorite])

  return {
    favorites: allFavorites,
    toggleFavorite,
    isFavorite,
    isPending: isPending || toggleFavorite.isPending,
  }
}