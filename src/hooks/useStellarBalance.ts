"use client";

import { useCallback, useState } from "react";
import { isNonZeroAddress } from "../lib/address-validation";
import { mapBalance, type ApiBalance } from "../types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

type FetchFn = typeof fetch;

export function useStellarBalance(
  account: string | null | undefined,
  fetchFn: FetchFn = fetch,
) {
  const [availableBalance, setAvailableBalance] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async (): Promise<string | null> => {
    if (!account || !isNonZeroAddress(account)) {
      setAvailableBalance(null);
      setError("Connect a valid Stellar account to view its balance.");
      return null;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchFn(
        `${API_BASE_URL}/api/accounts/${encodeURIComponent(account)}/balance`,
      );
      if (!response.ok) throw new Error(`Failed to load balance (${response.status})`);
      const payload: ApiBalance | ApiBalance[] = await response.json();
      const balances = Array.isArray(payload) ? payload : [payload];
      const asset =
        balances.find((item) => item.asset_code === "XLM") ?? balances[0];
      const available = asset ? mapBalance(asset).availableBalance : null;
      setAvailableBalance(available);
      return available;
    } catch (cause) {
      setAvailableBalance(null);
      setError(cause instanceof Error ? cause.message : "Could not load balance.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, fetchFn]);

  return { availableBalance, error, isLoading, refresh };
}
