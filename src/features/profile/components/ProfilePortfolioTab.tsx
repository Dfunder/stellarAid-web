import { useState } from 'react'
import { Modal } from '@/components/ui'
import type { Artwork } from '@/types'
import type { ArtistProfileExtended } from '../types'

export interface ProfilePortfolioTabProps {
  profile: ArtistProfileExtended
}

export default function ProfilePortfolioTab({ profile }: ProfilePortfolioTabProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const artworks = profile.portfolio || []
  const categories = ['all', ...Array.from(new Set(artworks.map((a) => a.category).filter(Boolean)))]

  const filteredArtworks =
    filterCategory === 'all'
      ? artworks
      : artworks.filter((a) => a.category.toLowerCase() === filterCategory.toLowerCase())

  return (
    <div className="flex flex-col gap-6">
      {/* Categories filter */}
      {categories.length > 2 && (
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilterCategory(cat)}
              className={`rounded-control px-3 py-1.5 text-caption font-semibold transition ${
                filterCategory === cat
                  ? 'bg-primary text-primary-contrast'
                  : 'bg-surface-muted text-muted hover:text-foreground'
              }`}
            >
              {cat === 'all' ? 'All Artworks' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Artworks Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="rounded-card border border-dashed border-line p-12 text-center">
          <p className="text-body font-semibold text-foreground">No artworks listed yet</p>
          <p className="mt-1 text-caption text-muted">
            This creator has not published any portfolio items under this category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArtworks.map((artwork) => (
            <div
              key={artwork.id}
              onClick={() => setSelectedArtwork(artwork)}
              className="group cursor-pointer overflow-hidden rounded-card border border-line bg-surface shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-muted">
                <img
                  src={artwork.imageUrls[0] || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'}
                  alt={artwork.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 right-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-caption-sm font-semibold shadow-sm ${
                      artwork.status === 'sold'
                        ? 'bg-neutral-800/90 text-neutral-300'
                        : 'bg-primary/90 text-primary-contrast backdrop-blur-sm'
                    }`}
                  >
                    {artwork.status === 'sold' ? 'Sold' : `${artwork.price.amount} ${artwork.price.asset.code}`}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-body font-semibold text-foreground group-hover:text-primary transition-colors">
                    {artwork.title}
                  </h3>
                  <span className="shrink-0 text-caption-sm text-muted">{artwork.category}</span>
                </div>
                {artwork.description && (
                  <p className="mt-1 line-clamp-2 text-caption text-muted">
                    {artwork.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <Modal
          isOpen={Boolean(selectedArtwork)}
          onClose={() => setSelectedArtwork(null)}
          title={selectedArtwork.title}
          description={`${selectedArtwork.category} • Created by ${profile.displayName}`}
        >
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-control bg-neutral-950">
              <img
                src={selectedArtwork.imageUrls[0]}
                alt={selectedArtwork.title}
                className="max-h-96 w-full object-contain mx-auto"
              />
            </div>
            {selectedArtwork.description && (
              <p className="text-body text-foreground leading-relaxed">
                {selectedArtwork.description}
              </p>
            )}
            <div className="flex items-center justify-between border-t border-line pt-4">
              <div>
                <p className="text-caption-sm text-muted">Estimated Price</p>
                <p className="text-h3 font-bold text-foreground">
                  {selectedArtwork.price.amount} {selectedArtwork.price.asset.code}
                </p>
              </div>
              <span
                className={`rounded-control px-3 py-1.5 text-caption font-semibold capitalize ${
                  selectedArtwork.status === 'sold'
                    ? 'bg-neutral-800 text-neutral-300'
                    : 'bg-success/15 text-success'
                }`}
              >
                Status: {selectedArtwork.status}
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
