export interface Transaction {
  id: string
  type: 'purchase' | 'payout' | 'fee' | 'escrow'
  amount: string
  asset: string
  status: 'completed' | 'pending' | 'failed' | 'refunded'
  txHash: string
  createdAt: string
  /** Optional related entity references */
  artworkId?: string
  orderId?: string
  escrowId?: string
}