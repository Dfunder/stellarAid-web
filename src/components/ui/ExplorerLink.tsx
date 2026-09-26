import { useState } from 'react'
import { activeStellarNetwork } from '@/config'
import { useCopyToClipboard } from '@/hooks'

interface ExplorerLinkProps {
  /** The hash or address to link to. */
  value: string
  /** Type of the value: 'tx' for transaction hash, 'address' for public key. */
  type: 'tx' | 'address'
  /** Optional custom network override. */
  network?: 'testnet' | 'mainnet'
  /** Optional label to display instead of the truncated value. */
  label?: string
  /** Optional custom CSS classes. */
  className?: string
}

const EXPLORER_ROOTS = {
  testnet: {
    tx: 'https://stellar.expert/explorer/testnet/tx',
    address: 'https://stellar.expert/explorer/testnet/account',
  },
  mainnet: {
    tx: 'https://stellar.expert/explorer/public/tx',
    address: 'https://stellar.expert/explorer/public/account',
  },
} as const

function truncate(value: string, start = 8, end = 6): string {
  if (value.length <= start + end + 3) return value
  return `${value.slice(0, start)}…${value.slice(-end)}`
}

export default function ExplorerLink({
  value,
  type,
  network = activeStellarNetwork,
  label,
  className = '',
}: ExplorerLinkProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { copy, isCopied } = useCopyToClipboard()

  const displayValue = isExpanded ? value : truncate(value)
  const href = `${EXPLORER_ROOTS[network][type]}/${value}`

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-1 text-caption text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
        title={isExpanded ? 'Click to collapse' : 'Click to expand'}
        onClick={(e) => {
          e.preventDefault()
          setIsExpanded(!isExpanded)
        }}
      >
        <span className="font-mono break-all">{displayValue}</span>
        <svg
          className="h-3.5 w-3.5 text-muted shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
      <button
        type="button"
        onClick={() => void copy(value)}
        className="p-1 text-caption-sm text-muted hover:text-foreground transition-colors rounded"
        aria-label={isCopied(value) ? 'Copied to clipboard' : 'Copy to clipboard'}
        title={isCopied(value) ? 'Copied!' : 'Copy'}
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </button>
    </span>
  )
}