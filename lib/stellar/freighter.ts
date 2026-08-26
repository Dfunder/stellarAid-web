import {
  getAddress as freighterGetAddress,
  signTransaction as freighterSignTransaction,
  isAllowed as freighterIsAllowed,
  isConnected as freighterIsConnected,
} from '@stellar/freighter-api';

export function isFreighterInstalled(): boolean {
  return typeof window !== 'undefined' && !!window.freighter;
}

export async function connectWallet(): Promise<string> {
  if (!isFreighterInstalled()) {
    throw new Error('Freighter is not installed. Please install the Freighter browser extension.');
  }
  const res = await freighterGetAddress();
  if (res.error) {
    throw new Error(typeof res.error === 'string' ? res.error : 'Failed to connect wallet');
  }
  return res.address;
}

export async function getPublicKey(): Promise<string> {
  const res = await freighterGetAddress();
  if (res.error) {
    throw new Error(typeof res.error === 'string' ? res.error : 'Failed to get public key');
  }
  return res.address;
}

export async function signTransaction(xdr: string): Promise<string> {
  const res = await freighterSignTransaction(xdr);
  if (res.error) {
    throw new Error(typeof res.error === 'string' ? res.error : 'Failed to sign transaction');
  }
  return res.signedTxXdr;
}

export async function signAndSubmitTransaction(xdr: string): Promise<string> {
  const allowedRes = await freighterIsAllowed();
  if (!allowedRes.isAllowed) throw new Error('Freighter connection not authorized.');
  const res = await freighterSignTransaction(xdr);
  if (res.error) {
    throw new Error(typeof res.error === 'string' ? res.error : 'Failed to sign transaction');
  }
  return res.signedTxXdr;
}
