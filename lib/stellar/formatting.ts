/**
 * Stellar Amount Formatting Utilities
 * 
 * This module provides functions for formatting Stellar amounts and assets.
 */

import { Asset, BASE_FEE } from '@stellar/stellar-sdk';

// Stellar uses 7 decimal places for all assets
export const STELLAR_DECIMALS = 7;
export const STELLAR_PRECISION = 10 ** STELLAR_DECIMALS;

/**
 * Convert a human-readable amount to Stellar stroops (smallest unit)
 * @param amount - The amount in human-readable format (e.g., "100.50")
 * @returns The amount in stroops as a string
 */
export function toStroops(amount: string | number): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount) || numAmount < 0) {
    throw new Error('Invalid amount: must be a non-negative number');
  }
  
  const stroops = Math.round(numAmount * STELLAR_PRECISION);
  return stroops.toString();
}

/**
 * Convert stroops to a human-readable amount
 * @param stroops - The amount in stroops
 * @returns The amount in human-readable format
 */
export function fromStroops(stroops: string | number): string {
  const numStroops = typeof stroops === 'string' ? parseInt(stroops, 10) : stroops;
  
  if (isNaN(numStroops) || numStroops < 0) {
    throw new Error('Invalid stroops: must be a non-negative integer');
  }
  
  const amount = numStroops / STELLAR_PRECISION;
  return amount.toFixed(STELLAR_DECIMALS).replace(/\.?0+$/, '');
}

/**
 * Format an amount with specified decimal places
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 7)
 * @returns Formatted amount string
 */
export function formatAmount(
  amount: string | number,
  decimals: number = STELLAR_DECIMALS
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    throw new Error('Invalid amount');
  }
  
  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format an amount with currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code (e.g., 'XLM', 'USD')
 * @param decimals - Number of decimal places
 * @returns Formatted amount with currency
 */
export function formatCurrency(
  amount: string | number,
  currency: string = 'XLM',
  decimals: number = STELLAR_DECIMALS
): string {
  const formattedAmount = formatAmount(amount, decimals);
  return `${formattedAmount} ${currency}`;
}

/**
 * Format a Stellar asset for display
 * @param asset - The Stellar Asset object or asset code
 * @returns Formatted asset string
 */
export function formatAsset(asset: Asset | string): string {
  if (typeof asset === 'string') {
    return asset;
  }
  
  if (asset.isNative()) {
    return 'XLM';
  }
  
  return `${asset.getCode()}:${asset.getIssuer()}`;
}

/**
 * Get the base fee for transactions (in stroops)
 * @returns The base fee as a string
 */
export function getBaseFee(): string {
  return BASE_FEE;
}

/**
 * Format a fee amount for display
 * @param stroops - The fee in stroops
 * @returns Formatted fee string
 */
export function formatFee(stroops: string | number): string {
  const amount = fromStroops(stroops);
  return `${amount} XLM`;
}

/**
 * Truncate an address for display (e.g., GABC...XYZ)
 * @param address - The full Stellar address
 * @param startChars - Number of characters to show at start
 * @param endChars - Number of characters to show at end
 * @returns Truncated address
 */
export function truncateAddress(
  address: string,
  startChars: number = 4,
  endChars: number = 4
): string {
  if (!address || address.length <= startChars + endChars + 3) {
    return address;
  }
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Parse an asset string into code and issuer
 * @param assetString - Asset string in format "CODE:ISSUER" or "XLM"
 * @returns Object with code and issuer (issuer is null for native XLM)
 */
export function parseAssetString(assetString: string): { code: string; issuer: string | null } {
  if (assetString === 'XLM' || assetString === 'native') {
    return { code: 'XLM', issuer: null };
  }
  
  const parts = assetString.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid asset string format. Expected "CODE:ISSUER" or "XLM"');
  }
  
  return { code: parts[0], issuer: parts[1] };
}
