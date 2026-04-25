const DEFAULT_STELLAR_TX_EXPLORER = 'https://stellar.expert/explorer/testnet/tx';

export function getStellarExplorerTxUrl(txHash: string) {
  const baseUrl = (
    process.env.NEXT_PUBLIC_STELLAR_EXPLORER_URL || DEFAULT_STELLAR_TX_EXPLORER
  ).replace(/\/+$/, '');

  return `${baseUrl}/${encodeURIComponent(txHash)}`;
}

