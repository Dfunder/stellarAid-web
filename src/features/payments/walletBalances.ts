/**
 * Wallet balance maths for the payments screens (#799).
 *
 * Kept as a pure module (like `polling.ts`) so the totals are testable without
 * mounting a component, a wallet extension or the network.
 */

export interface AssetBalance {
  asset: string
  balance: string
  hasTrustline: boolean
  trustlineLimit?: string
}

/**
 * Totals **per asset**, never across assets.
 *
 * XLM, USDC, NGNT and EURC are different units with no conversion applied
 * here, so summing their raw balances into one number produces a meaningless
 * total that no longer represents money (#799). Unparseable balances are
 * skipped rather than poisoning the total with `NaN`.
 */
export function sumByAsset(balances: readonly AssetBalance[]): Record<string, number> {
  const totals: Record<string, number> = {}

  for (const { asset, balance } of balances) {
    const amount = parseFloat(balance)
    if (!Number.isFinite(amount)) continue
    totals[asset] = (totals[asset] ?? 0) + amount
  }

  return totals
}
