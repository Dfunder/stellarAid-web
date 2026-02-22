/**
 * Stellar Network Configuration
 * 
 * This module provides configuration for connecting to Stellar networks.
 * Supports both testnet and public network configurations.
 */

import { Horizon } from '@stellar/stellar-sdk';

export type StellarNetwork = 'testnet' | 'public' | 'futurenet';

export interface StellarConfig {
  network: StellarNetwork;
  horizonUrl: string;
  networkPassphrase: string;
}

// Horizon server URLs for different networks
export const HORIZON_URLS: Record<StellarNetwork, string> = {
  testnet: 'https://horizon-testnet.stellar.org',
  public: 'https://horizon.stellar.org',
  futurenet: 'https://horizon-futurenet.stellar.org',
};

// Network passphrases for different networks
export const NETWORK_PASSPHRASES: Record<StellarNetwork, string> = {
  testnet: 'Test SDF Network ; September 2015',
  public: 'Public Global Stellar Network ; September 2015',
  futurenet: 'Test SDF Future Network ; October 2022',
};

/**
 * Get Stellar configuration for a specific network
 * @param network - The Stellar network to configure
 * @returns StellarConfig object with horizon URL and network passphrase
 */
export function getStellarConfig(network: StellarNetwork = 'testnet'): StellarConfig {
  return {
    network,
    horizonUrl: HORIZON_URLS[network],
    networkPassphrase: NETWORK_PASSPHRASES[network],
  };
}

/**
 * Create a Horizon server instance
 * @param network - The Stellar network to connect to
 * @returns Horizon.Server instance
 */
export function createHorizonServer(network: StellarNetwork = 'testnet'): Horizon.Server {
  const config = getStellarConfig(network);
  return new Horizon.Server(config.horizonUrl);
}

/**
 * Initialize the Stellar network connection
 * @param network - The Stellar network to initialize
 * @returns Object containing the horizon server and config
 */
export function initializeNetwork(network: StellarNetwork = 'testnet') {
  const config = getStellarConfig(network);
  const server = createHorizonServer(network);

  return {
    server,
    config,
  };
}
