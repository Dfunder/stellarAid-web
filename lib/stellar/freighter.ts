import {
  getAddress,
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
  const result = await getAddress();
  if (!result || (typeof result === 'object' && result.error)) {
    throw new Error(
      typeof result === 'object' && result.error
        ? String(result.error)
        : 'Failed to connect Freighter wallet.'
    );
  }
  return typeof result === 'string' ? result : result.address;
}

export async function getPublicKey(): Promise<string> {
  const result = await getAddress();
  if (!result || (typeof result === 'object' && result.error)) {
    throw new Error(
      typeof result === 'object' && result.error
        ? String(result.error)
        : 'Failed to get public key.'
    );
  }
  return typeof result === 'string' ? result : result.address;
}

export async function signTransaction(xdr: string): Promise<string> {
  const result = await freighterSignTransaction(xdr);
  if (!result || (typeof result === 'object' && result.error)) {
    throw new Error(
      typeof result === 'object' && result.error
        ? String(result.error)
        : 'Failed to sign transaction.'
    );
  }
  return typeof result === 'string' ? result : result.signedTxXdr;
}

export async function signAndSubmitTransaction(xdr: string): Promise<string> {
  const allowed = await isAllowed();
  if (!allowed) throw new Error('Freighter connection not authorized.');
  const result = await freighterSignTransaction(xdr);
  if (!result || (typeof result === 'object' && result.error)) {
    throw new Error(
      typeof result === 'object' && result.error
        ? String(result.error)
        : 'Failed to sign transaction.'
    );
  }
  return typeof result === 'string' ? result : result.signedTxXdr;
}
