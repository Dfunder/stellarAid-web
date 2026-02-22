/**
 * Stellar Address Validation Utilities
 * 
 * This module provides functions for validating Stellar addresses and related data.
 */

import { StrKey } from '@stellar/stellar-sdk';

/**
 * Validates a Stellar public key (G... address)
 * @param address - The Stellar address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidStellarAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Stellar public keys start with 'G' and are 56 characters long
  if (!address.startsWith('G') || address.length !== 56) {
    return false;
  }

  try {
    return StrKey.isValidEd25519PublicKey(address);
  } catch {
    return false;
  }
}

/**
 * Validates a Stellar secret key (S... key)
 * @param secretKey - The secret key to validate
 * @returns boolean indicating if the secret key is valid
 */
export function isValidSecretKey(secretKey: string): boolean {
  if (!secretKey || typeof secretKey !== 'string') {
    return false;
  }

  // Stellar secret keys start with 'S' and are 56 characters long
  if (!secretKey.startsWith('S') || secretKey.length !== 56) {
    return false;
  }

  try {
    return StrKey.isValidEd25519SecretSeed(secretKey);
  } catch {
    return false;
  }
}

/**
 * Validates a Stellar muxed account address (M... address)
 * @param address - The muxed account address to validate
 * @returns boolean indicating if the muxed address is valid
 */
export function isValidMuxedAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Muxed addresses start with 'M' and are 69 characters long
  if (!address.startsWith('M') || address.length !== 69) {
    return false;
  }

  try {
    return StrKey.isValidMed25519PublicKey(address);
  } catch {
    return false;
  }
}

/**
 * Validates a Stellar contract ID (C... address)
 * @param contractId - The contract ID to validate
 * @returns boolean indicating if the contract ID is valid
 */
export function isValidContractId(contractId: string): boolean {
  if (!contractId || typeof contractId !== 'string') {
    return false;
  }

  // Contract IDs start with 'C' and are 56 characters long
  if (!contractId.startsWith('C') || contractId.length !== 56) {
    return false;
  }

  try {
    return StrKey.isValidContract(contractId);
  } catch {
    return false;
  }
}

/**
 * Validates any type of Stellar address (public key, muxed, or contract)
 * @param address - The address to validate
 * @returns boolean indicating if the address is a valid Stellar address
 */
export function isValidAnyStellarAddress(address: string): boolean {
  return (
    isValidStellarAddress(address) ||
    isValidMuxedAddress(address) ||
    isValidContractId(address)
  );
}

/**
 * Get the type of a Stellar address
 * @param address - The address to check
 * @returns The type of address or 'invalid' if not valid
 */
export function getAddressType(address: string): 'public' | 'muxed' | 'contract' | 'invalid' {
  if (isValidStellarAddress(address)) return 'public';
  if (isValidMuxedAddress(address)) return 'muxed';
  if (isValidContractId(address)) return 'contract';
  return 'invalid';
}
