/**
 * One place for status pill labels, colours and descriptions. Every screen that
 * renders an order, listing, transaction or escrow status reads it from here.
 */
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
export type ListingStatus = 'draft' | 'active' | 'sold' | 'unpublished'
export type TransactionStatus = 'submitted' | 'confirming' | 'confirmed' | 'failed'
export type EscrowStatus =
  | 'funded'
  | 'in_progress'
  | 'delivered'
  | 'released'
  | 'refunded'
  | 'disputed'
  | 'cancelled'

/** Every status string the app renders as a pill. */
export type AppStatus = OrderStatus | ListingStatus | TransactionStatus | EscrowStatus

export interface StatusMeta {
  label: string
  /** Tailwind classes for the pill (design tokens only). */
  className: string
  description: string
}

const NEUTRAL = 'bg-muted text-muted'
const PRIMARY = 'bg-primary/10 text-primary'
const ACTIVE = 'bg-brand-purple-500/10 text-brand-purple-600'
const WARNING = 'bg-warning/10 text-warning'
const SUCCESS = 'bg-success/10 text-success'
const DANGER = 'bg-danger/10 text-danger'

const STATUS_META: Record<AppStatus, StatusMeta> = {
  // orders
  pending: { label: 'Pending', className: WARNING, description: 'Waiting to be processed.' },
  processing: { label: 'Processing', className: ACTIVE, description: 'Being processed.' },
  completed: { label: 'Completed', className: SUCCESS, description: 'Finished successfully.' },
  failed: { label: 'Failed', className: DANGER, description: 'Something went wrong.' },
  refunded: { label: 'Refunded', className: NEUTRAL, description: 'The payment was returned.' },
  // listings
  draft: { label: 'Draft', className: NEUTRAL, description: 'Not published yet.' },
  active: { label: 'Active', className: SUCCESS, description: 'Visible and available to buy.' },
  sold: { label: 'Sold', className: PRIMARY, description: 'Purchased by a buyer.' },
  unpublished: { label: 'Unpublished', className: WARNING, description: 'Hidden from the marketplace.' },
  // transactions
  submitted: { label: 'Submitted', className: NEUTRAL, description: 'Sent to the network.' },
  confirming: { label: 'Confirming', className: ACTIVE, description: 'Waiting for confirmations.' },
  confirmed: { label: 'Confirmed', className: SUCCESS, description: 'Confirmed on-chain.' },
  // escrow
  funded: { label: 'Funded', className: PRIMARY, description: 'Funds are held in escrow.' },
  in_progress: { label: 'In Progress', className: ACTIVE, description: 'The artist is working on it.' },
  delivered: { label: 'Delivered', className: WARNING, description: 'Delivered and awaiting approval.' },
  released: { label: 'Released', className: SUCCESS, description: 'Funds released to the artist.' },
  disputed: { label: 'Disputed', className: DANGER, description: 'Under dispute.' },
  cancelled: { label: 'Cancelled', className: NEUTRAL, description: 'Cancelled before completion.' },
}

/** Label, pill classes and description for a status. */
export function statusMeta(status: AppStatus): StatusMeta {
  return STATUS_META[status]
}

/** Escrow steps in timeline order (the happy path first, then the terminal exceptions). */
export const ESCROW_STEPS: readonly EscrowStatus[] = [
  'funded',
  'in_progress',
  'delivered',
  'released',
  'refunded',
  'disputed',
]

/** Meta for an escrow timeline step plus its position in the timeline. */
export function escrowStepMeta(step: EscrowStatus): StatusMeta & { index: number } {
  return { ...STATUS_META[step], index: ESCROW_STEPS.indexOf(step) }
}
