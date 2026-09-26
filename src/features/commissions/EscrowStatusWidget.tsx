import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { formatDate } from '@/lib'

type EscrowStatus = 'funded' | 'in_progress' | 'delivered' | 'released' | 'refunded' | 'disputed'

interface EscrowData {
  id: string
  status: EscrowStatus
  artworkTitle: string
  buyer: string
  seller: string
  amount: string
  asset: string
  txHash: string
  milestones: Milestone[]
  fundedAt: string
  updatedAt: string
  canRelease: boolean
  canRefund: boolean
}

interface Milestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'disputed'
  dueDate: string
  completedAt: string | null
}

const STATUS_LABELS: Record<EscrowStatus, string> = {
  funded: 'Funded',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  released: 'Released',
  refunded: 'Refunded',
  disputed: 'Disputed',
}

const STATUS_COLORS: Record<EscrowStatus, string> = {
  funded: 'bg-primary/10 text-primary',
  in_progress: 'bg-blue/10 text-blue',
  delivered: 'bg-warning/10 text-warning',
  released: 'bg-success/10 text-success',
  refunded: 'bg-muted text-muted',
  disputed: 'bg-danger/10 text-danger',
}

const STATUS_ORDER: EscrowStatus[] = ['funded', 'in_progress', 'delivered', 'released', 'refunded', 'disputed']

interface EscrowStatusWidgetProps {
  escrowId: string
  onRelease?: () => void
  onRefundRequest?: () => void
  onDispute?: () => void
}

