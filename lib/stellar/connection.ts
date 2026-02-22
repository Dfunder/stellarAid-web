/**
 * Stellar Connection Testing Utilities
 * 
 * This module provides functions for testing connections to Stellar networks.
 */

import { Horizon } from '@stellar/stellar-sdk';
import { StellarNetwork, createHorizonServer } from './config';

export interface ConnectionTestResult {
  success: boolean;
  network: StellarNetwork;
  horizonUrl: string;
  protocolVersion?: number;
  networkPassphrase?: string;
  error?: string;
  latency?: number;
}

/**
 * Test connection to a Stellar Horizon server
 * @param network - The network to test (defaults to testnet)
 * @returns ConnectionTestResult with connection details
 */
export async function testConnection(
  network: StellarNetwork = 'testnet'
): Promise<ConnectionTestResult> {
  const startTime = Date.now();
  const server = createHorizonServer(network);
  const horizonUrl = server.serverURL.toString();

  try {
    // Fetch the root endpoint to verify connection
    const response = await fetch(horizonUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const rootData = await response.json();
    const latency = Date.now() - startTime;

    return {
      success: true,
      network,
      horizonUrl,
      protocolVersion: rootData.protocol_version,
      networkPassphrase: rootData.network_passphrase,
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      success: false,
      network,
      horizonUrl,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      latency,
    };
  }
}

/**
 * Test connection to Stellar testnet
 * @returns ConnectionTestResult for testnet
 */
export async function testTestnetConnection(): Promise<ConnectionTestResult> {
  return testConnection('testnet');
}

/**
 * Test connection to Stellar public network
 * @returns ConnectionTestResult for public network
 */
export async function testPublicConnection(): Promise<ConnectionTestResult> {
  return testConnection('public');
}

/**
 * Test connections to all available networks
 * @returns Array of ConnectionTestResult for each network
 */
export async function testAllConnections(): Promise<ConnectionTestResult[]> {
  const networks: StellarNetwork[] = ['testnet', 'public', 'futurenet'];
  
  const results = await Promise.all(
    networks.map(network => testConnection(network))
  );
  
  return results;
}

/**
 * Get the health status of a Horizon server
 * @param network - The network to check
 * @returns Object containing health status information
 */
export async function getServerHealth(
  network: StellarNetwork = 'testnet'
): Promise<{
  healthy: boolean;
  ledgerVersion?: number;
  historyLatestLedger?: number;
  coreLatestLedger?: number;
  error?: string;
}> {
  const server = createHorizonServer(network);
  const horizonUrl = server.serverURL.toString();

  try {
    // Check the health endpoint
    const response = await fetch(`${horizonUrl}/health`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const healthData = await response.json();

    return {
      healthy: healthData.status === 'up',
      ledgerVersion: healthData.ledger_version,
      historyLatestLedger: healthData.history_latest_ledger,
      coreLatestLedger: healthData.core_latest_ledger,
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Check if a network connection is available
 * @param network - The network to check
 * @returns boolean indicating if the connection is available
 */
export async function isConnectionAvailable(
  network: StellarNetwork = 'testnet'
): Promise<boolean> {
  const result = await testConnection(network);
  return result.success;
}
