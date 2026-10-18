import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink, Spinner } from '@/components/ui'
import { http } from '@/services'
import { buildCsv, formatDate, isNegativeAmount } from '@/lib'
import { transactionKeys } from './queryKeys'
import type { Transaction } from './types'

const TRANSACTION_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'payout', label: 'Payout' },
  { value: 'fee', label: 'Fee' },
  { value: 'escrow', label: 'Escrow' },
] as const

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
] as const

/** Fields the history table and CSV export actually read. */
type TransactionRow = Pick<
  Transaction,
  'id' | 'createdAt' | 'type' | 'amount' | 'asset' | 'status' | 'txHash'
>

export default function TransactionHistoryPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | Transaction['type']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | Transaction['status']>('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 20

  /** Sends unambiguous day boundaries instead of bare `YYYY-MM-DD` (#838). */
  const toIsoBoundary = (value: string, endOfDay: boolean): string | undefined => {
    if (!value) return undefined
    const date = new Date(`${value}T00:00:00`)
    if (Number.isNaN(date.getTime())) return undefined
    if (endOfDay) date.setDate(date.getDate() + 1)
    return date.toISOString()
  }

  const { data, isPending, isError, error, refetch } = useQuery({
    queryKey: transactionKeys.list({ typeFilter, statusFilter, dateFrom, dateTo, page }),
    queryFn: async (): Promise<{ transactions: Transaction[]; total: number }> => {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (statusFilter !== 'all') params.set('status', statusFilter)
      const from = toIsoBoundary(dateFrom, false)
      const to = toIsoBoundary(dateTo, true)
      if (from) params.set('dateFrom', from)
      if (to) params.set('dateTo', to)
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())
      const response = await http.get<{ transactions: Transaction[]; total: number }>(`/transactions?${params}`)
      // Older backends omit `total`; fall back to the page length so the control
      // degrades to one page rather than rendering a broken pager.
      return { transactions: response.transactions, total: response.total ?? response.transactions.length }
    },
    // Narrow each row to the rendered fields so unrelated response additions do
    // not churn row identity and re-render the whole table (#855).
    select: (data): { transactions: TransactionRow[]; total: number } => ({
      total: data.total,
      transactions: data.transactions.map((tx) => ({
        id: tx.id,
        createdAt: tx.createdAt,
        type: tx.type,
        amount: tx.amount,
        asset: tx.asset,
        status: tx.status,
        txHash: tx.txHash,
      })),
    }),
  })

  // #838 — the no-op `useMemo` that returned its own dependency is gone: the
  // filters are applied server-side by the query above.
  const transactions = data?.transactions ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = typeFilter !== 'all' || statusFilter !== 'all' || !!dateFrom || !!dateTo

  const exportCsv = () => {
    const headers = ['Date', 'Type', 'Amount', 'Asset', 'Status', 'Transaction Hash']
    const rows = transactions.map((tx) => [
      formatDate(tx.createdAt),
      tx.type,
      tx.amount,
      tx.asset,
      tx.status,
      tx.txHash,
    ])
    const csv = buildCsv([headers, ...rows])
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    try {
      link.href = url
      // Filesystem-safe filename: `transactions-YYYY-MM-DD.csv`.
      link.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
    } finally {
      link.remove()
      URL.revokeObjectURL(url)
    }
  }

  if (isPending) {
    return (
      <div className="container py-12">
        <div className="flex items-center gap-3 py-8 text-muted">
          <Spinner label="Loading transactions" className="h-5 w-5" />
          <span className="text-caption">Loading transaction history…</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container py-12">
        <div className="flex flex-wrap items-center gap-3 rounded-control bg-danger/10 p-4">
          <p role="alert" className="text-caption text-danger">
            {error instanceof Error ? error.message : 'Failed to load transactions'}
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
          <h1 className="text-h2">Transaction History</h1>
          <p className="mt-1 text-caption text-muted">
            Unified view of all on-chain and platform activity.
          </p>
        </div>
        <Button variant="secondary" onClick={exportCsv} disabled={transactions.length === 0}>
          Export CSV
        </Button>
      </div>

      <div className="rounded-card border border-line bg-surface shadow-card overflow-hidden">
        <div className="p-4 border-b border-line bg-surface-muted">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-caption-sm text-muted">Type:</label>
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1) }}
                className="rounded-control border border-line bg-background px-3 py-1.5 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {TRANSACTION_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-caption-sm text-muted">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1) }}
                className="rounded-control border border-line bg-background px-3 py-1.5 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-caption-sm text-muted">From:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                className="rounded-control border border-line bg-background px-3 py-1.5 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-caption-sm text-muted">To:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                className="rounded-control border border-line bg-background px-3 py-1.5 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>
            {(typeFilter !== 'all' || statusFilter !== 'all' || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setDateFrom(''); setDateTo(''); setPage(1); }}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-muted">
            <svg className="h-12 w-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {/* #838 — distinguish "nothing yet" from "nothing matched". */}
            <p className="text-caption">
              {hasFilters
                ? 'No transactions match these filters.'
                : 'No transactions yet.'}
            </p>
            {hasFilters && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setTypeFilter('all'); setStatusFilter('all'); setDateFrom(''); setDateTo(''); setPage(1); }}
              >
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" role="table">
              <thead>
                <tr className="border-b border-line bg-surface-muted">
                  <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Date</th>
                  <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Type</th>
                  <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Amount</th>
                  <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Asset</th>
                  <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Status</th>
                  <th className="px-4 py-3 text-caption-sm font-semibold text-muted">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-line/50 hover:bg-surface-muted/50">
                    <td className="px-4 py-3 text-caption-sm text-foreground">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-caption-sm text-foreground">
                      <span className="capitalize">{tx.type}</span>
                    </td>
                    <td className="px-4 py-3 text-caption-sm font-mono text-foreground">
                      {isNegativeAmount(tx.amount) ? '' : '+'}{tx.amount}
                    </td>
                    <td className="px-4 py-3 text-caption-sm text-foreground">{tx.asset}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-caption-sm font-medium ${
                          tx.status === 'completed' ? 'bg-success/10 text-success' :
                          tx.status === 'pending' ? 'bg-warning/10 text-warning' :
                          tx.status === 'failed' ? 'bg-danger/10 text-danger' :
                          'bg-muted text-muted'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-caption-sm">
                      <ExplorerLink value={tx.txHash} type="tx" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && transactions.length > 0 && (
          <nav
            aria-label="Transaction history pagination"
            className="mt-4 flex flex-wrap items-center justify-between gap-2"
          >
            <p className="text-caption-sm text-muted">
              Page {Math.min(page, totalPages)} of {totalPages} — {total} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </nav>
        )}
      </div>
    </div>
  )
}