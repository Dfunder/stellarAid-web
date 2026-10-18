import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink, Spinner, Select } from '@/components/ui'
import { http } from '@/services'
import { formatDate, statusMeta } from '@/lib'
import { orderKeys } from './queryKeys'
import type { PurchaseOrder } from '@/types'
import { Link } from 'react-router-dom'

interface Order {
  id: string
  artworkTitle: string
  artworkThumbnail?: string
  sellerName: string
  sellerUsername: string
  amount: string
  asset: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  txHash: string | null
  createdAt: string
  deliverables?: Deliverable[]
  failureReason?: string
}

interface Deliverable {
  id: string
  name: string
  url: string
  expiresAt: string
}


export default function PurchasesPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | PurchaseOrder['status']>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: orderKeys.list({ status: statusFilter, page, pageSize }),
    queryFn: async (): Promise<{ orders: PurchaseOrder[]; total: number }> => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())
      const response = await http.get<{ orders: PurchaseOrder[]; total: number }>(`/orders/purchases?${params}`)
      return response
    },
    // Incrementing the page or changing the filter keeps the current rows visible
    // while the next page loads, instead of collapsing to a spinner (#852).
    placeholderData: keepPreviousData,
  })

  const orders = data?.orders ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / pageSize)

  if (isPending) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-3 py-8 text-muted">
          <Spinner label="Loading purchases" className="h-5 w-5" />
          <span className="text-caption">Loading your purchases…</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-12">
        <div className="flex flex-wrap items-center gap-3 rounded-control bg-danger/10 p-4">
          <p role="alert" className="text-caption text-danger">
            {error instanceof Error ? error.message : 'Failed to load purchases'}
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
          <h1 className="text-h2">My Purchases</h1>
          <p className="mt-1 text-caption text-muted">
            Track your orders and access deliverables.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className="py-1.5 text-caption-sm"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>
      </div>

      {/* Stale-but-visible rows stay mounted; this only signals a background
          refetch so a page change does not blank the table (#852). */}
      {isFetching && !isPending && (
        <p role="status" className="mb-3 text-caption-sm text-muted">
          Updating…
        </p>
      )}

      {orders.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-12 shadow-card text-center">
          <svg className="h-16 w-16 mx-auto text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <h2 className="mt-4 text-h3">No purchases yet</h2>
          <p className="mt-2 text-caption text-muted max-w-md mx-auto">
            When you buy artwork or commission creators, your orders will appear here.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/artists/elena_art">Explore artists</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left" role="table">
                <thead>
                  <tr className="border-b border-line bg-surface-muted">
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Artwork</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Date</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Amount</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Status</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Transaction</th>
                    <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-line/50 hover:bg-surface-muted/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {order.artworkThumbnail && (
                            <img
                              src={order.artworkThumbnail}
                              alt=""
                              className="h-12 w-12 rounded-card object-cover"
                              loading="lazy"
                            />
                          )}
                          <div>
                            <p className="text-caption font-medium text-foreground">{order.artworkTitle}</p>
                            <p className="text-caption-sm text-muted">by {order.sellerName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-caption-sm text-foreground">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-4 text-caption-sm font-mono text-foreground">
                        {order.amount} {order.asset}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption-sm font-medium ${statusMeta(order.status).className}`}>
                          {statusMeta(order.status).label}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-caption-sm">
                        {order.txHash ? (
                          <ExplorerLink value={order.txHash} type="tx" />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          {order.status === 'completed' && order.deliverables?.length > 0 && (
                            <Button size="sm" variant="secondary" asChild>
                              <a href={order.deliverables[0].url} target="_blank" rel="noreferrer">
                                Download
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" asChild>
                            <Link to={`/artists/${order.sellerUsername}`}>Contact</Link>
                          </Button>
                          {order.status === 'completed' && (
                            <Button size="sm" variant="ghost" asChild>
                              <Link to={`/artists/${order.sellerUsername}`}>Reorder</Link>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-line flex items-center justify-between">
                <p className="text-caption-sm text-muted">
                  Page {page} of {totalPages} — {total} total
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>

          {orders.some((o) => o.status === 'failed') && (
            <div className="mt-4 rounded-control bg-danger/10 p-4">
              <p className="text-caption text-danger">
                Some orders failed. Contact support for assistance.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}