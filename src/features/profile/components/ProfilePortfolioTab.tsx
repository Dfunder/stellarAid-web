import { useMemo, useState } from 'react'
import PortfolioGrid from '@/components/PortfolioGrid'
import { MediaLightbox, Modal } from '@/components/ui'
import type { Artwork } from '@/types'
import type { ArtistProfileExtended } from '../types'

export interface ProfilePortfolioTabProps {
  profile: ArtistProfileExtended
}

export default function ProfilePortfolioTab({ profile }: ProfilePortfolioTabProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [activeMediaIndex, setActiveMediaIndex] = useState(0)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const artworks = profile.portfolio || []
  const categories = ['all', ...Array.from(new Set(artworks.map((a) => a.category).filter(Boolean)))]

  const filteredArtworks =
    filterCategory === 'all'
      ? artworks
      : artworks.filter((a) => a.category.toLowerCase() === filterCategory.toLowerCase())

  const selectedImageUrls = useMemo(
    () => selectedArtwork?.imageUrls ?? [],
    [selectedArtwork],
  )

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
        <PortfolioGrid
          items={filteredArtworks.map((artwork) => ({
            id: artwork.id,
            title: artwork.title,
            imageUrl: artwork.imageUrls[0],
            category: artwork.category,
            status:
              artwork.status === 'sold'
                ? 'Sold'
                : `${artwork.price.amount} ${artwork.price.asset.code}`,
            description: artwork.description,
          }))}
          columns={3}
          label={`${profile.displayName} portfolio`}
          onItemActivate={(item) => {
            const artwork = filteredArtworks.find((a) => a.id === item.id) ?? null
            setSelectedArtwork(artwork)
            setActiveMediaIndex(0)
          }}
        />
      )}

      {/* Artwork Detail Modal */}
      {selectedArtwork && (
        <Modal
          isOpen={Boolean(selectedArtwork)}
          onClose={() => setSelectedArtwork(null)}
          title={selectedArtwork.title}
          description={`${selectedArtwork.category} • Created by ${profile.displayName}`}
          className="max-w-5xl"
        >
          <div className="flex flex-col gap-4">
            <div className="overflow-hidden rounded-control bg-neutral-950">
              <button
                type="button"
                onClick={() => {
                  setActiveMediaIndex(0)
                  setSelectedArtwork(selectedArtwork)
                }}
                className="block w-full cursor-zoom-in"
                aria-label={`Open gallery for ${selectedArtwork.title}`}
              >
                <img
                  src={selectedArtwork.imageUrls[0]}
                  alt={selectedArtwork.title}
                  className="mx-auto max-h-96 w-full object-contain"
                />
              </button>
            </div>

            {selectedArtwork.imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {selectedArtwork.imageUrls.map((image, index) => (
                  <button
                    key={`${selectedArtwork.id}-${index}`}
                    type="button"
                    onClick={() => {
                      setActiveMediaIndex(index)
                      setSelectedArtwork(selectedArtwork)
                    }}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-control border-2 bg-neutral-900 ${
                      index === activeMediaIndex ? 'border-primary' : 'border-transparent opacity-75'
                    }`}
                    aria-label={`Preview image ${index + 1}`}
                  >
                    <img src={image} alt={`${selectedArtwork.title} preview ${index + 1}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

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

      {selectedArtwork && (
        <MediaLightbox
          isOpen={Boolean(selectedArtwork)}
          images={selectedImageUrls}
          title={selectedArtwork.title}
          description={`${selectedArtwork.category} • Created by ${profile.displayName}`}
          activeIndex={activeMediaIndex}
          onClose={() => {
            setSelectedArtwork(null)
            setActiveMediaIndex(0)
          }}
          onIndexChange={setActiveMediaIndex}
        />
      )}
    </div>
  )
}
