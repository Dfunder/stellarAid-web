interface Window {
  freighter?: {
    getPublicKey?: () => Promise<string>;
    getAddress?: () => Promise<{ address: string; error?: string } | string>;
    signTransaction?: (
      xdr: string
    ) => Promise<{ signedTxXdr: string; signerAddress: string; error?: string } | string>;
    isAllowed?: () => Promise<boolean>;
    isConnected?: () => Promise<boolean>;
    connect?: () => Promise<string | { publicKey?: string }>;
  };
}
