import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, ExplorerLink, Modal, Spinner } from '@/components/ui'
import { http } from '@/services'
import { formatDate } from '@/lib'
import {
  type EscrowStatus,
  ESCROW_STATUS_LABELS as STATUS_LABELS,
  ESCROW_STATUS_CLASSES as STATUS_COLORS,
} from '@/lib'

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
  /** Recorded cancellation reason, present once the commission is cancelled. */
  cancellationReason?: string | null
}

interface Milestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'disputed'
  dueDate: string
  completedAt: string | null
}

const STATUS_ORDER: EscrowStatus[] = ['funded', 'in_progress', 'delivered', 'released', 'refunded', 'disputed']

// ---------------------------------------------------------------------------
// Commission status timeline (#736)
// ---------------------------------------------------------------------------

export type TimelineStepState = 'completed' | 'current' | 'pending'

export interface TimelineStep {
  key: string
  label: string
  state: TimelineStepState
  /** When the step happened, if it has happened. */
  at?: string | null
  /** Who performed the step. */
  actor?: string | null
  detail?: string | null
}

export interface CommissionStatusTimelineProps {
  steps: TimelineStep[]
  /** `compact` drops timestamps and actors for use inside cards and lists. */
  variant?: 'full' | 'compact'
  className?: string
}

/**
 * Vertical stepper for a commission's progress.
 *
 * Anything the caller marks as neither completed nor current — including steps
 * the backend has not reached yet — renders as pending, so an unknown future
 * step never looks finished. The current step carries `aria-current="step"` and
 * is announced in a live region for screen reader users.
 */
