import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { Button, LoadingRegion, Skeleton, SkeletonGrid, SkeletonText } from '@/components/ui'
import { http } from '@/services'
import { formatDate } from '@/lib'
import type { ArtworkCard, CategorySummary } from '@/types'

export interface CategoryLandingPageProps {
  /** Category slug from the route (`category/:slug`); optional for reuse outside the router. */
  slug?: string
}

export default function CategoryLandingPage({ slug: slugProp }: CategoryLandingPageProps) {
  // The route (`category/:slug`) never passed the prop this page declared,
  // so `slug` was `undefined`, both queries stayed disabled, and the page
  // spun forever (#782). Read the param ourselves.
  const params = useParams()
  const slug = slugProp ?? params.slug
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('all')

  const { data: category, isPending: categoryPending, isError: categoryError } = useQuery({
    queryKey: ['category', slug],
    queryFn: async (): Promise<CategorySummary> => {
      const response = await http.get<{ category: CategorySummary }>(`/categories/${slug}`)
      return response.category
    },
    enabled: !!slug,
  })

  const { data: artworks, isPending: artworksPending } = useQuery({
    queryKey: ['categoryArtworks', slug, subCategoryFilter],
    queryFn: async (): Promise<ArtworkCard[]> => {
      const params = new URLSearchParams()
      if (subCategoryFilter !== 'all') params.set('subCategory', subCategoryFilter)
      const response = await http.get<{ artworks: ArtworkCard[] }>(`/categories/${slug}/artworks?${params}`)
      return response.artworks
    },
    enabled: !!slug,
  })

  if (categoryPending) {
    return (
      <div className="container py-12">
        <LoadingRegion label="Loading category" className="max-w-4xl mx-auto">
          <SkeletonText lines={2} className="mb-8" />
          <SkeletonText lines={1} className="mb-8" />
          <SkeletonGrid columns={3} rows={2} />
        </LoadingRegion>
      </div>
    )
  }

  if (categoryError || !category) {
    return (
      <div className="container py-24 text-center">
        <h1 className="text-h2">Category not found</h1>
        <p className="mt-2 text-caption text-muted">The category "{slug}" does not exist.</p>
        <Button className="mt-6" asChild>
          <Link to="/">Browse all categories</Link>
        </Button>
      </div>
    )
  }

  const renderCard = (artwork: ArtworkCard) => (
    <article className="group">
      <Link to={`/checkout/${artwork.id}`} className="block">
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
        <h3 className="mt-3 text-caption font-medium text-foreground line-clamp-1">{artwork.title}</h3>
        <p className="text-caption-xs text-muted">{artwork.sellerName}</p>
        <p className="text-caption-sm font-mono text-foreground">{artwork.price} {artwork.asset}</p>
      </Link>
    </article>
  )

  const renderSkeleton = () => (
    <article>
      <Skeleton aspectRatio={1} radius="card" />
      <SkeletonText lines={3} className="mt-3" />
    </article>
  )

  return (
    <div className="container py-8">
      <header className="mb-8">
        {category.image && (
          <div className="relative aspect-video rounded-card overflow-hidden mb-6">
            <img src={category.image} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
        )}
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="rounded-control bg-primary/10 px-2 py-0.5 text-caption-sm font-semibold text-primary">Category</span>
            <span className="rounded-control bg-surface-muted px-2 py-0.5 text-caption-sm text-muted">
              {category.artworkCount} artworks · {category.artistCount} artists
            </span>
          </div>
          <h1 className="text-h2">{category.name}</h1>
          <p className="mt-2 max-w-2xl text-caption text-muted">{category.description}</p>
        </div>
      </header>

      {category.subCategories.length > 0 && (
        <nav className="mb-6" aria-label="Subcategories">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubCategoryFilter('all')}
              className={`rounded-full px-3 py-1.5 text-caption-sm font-medium transition-colors ${
                subCategoryFilter === 'all'
                  ? 'bg-primary text-primary-contrast'
                  : 'bg-surface-muted text-foreground hover:bg-surface border border-line'
              }`}
            >
              All
            </button>
            {category.subCategories.map((sub) => (
              <button
                key={sub.slug}
                type="button"
                onClick={() => setSubCategoryFilter(sub.slug)}
                className={`rounded-full px-3 py-1.5 text-caption-sm font-medium transition-colors ${
                  subCategoryFilter === sub.slug
                    ? 'bg-primary text-primary-contrast'
                    : 'bg-surface-muted text-foreground hover:bg-surface border border-line'
                }`}
              >
                {sub.name} ({sub.count})
              </button>
            ))}
          </div>
        </nav>
      )}

      <LoadingRegion label="Loading artworks…">
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          role="list"
          aria-busy={artworksPending || undefined}
        >
          {artworksPending ? (
            Array.from({ length: 8 }, (_, i) => <article key={i} role="listitem">{renderSkeleton()}</article>)
          ) : artworks?.length === 0 ? (
            <div className="col-span-full flex flex-col items-center gap-3 py-12 text-muted">
              <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
              <p className="text-caption">No artworks in this category{subCategoryFilter !== 'all' ? ' with this subcategory' : ''}.</p>
            </div>
          ) : (
            artworks?.map((artwork) => (
              <article key={artwork.id} role="listitem">{renderCard(artwork)}</article>
            ))
          )}
        </div>
      </LoadingRegion>
    </div>
  )
}