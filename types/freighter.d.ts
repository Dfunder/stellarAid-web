interface Window {
  freighter?: {
    getPublicKey?: () => Promise<string>;
    signTransaction?: (xdr: string) => Promise<string>;
    isAllowed?: () => Promise<boolean>;
    isConnected?: () => Promise<boolean>;
    connect?: () => Promise<string | { publicKey?: string }>;
  };
}