export function CommissionStatusTimeline({
  steps,
  variant = 'full',
  className = '',
}: CommissionStatusTimelineProps) {
  const current = steps.find((s) => s.state === 'current')

  if (steps.length === 0) return null

  return (
    <div className={className}>
      <ol className="flex flex-col">
        {steps.map((step, index) => {
          // Defensive: treat any unrecognised state as pending.
          const state: TimelineStepState =
            step.state === 'completed' || step.state === 'current' ? step.state : 'pending'
          const isLast = index === steps.length - 1

          return (
            <li key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-caption-xs font-semibold ${
                    state === 'completed'
                      ? 'bg-success text-success-contrast'
                      : state === 'current'
                      ? 'bg-primary text-primary-contrast ring-2 ring-primary'
                      : 'bg-line text-muted'
                  }`}
                >
                  {state === 'completed' ? (
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                {!isLast && (
                  <span
                    className={`w-0.5 flex-1 ${state === 'completed' ? 'bg-success/40' : 'bg-line'}`}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className={`pb-4 ${isLast ? 'pb-0' : ''}`}>
                <p className={`text-caption font-medium ${state === 'pending' ? 'text-muted' : 'text-foreground'}`}>
                  {step.label}
                </p>
                {step.detail && <p className="mt-0.5 text-caption-sm text-muted">{step.detail}</p>}
                {variant === 'full' && (step.at || step.actor) && (
                  <p className="mt-0.5 text-caption-xs text-muted">
                    {step.at ? formatDate(step.at) : null}
                    {step.at && step.actor ? ' • ' : null}
                    {step.actor ? `by ${step.actor}` : null}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>

      {/* Announce progress without stealing focus. */}
      <p className="sr-only" role="status" aria-live="polite">
        {current ? `Step ${steps.indexOf(current) + 1} of ${steps.length}: ${current.label}` : 'No active step'}
      </p>
    </div>
  )
}

/**
 * Derive timeline steps from an escrow record.
 *
 * Milestone escrows get one step per milestone; direct escrows use the flat
 * lifecycle. A cancelled escrow appends the cancellation step carrying the
 * recorded reason, so the reason is visible in the timeline to both parties.
 */
export function buildEscrowTimeline(
  escrow: Pick<EscrowData, 'status' | 'fundedAt' | 'updatedAt' | 'milestones' | 'buyer' | 'seller' | 'cancellationReason'>,
  viewer?: 'buyer' | 'seller'
): TimelineStep[] {
  const isMilestone = escrow.milestones.length > 0
  const cancelled = escrow.status === 'cancelled'
  const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`

  const steps: TimelineStep[] = isMilestone
    ? [
        { key: 'funded', label: 'Escrow funded', state: 'completed', at: escrow.fundedAt, actor: short(escrow.buyer) },
        ...escrow.milestones.map((m) => ({
          key: `milestone-${m.id}`,
          label: m.title,
          state: (m.status === 'completed' ? 'completed' : m.status === 'disputed' ? 'current' : 'pending') as TimelineStepState,
          at: m.completedAt,
          actor: m.completedAt ? short(escrow.seller) : null,
          detail: m.description,
        })),
      ]
    : [
        { key: 'funded', label: 'Escrow funded', state: 'completed', at: escrow.fundedAt, actor: short(escrow.buyer) },
        {
          key: 'delivered',
          label: 'Work delivered',
          state: escrow.status === 'funded' || escrow.status === 'in_progress' ? 'pending' : 'completed',
          at: escrow.status === 'funded' || escrow.status === 'in_progress' ? null : escrow.updatedAt,
          actor: short(escrow.seller),
        },
        {
          key: 'released',
          label: 'Funds released',
          state: escrow.status === 'released' ? 'completed' : escrow.status === 'delivered' ? 'current' : 'pending',
          at: escrow.status === 'released' ? escrow.updatedAt : null,
        },
      ]

  if (cancelled) {
    steps.push({
      key: 'cancelled',
      label: 'Commission cancelled',
      state: 'current',
      at: escrow.updatedAt,
      actor: viewer ? short(viewer === 'buyer' ? escrow.buyer : escrow.seller) : null,
      detail: escrow.cancellationReason ?? 'No reason recorded',
    })
  }

  return steps
}

// ---------------------------------------------------------------------------
// Commission cancellation (#737)
// ---------------------------------------------------------------------------

/** Reasons offered per role; the backend records whichever is submitted. */
export const CANCEL_REASONS: Record<
  'buyer' | 'seller',
  ReadonlyArray<{ value: string; label: string }>
> = {
  buyer: [
    { value: 'scope_changed', label: 'Scope of the brief changed' },
    { value: 'artist_unresponsive', label: 'Artist unresponsive' },
    { value: 'no_longer_needed', label: 'No longer needed' },
  ],
  seller: [
    { value: 'unable_to_deliver', label: 'Unable to deliver' },
    { value: 'scope_changed', label: 'Scope of the brief changed' },
    { value: 'other', label: 'Other' },
  ],
}

/** States where the commission is settled and can no longer be cancelled. */
const CANCEL_BLOCKED_STATUSES: EscrowStatus[] = ['released', 'refunded', 'cancelled']

export function canCancelCommission(status: EscrowStatus): boolean {
  return !CANCEL_BLOCKED_STATUSES.includes(status)
}

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
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelRole, setCancelRole] = useState<'buyer' | 'seller'>('buyer')
  const [cancelReason, setCancelReason] = useState<string>('')
  const [cancelling, setCancelling] = useState(false)

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

  const timeline = buildEscrowTimeline(escrow)
  // A cancelled commission is terminal: no further deliverable or money actions.
  const isLocked = escrow.status === 'cancelled'
  const cancelAllowed = canCancelCommission(escrow.status)

  const handleCancel = async () => {
    if (!cancelReason) return
    setCancelling(true)
    try {
      await http.post(`/escrows/${escrowId}/cancel`, { reason: cancelReason, role: cancelRole })
      setShowCancelModal(false)
      setCancelReason('')
      void refetch()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cancellation failed')
    } finally {
      setCancelling(false)
    }
  }

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

      <div className="mt-6 border-t border-line pt-6">
        <h3 className="text-caption-sm font-semibold text-foreground">Progress</h3>
        <CommissionStatusTimeline steps={timeline} className="mt-3" />
      </div>

      {isLocked && (
        <div className="mt-6 rounded-control bg-muted/10 p-4">
          <p className="text-caption text-muted">
            This commission was cancelled. Deliverables and payment actions are locked, and any escrowed
            funds are being refunded to the buyer.
          </p>
        </div>
      )}

      {(escrow.canRelease || escrow.canRefund) && (
        <div className="mt-6 border-t border-line pt-6 flex flex-wrap items-center gap-3">
          {escrow.canRelease && (
            <Button variant="primary" onClick={handleRelease} disabled={isLocked || currentStatus !== 'delivered'}>
              Release Funds
            </Button>
          )}
          {escrow.canRefund && (
            <Button variant="danger" onClick={handleRefundRequest} disabled={isLocked || currentStatus === 'released' || currentStatus === 'refunded'}>
              Request Refund
            </Button>
          )}
          <Button variant="ghost" onClick={onDispute} disabled={isLocked}>
            Open Dispute
          </Button>
          {cancelAllowed && (
            <Button variant="secondary" onClick={() => setShowCancelModal(true)}>
              Cancel Commission
            </Button>
          )}
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

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel this commission?"
        description="Cancelling is recorded on the commission timeline and the other party is notified."
      >
        <div className="mt-6 flex flex-col gap-4">
          <div className="rounded-control bg-warning/10 p-4">
            <p className="text-caption text-warning">
              Any escrowed funds will be refunded to the buyer. Depending on network conditions the refund
              can take several ledgers to settle, and the amount is returned in full with no fee deducted.
            </p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-caption-sm font-medium text-foreground">Cancelling as</span>
            <select
              value={cancelRole}
              onChange={(e) => {
                setCancelRole(e.target.value as 'buyer' | 'seller')
                setCancelReason('')
              }}
              className="rounded-control border border-line bg-surface px-3 py-2 text-caption-sm text-foreground"
            >
              <option value="buyer">Client</option>
              <option value="seller">Artist</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-caption-sm font-medium text-foreground">Reason</span>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="rounded-control border border-line bg-surface px-3 py-2 text-caption-sm text-foreground"
            >
              <option value="">Select a reason…</option>
              {CANCEL_REASONS[cancelRole].map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setShowCancelModal(false)}>
            Keep Commission
          </Button>
          <Button variant="danger" onClick={handleCancel} disabled={!cancelReason || cancelling}>
            {cancelling ? 'Cancelling…' : 'Confirm Cancellation'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}