"use client";

import { useCallback } from "react";
import { requireSequenceAuth, type StellarAuthSequence } from "../lib/stellar-auth";

export function useWalletAuth() {
  const prepareAuthentication = useCallback(
    (auth: StellarAuthSequence) => requireSequenceAuth(auth),
    [],
  );

  return { prepareAuthentication };
}
