import { useState, useEffect, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { http } from '@/services'
import { useAuth } from '@/features/auth'

interface FavoriteItem {
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
  const [isLoaded, setIsLoaded] = useState(false)

  // Load server favorites when authenticated
  const { data: serverFavorites, isPending } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async (): Promise<FavoriteItem[]> => {
      const response = await http.get<{ favorites: FavoriteItem[] }>('/favorites')
      return response.favorites
    },
    enabled: isAuthenticated,
  })

  // Merge guest and server favorites
  const allFavorites = isAuthenticated ? (serverFavorites ?? []) : guestFavorites

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
    if (isAuthenticated && guestFavorites.length > 0 && !isPending) {
      guestFavorites.forEach((fav) => {
        toggleFavorite.mutate({ type: fav.type, id: fav.artworkId ?? fav.artistId ?? '' })
      })
      setGuestFavorites([])
      setGuestFavoritesState([])
    }
  }, [isAuthenticated, guestFavorites, isPending, toggleFavorite])

  return {
    favorites: allFavorites,
    toggleFavorite,
    isFavorite,
    isPending: isPending || toggleFavorite.isPending,
  }
}

export function FavoriteButton({
  type,
  id,
  className = '',
  size = 'md',
}: {
  type: 'artwork' | 'artist'
  id: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const { isFavorite, toggleFavorite, isPending } = useFavorites()
  const favorited = isFavorite(type, id)

  const SIZE_CLASSES = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return (
    <button
      type="button"
      onClick={() => toggleFavorite.mutate({ type, id })}
      disabled={isPending}
      className={`relative flex items-center justify-center rounded-full transition-colors ${SIZE_CLASSES[size]} ${className} ${
        favorited ? 'bg-primary/10 text-primary' : 'bg-surface-muted text-muted hover:bg-surface hover:text-foreground'
      }`}
      aria-label={favorited ? `Remove from favorites` : `Add to favorites`}
      aria-pressed={favorited}
    >
      <svg
        className={`h-5 w-5 ${size === 'sm' ? 'h-4 w-4' : ''} ${favorited ? 'fill-current' : ''}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={favorited ? '0' : '2'}
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {isPending && <span className="absolute inset-0 animate-pulse bg-current/10 rounded-full" />}
    </button>
  )
}

interface FavoritesPageProps {
  /** Tab to show: 'artworks' or 'artists' */
  defaultTab?: 'artworks' | 'artists'
}

export default function FavoritesPage({ defaultTab = 'artworks' }: FavoritesPageProps) {
  const { favorites, isPending } = useFavorites()
  const [activeTab, setActiveTab] = useState(defaultTab)

  const artworkFavorites = favorites.filter((f) => f.type === 'artwork')
  const artistFavorites = favorites.filter((f) => f.type === 'artist')

  if (isPending) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-3 py-8 text-muted">
          <span className="animate-spin">⟳</span>
          <span className="text-caption">Loading favorites…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2">Favorites</h1>
          <p className="mt-1 text-caption text-muted">
            Your saved artworks and artists.
          </p>
        </div>
        <div className="flex items-center gap-2 border-b border-line">
          <button
            type="button"
            onClick={() => setActiveTab('artworks')}
            className={`px-4 py-2 text-caption-sm font-medium rounded-t-control transition-colors ${
              activeTab === 'artworks' ? 'bg-surface text-foreground border-b-2 border-primary -mb-px' : 'text-muted hover:text-foreground'
            }`}
          >
            Artworks ({artworkFavorites.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('artists')}
            className={`px-4 py-2 text-caption-sm font-medium rounded-t-control transition-colors ${
              activeTab === 'artists' ? 'bg-surface text-foreground border-b-2 border-primary -mb-px' : 'text-muted hover:text-foreground'
            }`}
          >
            Artists ({artistFavorites.length})
          </button>
        </div>
      </div>

      {activeTab === 'artworks' ? (
        <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
          {artworkFavorites.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted">
              <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p className="text-caption">No favorite artworks yet.</p>
              <p className="text-caption-xs">Browse the marketplace and click the heart icon to save artworks.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Artwork</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Artist</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Price</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Saved</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted"></th>
                  </tr>
                </thead>
                <tbody>
                  {artworkFavorites.map((fav) => (
                    <tr key={fav.id} className="border-b border-line/50 hover:bg-surface-muted/50">
                      <td className="px-4 py-3">
                        <a href={`/artworks/${fav.artwork?.id}`} className="flex items-center gap-3">
                          {fav.artwork?.thumbnail && (
                            <img src={fav.artwork.thumbnail} alt="" className="h-12 w-12 rounded-card object-cover" />
                          )}
                          <span className="text-caption font-medium text-foreground">{fav.artwork?.title}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3 text-caption text-muted">
                        {fav.artwork && (
                          <a href={`/artists/${fav.artwork.id}`} className="hover:text-foreground">
                            {fav.artist?.name ?? 'Unknown'}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3 text-caption-sm font-mono text-foreground">
                        {fav.artwork?.price} {fav.artwork?.asset}
                      </td>
                      <td className="px-4 py-3 text-caption-sm text-muted">
                        {new Date(fav.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-caption-sm font-semibold text-danger hover:underline"
                          onClick={() => toggleFavorite.mutate({ type: 'artwork', id: fav.artworkId ?? '' })}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
          {artistFavorites.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-muted">
              <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <p className="text-caption">No favorite artists yet.</p>
              <p className="text-caption-xs">Visit artist profiles and click the heart icon to save them.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {artistFavorites.map((fav) => (
                <a
                  key={fav.id}
                  href={`/artists/${fav.artist?.username}`}
                  className="flex items-center gap-4 p-4 rounded-card border border-line hover:bg-surface-muted transition-colors"
                >
                  {fav.artist?.avatarUrl && (
                    <img src={fav.artist.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-caption font-semibold text-foreground truncate">{fav.artist?.name}</h3>
                    <p className="text-caption-xs text-muted">@{fav.artist?.username}</p>
                  </div>
                  <button
                    type="button"
                    className="text-caption-sm font-semibold text-danger hover:underline"
                    onClick={(e) => { e.preventDefault(); toggleFavorite.mutate({ type: 'artist', id: fav.artistId ?? '' }) }}
                  >
                    Remove
                  </button>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}