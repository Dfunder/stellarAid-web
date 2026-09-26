import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink, Spinner } from '@/components/ui'
import { http } from '@/services'
import { formatDate } from '@/lib'
import { orderKeys } from './queryKeys'

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

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
}

const STATUS_COLORS: Record<Order['status'], string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-blue/10 text-blue',
  completed: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  refunded: 'bg-muted text-muted',
}

export default function PurchasesPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | Order['status']>('all')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: orderKeys.list({ status: statusFilter, page, pageSize }),
    queryFn: async (): Promise<{ orders: Order[]; total: number }> => {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.set('status', statusFilter)
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())
      const response = await http.get<{ orders: Order[]; total: number }>(`/orders/purchases?${params}`)
      return response
    },
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
          <label className="text-caption-sm text-muted">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className="rounded-control border border-line bg-background px-3 py-1.5 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

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
            <a href="/artists/elena_art">Explore artists</a>
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
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption-sm font-medium ${STATUS_COLORS[order.status]}`}>
                          {STATUS_LABELS[order.status]}
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
                            <a href={`/artists/${order.sellerUsername}`}>Contact</a>
                          </Button>
                          {order.status === 'completed' && (
                            <Button size="sm" variant="ghost" asChild>
                              <a href={`/commissions/new?seller=${order.sellerUsername}`}>Reorder</a>
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
                Some orders failed. <a href="/support" className="underline">Contact support</a> for assistance.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}