export default function EscrowStatusWidget({ escrowId, onRelease, onRefundRequest, onDispute }: EscrowStatusWidgetProps) {
  const { data: escrow, isPending, isError, error, refetch } = useQuery({
    queryKey: ['escrow', escrowId],
    queryFn: async (): Promise<EscrowData> => (await http.get<{ escrow: EscrowData }>(`/escrows/${escrowId}`)).escrow,
    enabled: !!escrowId,
  })

  const currentStatus = escrow?.status ?? 'funded'
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const [showReleaseConfirm, setShowReleaseConfirm] = useState(false)
  const [showRefundConfirm, setShowRefundConfirm] = useState(false)

  if (isPending) {
    return (
      <div className="rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3 py-8 text-muted">
          <Spinner label="Loading escrow status" className="h-5 w-5" />
          <span className="text-caption">Loading escrow status…</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-card border border-line bg-surface p-6 shadow-card">
        <div className="flex flex-wrap items-center gap-3 rounded-control bg-danger/10 p-4">
          <p role="alert" className="text-caption text-danger">
            {error instanceof Error ? error.message : 'Failed to load escrow'}
          </p>
          <Button size="sm" variant="secondary" onClick={() => void refetch()}>
            Try again
          </Button>
        </div>
      </div>
    )
  }

  if (!escrow) return null

  const handleRelease = async () => {
    if (!confirm('Releasing funds will transfer the escrowed amount to the seller. This action cannot be undone. Continue?')) return
    try {
      await http.post(`/escrows/${escrowId}/release`)
      void refetch()
      onRelease?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Release failed')
    }
  }

  const handleRefundRequest = async () => {
    if (!confirm('Requesting a refund will start a dispute process. The seller will be notified. Continue?')) return
    try {
      await http.post(`/escrows/${escrowId}/refund-request`)
      void refetch()
      onRefundRequest?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Refund request failed')
    }
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-h3">Escrow Status</h2>
          <p className="mt-1 text-caption text-muted">{escrow.artworkTitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-caption-sm font-semibold ${STATUS_COLORS[currentStatus]}`}
          >
            {STATUS_LABELS[currentStatus]}
          </span>
          <ExplorerLink value={escrow.txHash} type="tx" className="ml-2" />
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {STATUS_ORDER.map((status, index) => (
            <div key={status} className="flex flex-col items-center shrink-0">
              <div
                className={`relative flex h-8 w-8 items-center justify-center rounded-full text-caption-sm font-medium transition-colors ${
                  index < currentIndex
                    ? 'bg-primary text-primary-contrast'
                    : index === currentIndex
                    ? 'bg-primary/10 text-primary ring-2 ring-primary'
                    : 'bg-line text-muted'
                }`}
              >
                {index < currentIndex ? (
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : index === currentIndex ? (
                  <span className="relative z-10">{index + 1}</span>
                ) : (
                  <span className="relative z-10">{index + 1}</span>
                )}
              </div>
              <span className={`mt-1.5 text-caption-xs text-center whitespace-nowrap ${index <= currentIndex ? 'text-foreground' : 'text-muted'}`}>
                {STATUS_LABELS[status].replace(' ', '\n')}
              </span>
              {index < STATUS_ORDER.length - 1 && (
                <div
                  className={`absolute top-3 left-full h-0.5 w-16 -ml-8 ${
                    index < currentIndex ? 'bg-primary' : 'bg-line'
                  }`}
                  aria-hidden="true"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {escrow.milestones.length > 0 && (
        <div className="mt-6 border-t border-line pt-6">
          <h3 className="text-caption-sm font-semibold text-foreground">Milestones</h3>
          <ul className="mt-3 flex flex-col gap-3">
            {escrow.milestones.map((milestone) => (
              <li key={milestone.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-card border border-line bg-surface-muted">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-caption-xs font-medium ${
                        milestone.status === 'completed' ? 'bg-success/10 text-success' :
                        milestone.status === 'disputed' ? 'bg-danger/10 text-danger' :
                        'bg-line text-muted'
                      }`}
                    >
                      {milestone.status === 'completed' ? (
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : milestone.status === 'disputed' ? (
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                      ) : (
                        <span>{milestone.status === 'pending' ? '○' : ''}</span>
                      )}
                    </span>
                    <span className="text-caption font-medium text-foreground">{milestone.title}</span>
                    {milestone.status === 'completed' && (
                      <span className="rounded-full bg-success/10 px-1.5 py-0.5 text-caption-xs font-semibold text-success">Done</span>
                    )}
                    {milestone.status === 'disputed' && (
                      <span className="rounded-full bg-danger/10 px-1.5 py-0.5 text-caption-xs font-semibold text-danger">Disputed</span>
                    )}
                  </div>
                  <p className="text-caption-sm text-muted ml-7">{milestone.description}</p>
                  <p className="text-caption-xs text-muted ml-7">
                    Due: {formatDate(milestone.dueDate)}
                    {milestone.completedAt && ` • Completed: ${formatDate(milestone.completedAt)}`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 border-t border-line pt-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <span className="text-caption-sm text-muted">Amount</span>
            <span className="text-body font-mono text-foreground">{escrow.amount} {escrow.asset}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-caption-sm text-muted">Buyer</span>
            <span className="text-caption font-mono text-foreground">{escrow.buyer.slice(0, 10)}…{escrow.buyer.slice(-8)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-caption-sm text-muted">Seller</span>
            <span className="text-caption font-mono text-foreground">{escrow.seller.slice(0, 10)}…{escrow.seller.slice(-8)}</span>
          </div>
        </div>
      </div>

      {(escrow.canRelease || escrow.canRefund) && (
        <div className="mt-6 border-t border-line pt-6 flex flex-wrap items-center gap-3">
          {escrow.canRelease && (
            <Button variant="primary" onClick={handleRelease} disabled={currentStatus !== 'delivered'}>
              Release Funds
            </Button>
          )}
          {escrow.canRefund && (
            <Button variant="danger" onClick={handleRefundRequest} disabled={currentStatus === 'released' || currentStatus === 'refunded'}>
              Request Refund
            </Button>
          )}
          <Button variant="ghost" onClick={onDispute}>
            Open Dispute
          </Button>
        </div>
      )}

      <Modal
        isOpen={showReleaseConfirm}
        onClose={() => setShowReleaseConfirm(false)}
        title="Release escrow funds?"
        description="This will transfer the escrowed amount to the seller. This action cannot be undone."
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowReleaseConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => { handleRelease(); setShowReleaseConfirm(false); }}>
            Confirm Release
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showRefundConfirm}
        onClose={() => setShowRefundConfirm(false)}
        title="Request refund?"
        description="This will initiate a dispute process. The seller will be notified and has the opportunity to respond."
      >
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowRefundConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => { handleRefundRequest(); setShowRefundConfirm(false); }}>
            Confirm Refund Request
          </Button>
        </div>
      </Modal>
    </div>
  )
}