export type OrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'

export type ListingStatus = 'draft' | 'active' | 'sold' | 'unpublished'

export type EscrowStatus =
  | 'funded'
  | 'in_progress'
  | 'delivered'
  | 'released'
  | 'refunded'
  | 'disputed'
  | 'cancelled'

export type TxStatus = 'submitted' | 'confirming' | 'confirmed' | 'failed'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
}

export const ORDER_STATUS_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  processing: 'bg-primary/10 text-primary',
  completed: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
  refunded: 'bg-muted text-muted',
}

export const LISTING_STATUS_LABELS: Record<ListingStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  sold: 'Sold',
  unpublished: 'Unpublished',
}

export const LISTING_STATUS_CLASSES: Record<ListingStatus, string> = {
  draft: 'bg-muted text-muted',
  active: 'bg-success/10 text-success',
  sold: 'bg-primary/10 text-primary',
  unpublished: 'bg-warning/10 text-warning',
}

export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  funded: 'Funded',
  in_progress: 'In Progress',
  delivered: 'Delivered',
  released: 'Released',
  refunded: 'Refunded',
  disputed: 'Disputed',
  cancelled: 'Cancelled',
}

export const ESCROW_STATUS_CLASSES: Record<EscrowStatus, string> = {
  funded: 'bg-primary/10 text-primary',
  in_progress: 'bg-primary/10 text-primary',
  delivered: 'bg-warning/10 text-warning',
  released: 'bg-success/10 text-success',
  refunded: 'bg-muted text-muted',
  disputed: 'bg-danger/10 text-danger',
  cancelled: 'bg-muted text-muted',
}

export const TX_STATUS_LABELS: Record<TxStatus, string> = {
  submitted: 'Submitted',
  confirming: 'Confirming',
  confirmed: 'Confirmed',
  failed: 'Failed',
}

export const TX_STATUS_CLASSES: Record<TxStatus, string> = {
  submitted: 'bg-muted text-muted',
  confirming: 'bg-primary/10 text-primary',
  confirmed: 'bg-success/10 text-success',
  failed: 'bg-danger/10 text-danger',
}