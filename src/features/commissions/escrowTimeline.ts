/**
 * Escrow and commission data types plus the pure helpers that derive the status timeline and cancellation rules.
 * Kept apart from `EscrowStatusWidget.tsx` so that file only exports components (Vite Fast Refresh).
 */
export type EscrowStatus = 'funded' | 'in_progress' | 'delivered' | 'released' | 'refunded' | 'disputed' | 'cancelled'

export interface EscrowData {
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

export interface Milestone {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'disputed'
  dueDate: string
  completedAt: string | null
}

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

/** States where the commission is settled and can no longer be cancelled. */
const CANCEL_BLOCKED_STATUSES: EscrowStatus[] = ['released', 'refunded', 'cancelled']

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

export function canCancelCommission(status: EscrowStatus): boolean {
  return !CANCEL_BLOCKED_STATUSES.includes(status)
}
