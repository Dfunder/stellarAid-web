import {
  getPublicKey as freighterGetPublicKey,
  signTransaction as freighterSignTransaction,
  isAllowed,
} from '@stellar/freighter-api';

export function isFreighterInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.freighter;
}

export async function connectWallet(): Promise<string> {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter is not installed. Please install the Freighter browser extension.');
  }
  const publicKey = await freighterGetPublicKey();
  return publicKey;
}

export async function getPublicKey(): Promise<string> {
  return freighterGetPublicKey();
}

export async function signTransaction(xdr: string): Promise<string> {
  const signed = await freighterSignTransaction(xdr);
  return signed;
}

export async function signAndSubmitTransaction(xdr: string): Promise<string> {
  const allowed = await isAllowed();
  if (!allowed) throw new Error('Freighter connection not authorized.');
  const signed = await freighterSignTransaction(xdr);
  return signed;
}
