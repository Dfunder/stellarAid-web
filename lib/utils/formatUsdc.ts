const usdcFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatUsdc(amount: number): string {
  return `${usdcFormatter.format(amount)} USDC`;
}
