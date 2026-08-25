const STELLAR_EXPERT_URLS = {
  testnet: 'https://stellar.expert/explorer/testnet',
  mainnet: 'https://stellar.expert/explorer/public',
} as const;

function getNetworkBase(): string {
  const network = process.env.NEXT_PUBLIC_STELLAR_NETWORK || 'testnet';
  return STELLAR_EXPERT_URLS[network as keyof typeof STELLAR_EXPERT_URLS] || STELLAR_EXPERT_URLS.testnet;
}

export function txLink(hash: string): string {
  return `${getNetworkBase()}/tx/${hash}`;
}

export function accountLink(address: string): string {
  return `${getNetworkBase()}/account/${address}`;
}

export function contractLink(contractId: string): string {
  return `${getNetworkBase()}/contract/${contractId}`;
}

export function assetLink(assetCode: string, issuer?: string): string {
  if (issuer) {
    return `${getNetworkBase()}/asset/${assetCode}-${issuer}`;
  }
  return `${getNetworkBase()}/asset/${assetCode}`;
}
