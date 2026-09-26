import { useMemo } from 'react'
import { Input } from '@/components/ui'

interface LineItem {
  label: string
  amount: string
  asset: string
  type: 'price' | 'fee' | 'network_fee' | 'total' | 'discount'
}

interface PaymentSummaryAndFeeBreakdownProps {
  /** Artwork base price */
  price: string
  /** Selected asset */
  asset: string
  /** Platform fee percentage (e.g., 2.5 for 2.5%) */
  platformFeePercent: number
  /** Estimated network fee */
  networkFeeEstimate: string
  /** Optional discount amount */
  discount?: string
  /** Whether the summary is editable (for quote updates) */
  editable?: boolean
  /** Callback when user confirms after fee change */
  onReconfirm?: () => void
}

const ASSET_PRECISION: Record<string, number> = {
  XLM: 7,
  USDC: 2,
  NGNT: 2,
  EURC: 2,
}

const ASSET_SYMBOLS: Record<string, string> = {
  XLM: '✦',
  USDC: '$',
  NGNT: '₦',
  EURC: '€',
}

export default function PaymentSummaryAndFeeBreakdown({
  price,
  asset,
  platformFeePercent,
  networkFeeEstimate,
  discount,
  editable = false,
  onReconfirm,
}: PaymentSummaryAndFeeBreakdownProps) {
  const precision = ASSET_PRECISION[asset] ?? 7
  const symbol = ASSET_SYMBOLS[asset] ?? ''

  const lineItems = useMemo((): LineItem[] => {
    const priceNum = parseFloat(price)
    const platformFeeNum = (priceNum * platformFeePercent) / 100
    const networkFeeNum = parseFloat(networkFeeEstimate)
    const discountNum = discount ? parseFloat(discount) : 0

    const items: LineItem[] = [
      { label: 'Artwork Price', amount: priceNum.toFixed(precision), asset, type: 'price' },
      { label: `Platform Fee (${platformFeePercent}%)`, amount: platformFeeNum.toFixed(precision), asset, type: 'fee' },
    ]

    if (discountNum > 0) {
      items.push({ label: 'Discount', amount: `-${discountNum.toFixed(precision)}`, asset, type: 'discount' })
    }

    items.push({ label: 'Est. Network Fee', amount: networkFeeNum.toFixed(precision), asset, type: 'network_fee' })

    const total = priceNum + platformFeeNum + networkFeeNum - discountNum
    items.push({ label: 'Total', amount: total.toFixed(precision), asset, type: 'total' })

    return items
  }, [price, asset, platformFeePercent, networkFeeEstimate, discount, precision])

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    return `${num >= 0 && amount.startsWith('-') ? '' : ''}${symbol}${Math.abs(num).toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}`
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6 shadow-card">
      <h2 className="text-h3">Payment Summary</h2>
      <p className="mt-1 text-caption text-muted">
        Review the exact breakdown of what you'll pay. Amounts shown in {asset}.
      </p>

      <dl className="mt-4 space-y-3" role="list">
        {lineItems.map((item, index) => (
          <div
            key={item.type}
            className={`flex justify-between items-center py-2 ${index === lineItems.length - 1 ? 'border-t border-line pt-4' : ''} ${item.type === 'total' ? 'text-body font-bold' : 'text-caption-sm'}`}
            role="listitem"
          >
            <dt className={`text-muted ${item.type === 'total' ? 'font-semibold' : ''}`}>
              {item.label}
              {editable && item.type !== 'total' && (
                <span className="ml-2 text-caption-xs text-primary" title="Click to refresh quote">↻</span>
              )}
            </dt>
            <dd className={`font-mono ${item.type === 'discount' ? 'text-success' : item.type === 'total' ? 'text-foreground' : 'text-foreground'}`}>
              {formatAmount(item.amount)}
            </dd>
          </div>
        ))}
      </dl>

      {editable && (
        <div className="mt-4 p-3 rounded-control bg-warning/10 border border-warning/30">
          <p className="text-caption-sm text-warning">
            <strong>Fees updated.</strong> The platform fee or network fee estimate has changed since your last quote.
          </p>
          <Button size="sm" className="mt-2" onClick={onReconfirm} variant="secondary">
            Confirm Updated Amounts
          </Button>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-line">
        <h3 className="text-caption-sm font-semibold text-muted">Escrow Notice</h3>
        <p className="mt-2 text-caption text-muted">
          For protected commissions, funds are held in escrow until you confirm delivery.
          The seller receives payment only after you approve the deliverables or the auto-release
          period expires. <a href="/help/escrow" className="text-primary hover:underline ml-1">Learn more</a>
        </p>
      </div>
    </div>
  )
}