import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Skeleton } from '@/components/ui'
import { http } from '@/services'

interface ArtworkCard {
  id: string
  title: string
  thumbnail?: string
  price: string
  asset: string
  sellerName: string
  sellerUsername: string
}

const STORAGE_KEY = 'recentlyViewed'
const MAX_HISTORY = 20

function getStoredHistory(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function setStoredHistory(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // Ignore storage errors
  }
}

export function useRecentlyViewed() {
  const [history, setHistory] = useState<string[]>(() => getStoredHistory())

  const addToHistory = useCallback((artworkId: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((id) => id !== artworkId)
      const updated = [artworkId, ...filtered].slice(0, MAX_HISTORY)
      setStoredHistory(updated)
      return updated
    })
  }, [])

  const removeFromHistory = useCallback((artworkId: string) => {
    setHistory((prev) => {
      const updated = prev.filter((id) => id !== artworkId)
      setStoredHistory(updated)
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
    setStoredHistory([])
  }, [])

  return { history, addToHistory, removeFromHistory, clearHistory }
}

interface RecentlyViewedProps {
  /** Maximum number of items to show */
  maxItems?: number
  /** Title for the section */
  title?: string
  /** Show as horizontal scroll or grid */
  layout?: 'horizontal' | 'grid'
  /** Artwork ID to exclude (e.g., current page) */
  excludeId?: string
}

export default function RecentlyViewed({
  maxItems = 5,
  title = 'Recently Viewed',
  layout = 'horizontal',
  excludeId,
}: RecentlyViewedProps) {
  const { history } = useRecentlyViewed()
  const filteredHistory = excludeId ? history.filter((id) => id !== excludeId) : history
  const displayIds = filteredHistory.slice(0, maxItems)

  const { data: artworks, isPending } = useQuery({
    queryKey: ['artworks', displayIds],
    queryFn: async (): Promise<ArtworkCard[]> => {
      if (displayIds.length === 0) return []
      const response = await http.post<{ artworks: ArtworkCard[] }>('/artworks/batch', { ids: displayIds })
      // Maintain order from history
      const artworkMap = new Map(response.artworks.map((a) => [a.id, a]))
      return displayIds.map((id) => artworkMap.get(id)).filter(Boolean) as ArtworkCard[]
    },
    enabled: displayIds.length > 0,
  })

  if (displayIds.length === 0) return null

  const renderCard = (artwork: ArtworkCard) => (
    <div className="group">
      <a href={`/artworks/${artwork.id}`} className="block">
        <div className="relative aspect-square rounded-card overflow-hidden bg-surface-muted">
          {artwork.thumbnail ? (
            <img src={artwork.thumbnail} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted">
              <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
            </div>
          )}
        </div>
        <h4 className="mt-2 text-caption font-medium text-foreground line-clamp-1">{artwork.title}</h4>
        <p className="text-caption-xs text-muted">{artwork.sellerName}</p>
        <p className="text-caption-sm font-mono text-foreground">{artwork.price} {artwork.asset}</p>
      </a>
    </div>
  )

  const renderSkeleton = () => (
    <div className="w-40 flex-shrink-0">
      <Skeleton width="100%" aspectRatio={1} radius="card" />
      <SkeletonText lines={3} className="mt-2" />
    </div>
  )

  if (layout === 'horizontal') {
    return (
      <section className="py-6" aria-labelledby="recently-viewed-heading">
        <div className="flex items-center justify-between mb-4">
          <h2 id="recently-viewed-heading" className="text-h3">{title}</h2>
          {history.length > maxItems && (
            <Button variant="ghost" size="sm" asChild>
              <a href="/history">View all</a>
            </Button>
          )}
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-3 px-3" role="list">
          {isPending ? (
            Array.from({ length: maxItems }, (_, i) => <div key={i} role="listitem">{renderSkeleton()}</div>)
          ) : artworks?.length === 0 ? (
            <p className="text-caption text-muted">No recently viewed artworks found.</p>
          ) : (
            artworks?.map((artwork) => (
              <div key={artwork.id} role="listitem" className="w-40 flex-shrink-0">
                {renderCard(artwork)}
              </div>
            ))
          )}
        </div>
      </section>
    )
  }

  return (
    <section className="py-6" aria-labelledby="recently-viewed-heading">
      <div className="flex items-center justify-between mb-4">
        <h2 id="recently-viewed-heading" className="text-h3">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {isPending ? (
          Array.from({ length: maxItems }, (_, i) => <SkeletonCard key={i} />)
        ) : artworks?.length === 0 ? (
          <p className="text-caption text-muted col-span-full text-center py-8">No recently viewed artworks found.</p>
        ) : (
          artworks?.map((artwork) => (
            <div key={artwork.id} role="listitem">{renderCard(artwork)}</div>
          ))
        )}
      </div>
    </section>
  )
}