/**
 * Stellar Utilities Module
 * 
 * This module provides a comprehensive set of utilities for interacting with the Stellar blockchain.
 * It includes configuration, validation, formatting, and connection testing functions.
 * 
 * @example
 * ```typescript
 * import { 
 *   initializeNetwork, 
 *   isValidStellarAddress, 
 *   formatAmount,
 *   testConnection 
 * } from '@/lib/stellar';
 * 
 * // Initialize connection to testnet
 * const { server, config } = initializeNetwork('testnet');
 * 
 * // Validate an address
 * const isValid = isValidStellarAddress('G...');
 * 
 * // Format an amount
 * const formatted = formatAmount('100.5');
 * 
 * // Test connection
 * const result = await testConnection('testnet');
 * ```
 */

// Configuration exports
export type {
  StellarNetwork,
  StellarConfig,
} from './config';
export {
  HORIZON_URLS,
  NETWORK_PASSPHRASES,
  getStellarConfig,
  createHorizonServer,
  initializeNetwork,
} from './config';

// Validation exports
export {
  isValidStellarAddress,
  isValidSecretKey,
  isValidMuxedAddress,
  isValidContractId,
  isValidAnyStellarAddress,
  getAddressType,
} from './validation';

// Formatting exports
export {
  STELLAR_DECIMALS,
  STELLAR_PRECISION,
  toStroops,
  fromStroops,
  formatAmount,
  formatCurrency,
  formatAsset,
  getBaseFee,
  formatFee,
  truncateAddress,
  parseAssetString,
} from './formatting';

// Connection testing exports
export type {
  ConnectionTestResult,
} from './connection';
export {
  testConnection,
  testTestnetConnection,
  testPublicConnection,
  testAllConnections,
  getServerHealth,
  isConnectionAvailable,
} from './connection';
