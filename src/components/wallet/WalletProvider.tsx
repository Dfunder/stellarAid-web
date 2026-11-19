"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type WalletStatus = "disconnected" | "connecting" | "connected";

type WalletState = {
  address: string | null;
  status: WalletStatus;
  error: string | null;
  /** Resolves with the account address; the provider owns the state. */
  connect: (getAddress: () => Promise<string>) => Promise<void>;
  disconnect: () => void;
  setError: (message: string | null) => void;
};

const WalletContext = createContext<WalletState | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [status, setStatus] = useState<WalletStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  // Incremented on every connect/disconnect so a stale connect cannot win.
  const attempt = useRef(0);

  const connect = useCallback(async (getAddress: () => Promise<string>) => {
    const id = ++attempt.current;
    setStatus("connecting");
    setError(null);
    try {
      const next = await getAddress();
      if (id !== attempt.current) return;
      setAddress(next);
      setStatus("connected");
    } catch (e) {
      if (id !== attempt.current) return;
      setAddress(null);
      setStatus("disconnected");
      setError(e instanceof Error ? e.message : "Could not connect wallet.");
    }
  }, []);

  const disconnect = useCallback(() => {
    attempt.current++;
    setAddress(null);
    setStatus("disconnected");
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ address, status, error, connect, disconnect, setError }),
    [address, status, error, connect, disconnect],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletState {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within a <WalletProvider>.");
  return ctx;
}
