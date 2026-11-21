"use client";

import { useCallback } from "react";
import { requireSequenceAuth, type StellarAuthSequence } from "../lib/stellar-auth";

type StellarAuthInput = StellarAuthSequence & Record<string, unknown>;

export function useWalletAuth() {
  const prepareAuthentication = useCallback(
    (auth: StellarAuthInput) => requireSequenceAuth(auth),
    [],
  );

  return { prepareAuthentication };
}
