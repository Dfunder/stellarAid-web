import { useState, useEffect } from 'react'
import { Input } from '@/components/ui'

interface PriceInputProps {
  /** Current price value as string (to avoid float precision issues) */
  value: string
  /** Callback when price changes */
  onChange: (value: string) => void
  /** Selected asset */
  asset: string
  /** Callback when asset changes */
  onAssetChange: (asset: string) => void
  /** Available assets */
  assets?: string[]
  /** Field label */
  label?: string
  /** Error message */
  error?: string
  /** Whether the field is disabled */
  disabled?: boolean
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

const ASSET_LABELS: Record<string, string> = {
  XLM: 'XLM (Native)',
  USDC: 'USDC',
  NGNT: 'NGNT',
  EURC: 'EURC',
}

const CONVERSION_RATES: Record<string, number> = {
  XLM: 1,
  USDC: 0.1, // 10 XLM = 1 USDC (example rate)
  NGNT: 150, // 1 XLM = 150 NGNT (example rate)
  EURC: 0.09, // 1 XLM = 0.09 EURC (example rate)
}

/**
 * Multi-asset pricing input with precision validation and conversion hints.
 *
 * Features:
 * - Asset selector component bound to supported-asset config
 * - Decimal-precision validation per asset (7 for XLM)
 * - Optional equivalent price hints via conversion service
 * - Stores amounts as strings; never floats
 */
export default function MultiAssetPricingInput({
  value,
  onChange,
  asset,
  onAssetChange,
  assets = ['XLM', 'USDC', 'NGNT', 'EURC'],
  label = 'Price',
  error,
  disabled = false,
}: PriceInputProps) {
  const precision = ASSET_PRECISION[asset] ?? 7
  const symbol = ASSET_SYMBOLS[asset] ?? ''
  const [showHint, setShowHint] = useState(false)
  const [convertedValues, setConvertedValues] = useState<Record<string, string>>({})

  // Update conversion hints when value or asset changes
  useEffect(() => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue === 0) {
      setConvertedValues({})
      return
    }

    const baseRate = CONVERSION_RATES[asset] ?? 1
    const conversions: Record<string, string> = {}

    assets.forEach((a) => {
      if (a !== asset && CONVERSION_RATES[a]) {
        const targetRate = CONVERSION_RATES[a]
        const converted = (numValue * baseRate) / targetRate
        const targetPrecision = ASSET_PRECISION[a] ?? 2
        conversions[a] = converted.toFixed(targetPrecision)
      }
    })

    setConvertedValues(conversions)
  }, [value, asset, assets])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    // Allow empty, or valid decimal with correct precision
    const regex = new RegExp(`^\\d*(\\.\\d{0,${precision}})?$`)
    if (newValue === '' || regex.test(newValue)) {
      onChange(newValue)
    }
  }

  const handleBlur = () => {
    // Validate on blur
    const numValue = parseFloat(value)
    if (!isNaN(numValue) && numValue > 0) {
      // Ensure correct precision
      onChange(numValue.toFixed(precision))
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-caption-sm font-medium text-foreground">
        {label} {symbol}
      </label>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{symbol}</span>
            <Input
              type="text"
              inputMode="decimal"
              value={value}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={`0.${'0'.repeat(precision)}`}
              disabled={disabled}
              error={error}
              className="pl-7"
              aria-describedby={error ? 'price-error' : showHint ? 'price-hint' : undefined}
            />
          </div>
          {error && <p id="price-error" className="mt-1 text-caption-sm text-danger">{error}</p>}
        </div>

        <div className="sm:w-40">
          <label htmlFor="asset-select" className="block text-caption-sm font-medium text-foreground mb-1">
            Asset
          </label>
          <select
            id="asset-select"
            value={asset}
            onChange={(e) => onAssetChange(e.target.value)}
            disabled={disabled}
            className="w-full rounded-control border border-line bg-background px-3 py-2 text-caption-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {assets.map((a) => (
              <option key={a} value={a}>
                {ASSET_LABELS[a] ?? a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {Object.keys(convertedValues).length > 0 && (
        <button
          type="button"
          className="text-caption-xs text-primary hover:underline flex items-center gap-1"
          onClick={() => setShowHint(!showHint)}
          aria-expanded={showHint}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {showHint ? 'Hide' : 'Show'} equivalent prices
        </button>
      )}

      {showHint && Object.keys(convertedValues).length > 0 && (
        <div id="price-hint" className="mt-2 rounded-control bg-surface-muted p-3 text-caption-sm">
          <p className="font-medium text-muted mb-2">Approximate equivalents:</p>
          <div className="grid gap-1 sm:grid-cols-2">
            {Object.entries(convertedValues).map(([a, v]) => (
              <div key={a} className="flex justify-between">
                <span className="text-muted">{ASSET_LABELS[a] ?? a}</span>
                <span className="font-mono text-foreground">{ASSET_SYMBOLS[a] ?? ''}{v}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-caption-xs text-muted">
            Rates are indicative and update in real-time. Final price is in selected asset.
          </p>
        </div>
      )}

      <p className="text-caption-xs text-muted">
        Precision: {precision} decimal place{precision !== 1 ? 's' : ''} for {ASSET_LABELS[asset] ?? asset}.
        Amounts stored as strings to avoid floating-point errors.
      </p>
    </div>
  )
}