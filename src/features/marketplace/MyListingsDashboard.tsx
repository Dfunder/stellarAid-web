import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, ExplorerLink, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { useAuth } from '@/features/auth'
import { formatDate } from '@/lib'

interface Listing {
  id: string
  title: string
  thumbnail?: string
  status: 'draft' | 'active' | 'sold' | 'unpublished'
  price: string
  asset: string
  views: number
  likes: number
  createdAt: string
  updatedAt: string
}

const STATUS_LABELS: Record<Listing['status'], string> = {
  draft: 'Draft',
  active: 'Active',
  sold: 'Sold',
  unpublished: 'Unpublished',
}

const STATUS_COLORS: Record<Listing['status'], string> = {
  draft: 'bg-muted text-muted',
  active: 'bg-success/10 text-success',
  sold: 'bg-primary/10 text-primary',
  unpublished: 'bg-warning/10 text-warning',
}

export default function MyListingsDashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<'all' | Listing['status']>('all')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [pendingAction, setPendingAction] = useState<{ type: 'unpublish' | 'delete'; listing: Listing } | null>(null)

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: ['myListings', user?.id, statusFilter],
    queryFn: async (): Promise<Listing[]> => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const response = await http.get<{ listings: Listing[] }>(`/listings/mine?${params}`)
      return response.listings
    },
    enabled: !!user,
  })

  const listings = data ?? []
  const allSelected = listings.length > 0 && listings.every((l) => selectedIds.has(l.id))

  const unpublishMutation = useMutation({
    mutationFn: (listingId: string) => http.patch(`/listings/${listingId}`, { status: 'unpublished' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      setSelectedIds(new Set())
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (listingId: string) => http.delete(`/listings/${listingId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myListings'] })
      setSelectedIds(new Set())
    },
  })

  const handleToggleSelect = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    setSelectedIds(newSet)
  }

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(listings.map((l) => l.id)))
    }
  }

  const handleBulkUnpublish = () => {
    if (selectedIds.size === 0) return
    setPendingAction({ type: 'unpublish', listing: { id: 'bulk', title: `${selectedIds.size} listings` } as Listing })
  }

  const handleConfirmAction = async () => {
    if (!pendingAction) return
    try {
      if (pendingAction.type === 'unpublish') {
        if (pendingAction.listing.id === 'bulk') {
          await Promise.all(Array.from(selectedIds).map((id) => unpublishMutation.mutateAsync(id)))
        } else {
          await unpublishMutation.mutateAsync(pendingAction.listing.id)
        }
      } else if (pendingAction.type === 'delete') {
        await deleteMutation.mutateAsync(pendingAction.listing.id)
      }
      setPendingAction(null)
    } catch {
      // Error handled by mutation
    }
  }

  if (isPending) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-3 py-8 text-muted">
          <Spinner label="Loading listings" className="h-5 w-5" />
          <span className="text-caption">Loading your listings…</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-12">
        <div className="flex flex-wrap items-center gap-3 rounded-control bg-danger/10 p-4">
          <p role="alert" className="text-caption text-danger">
            {error instanceof Error ? error.message : 'Failed to load listings'}
          </p>
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-h2">My Listings</h1>
          <p className="mt-1 text-caption text-muted">
            Manage your artwork listings and track performance.
          </p>
        </div>
        {listings.length === 0 && statusFilter === 'all' && (
          <Button asChild>
            <a href="/artist/listings/new">Create Your First Listing</a>
          </Button>
        )}
      </div>

      <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
        <div className="p-4 border-b border-line bg-surface-muted flex flex-wrap items-center gap-2">
          <label className="text-caption-sm text-muted">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setSelectedIds(new Set()) }}
            className="rounded-control border border-line bg-background px-3 py-1.5 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All statuses</option>
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="unpublished">Unpublished</option>
          </select>
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <path d="M9 9h6v6H9z" />
            </svg>
            {statusFilter === 'all' ? (
              <p className="text-caption">No listings yet. Create your first artwork listing!</p>
            ) : (
              <p className="text-caption">No listings with status "{STATUS_LABELS[statusFilter]}".</p>
            )}
            {statusFilter === 'all' && (
              <Button asChild className="mt-4">
                <a href="/artist/listings/new">Create Listing</a>
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted w-10">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-primary"
                        checked={allSelected}
                        onChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Artwork</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Status</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Price</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Views</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Likes</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Date</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted w-40">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-b border-line/50 hover:bg-surface-muted/50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={selectedIds.has(listing.id)}
                          onChange={() => handleToggleSelect(listing.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {listing.thumbnail && (
                            <img src={listing.thumbnail} alt="" className="h-10 w-10 rounded-card object-cover" />
                          )}
                          <div>
                            <p className="text-caption font-medium text-foreground truncate max-w-xs">{listing.title}</p>
                            <p className="text-caption-xs text-muted">ID: {listing.id.slice(0, 8)}…</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption-sm font-medium ${STATUS_COLORS[listing.status]}`}>
                          {STATUS_LABELS[listing.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-caption-sm font-mono text-foreground">
                        {listing.price} {listing.asset}
                      </td>
                      <td className="px-4 py-3 text-caption-sm text-muted">{listing.views.toLocaleString()}</td>
                      <td className="px-4 py-3 text-caption-sm text-muted">{listing.likes.toLocaleString()}</td>
                      <td className="px-4 py-3 text-caption-sm text-muted">{formatDate(listing.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {listing.status === 'draft' && (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={`/artist/listings/${listing.id}/edit`}>Edit</a>
                            </Button>
                          )}
                          {listing.status === 'active' && (
                            <>
                              <Button size="sm" variant="ghost" asChild>
                                <a href={`/artworks/${listing.id}`}>View</a>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setPendingAction({ type: 'unpublish', listing })}
                              >
                                Unpublish
                              </Button>
                            </>
                          )}
                          {(listing.status === 'unpublished' || listing.status === 'draft') && (
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setPendingAction({ type: 'delete', listing })}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedIds.size > 0 && (
              <div className="p-4 border-t border-line bg-surface-muted flex flex-wrap items-center justify-between gap-4">
                <span className="text-caption-sm text-muted">
                  {selectedIds.size} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={handleBulkUnpublish} disabled={unpublishMutation.isPending}>
                    Unpublish Selected
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}