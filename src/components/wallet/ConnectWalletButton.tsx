"use client";

import { formatAddress } from "../../lib/format";
import { useWallet } from "./WalletProvider";

type FreighterApi = {
  requestAccess: () => Promise<{ address?: string; error?: unknown } | string>;
};

// The Stellar Wallets Kit is not a dependency yet. Until it is added, this
// uses the Freighter browser provider if present. Replace this function with
// a dynamic import of the kit inside the click handler once it is installed.
async function requestAddress(): Promise<string> {
  const api = (window as unknown as { freighterApi?: FreighterApi })
    .freighterApi;
  if (!api) throw new Error("No Stellar wallet found. Install a wallet and retry.");
  let result;
  try {
    result = await api.requestAccess();
  } catch {
    throw new Error("Network error while contacting the wallet. Please retry.");
  }
  const address = typeof result === "string" ? result : result.address;
  if (!address) throw new Error("Connection request was rejected in the wallet.");
  return address;
}

export function ConnectWalletButton() {
  const { address, status, error, connect, disconnect } = useWallet();
  const base =
    "inline-flex items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60";

  return (
    <div className="flex flex-col items-start gap-2">
      {address ? (
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm" title={address}>
            {formatAddress(address)}
          </span>
          <button type="button" className={base} onClick={disconnect}>
            Disconnect
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={base}
          disabled={status === "connecting"}
          onClick={() => connect(requestAddress)}
        >
          {status === "connecting" ? "Connecting..." : "Connect wallet"}
        </button>
      )}
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
