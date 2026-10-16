import { activeNetworkPassphrase } from '@/config'

const STELLAR_ERROR_MESSAGES: { match: RegExp; message: string }[] = [
  { match: /rejected|canceled by user|declined/i, message: 'You declined the transaction in your wallet.' },
  { match: /insufficient balance|underfunded/i, message: 'Your wallet does not have enough balance to cover this payment plus fees.' },
  { match: /no account|account not found/i, message: 'The sending account was not found on this network.' },
  { match: /tx_too_early|too early/i, message: 'This transaction is too recent to submit. Wait a few seconds and try again.' },
  { match: /tx_bad_seq|bad sequence/i, message: 'The wallet is out of sync. Reload the page and try again.' },
  { match: /tx_failed|failed to apply/i, message: 'The network rejected this transaction. Nothing was charged.' },
  { match: /timeout|timed out/i, message: 'The network did not respond in time. Check your connection before retrying.' },
  { match: /network|passphrase|host/i, message: 'The wallet is on a different network than this app. Switch networks and reload.' },
]

/**
 * Turn an arbitrary thrown value into a message safe to show a user.
 *
 * Known Stellar/wallet failures get specific copy; anything unrecognised falls
 * back to a generic message rather than leaking a raw SDK error string.
 */
export function mapStellarError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err ?? '')

  if (/Wallet disconnected/i.test(raw)) {
    return 'Your wallet disconnected. Reconnect to continue — your transaction is still prepared.'
  }

  const known = STELLAR_ERROR_MESSAGES.find((e) => e.match.test(raw))
  return known ? known.message : 'The payment could not be completed. Nothing was charged — please try again.'
}

// ---------------------------------------------------------------------------
// Network awareness (#719)
// ---------------------------------------------------------------------------

/** True when the connected wallet reports a different network to this build. */
export function isNetworkMismatch(walletPassphrase: string | null | undefined): boolean {
  if (!walletPassphrase) return false
  return walletPassphrase !== activeNetworkPassphrase
}
