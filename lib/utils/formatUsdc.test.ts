import { describe, expect, it } from 'vitest';

import { formatUsdc } from './formatUsdc';

describe('formatUsdc', () => {
  it('formats decimal USDC amounts with two fractional digits', () => {
    expect(formatUsdc(12.5)).toBe('12.50 USDC');
  });

  it('formats zero with two fractional digits', () => {
    expect(formatUsdc(0)).toBe('0.00 USDC');
  });

  it('formats large amounts with group separators', () => {
    expect(formatUsdc(1000000)).toBe('1,000,000.00 USDC');
  });
});
