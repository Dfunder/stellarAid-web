/**
 * Money helpers shared by checkout and payment forms.
 *
 * Amounts are decimal strings throughout the app — never floats — so a value
 * entered by a user can be compared with the cart total exactly (#995).
 */

const DECIMAL_AMOUNT = /^([+-]?)(\d+)(?:\.(\d+))?$/

/**
 * Normalises a decimal money string so equivalent spellings compare equal:
 * `"10"`, `"10.0"` and `"010.00"` all become `"10"`.
 *
 * Returns `null` for anything that is not a plain decimal number (empty
 * strings, exponents, `NaN`, currency symbols, …).
 */
export function normalizeAmount(value: string): string | null {
  const matched = DECIMAL_AMOUNT.exec(value.trim().replace(/,/g, ''))
  if (!matched) return null

  const [, sign = '', whole = '0', fraction = ''] = matched
  // Leading zeros are not significant; keep at least one digit.
  const normalizedWhole = whole.replace(/^0+(?=\d)/, '')
  // Trailing zeros do not change the value.
  const normalizedFraction = fraction.replace(/0+$/, '')
  const negative = sign === '-' && (normalizedWhole !== '0' || normalizedFraction !== '')

  return `${negative ? '-' : ''}${normalizedWhole}${
    normalizedFraction ? `.${normalizedFraction}` : ''
  }`
}

/** True when both values are valid decimal amounts of exactly equal value. */
export function amountsMatch(left: string, right: string): boolean {
  const normalizedLeft = normalizeAmount(left)
  const normalizedRight = normalizeAmount(right)
  return normalizedLeft !== null && normalizedLeft === normalizedRight
}

/** True for a valid decimal amount greater than zero. */
export function isPositiveAmount(value: string): boolean {
  const normalized = normalizeAmount(value)
  return normalized !== null && !normalized.startsWith('-') && normalized !== '0'
}

/**
 * Parses the `amountLabel` prop shape (`"10 XLM"`, `"12.50 USDC"`) into its
 * numeric amount and asset symbol.
 */
export function parseAmountLabel(label: string): { amount: string; asset: string } | null {
  const matched = /^\s*([+-]?\d+(?:[.,]\d+)?)\s*([A-Za-z][A-Za-z0-9._-]*)?\s*$/.exec(label)
  if (!matched) return null

  const amount = normalizeAmount(matched[1] ?? '')

  if (amount === null) return null

  return { amount, asset: matched[2] ?? '' }
}
