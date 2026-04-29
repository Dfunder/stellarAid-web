/**
 * Stellar / Web3 Transaction Error Handler (#143)
 *
 * Maps raw Stellar SDK and JSON-RPC error codes to user-friendly messages.
 */

export interface StellarTxError {
  /** Short machine-readable code */
  code: string;
  /** Human-readable message shown to the user */
  message: string;
  /** Whether the user can retry the operation */
  retryable: boolean;
}

// ─── Error code maps ──────────────────────────────────────────────────────────

const JSON_RPC_ERRORS: Record<number, StellarTxError> = {
  4001: {
    code: "USER_REJECTED",
    message: "You rejected the transaction. No funds were moved.",
    retryable: true,
  },
  "-32603": {
    code: "INTERNAL_RPC_ERROR",
    message: "An internal wallet error occurred. Please try again.",
    retryable: true,
  },
} as unknown as Record<number, StellarTxError>;

const STRING_CODE_ERRORS: Record<string, StellarTxError> = {
  // Wallet / user errors
  USER_REJECTED: {
    code: "USER_REJECTED",
    message: "You rejected the transaction. No funds were moved.",
    retryable: true,
  },

  // Stellar Horizon result codes
  op_underfunded: {
    code: "INSUFFICIENT_FUNDS",
    message: "Insufficient funds to complete this transaction.",
    retryable: false,
  },
  op_low_reserve: {
    code: "LOW_RESERVE",
    message:
      "Your account balance is below the minimum reserve required by Stellar.",
    retryable: false,
  },
  op_no_destination: {
    code: "NO_DESTINATION",
    message: "The destination account does not exist on the Stellar network.",
    retryable: false,
  },
  op_no_trust: {
    code: "NO_TRUST",
    message:
      "The destination account has not established a trustline for this asset.",
    retryable: false,
  },
  op_not_authorized: {
    code: "NOT_AUTHORIZED",
    message: "This account is not authorized to send this asset.",
    retryable: false,
  },
  tx_bad_seq: {
    code: "BAD_SEQUENCE",
    message: "Transaction sequence number mismatch. Please try again.",
    retryable: true,
  },
  tx_insufficient_fee: {
    code: "INSUFFICIENT_FEE",
    message: "The transaction fee is too low. Please increase the fee.",
    retryable: true,
  },
  tx_too_late: {
    code: "TX_TOO_LATE",
    message: "The transaction expired before it could be submitted.",
    retryable: true,
  },
  tx_no_account: {
    code: "NO_ACCOUNT",
    message: "The source account does not exist on the Stellar network.",
    retryable: false,
  },

  // Network / RPC errors
  NETWORK_ERROR: {
    code: "NETWORK_ERROR",
    message: "Network connection failed. Check your internet and try again.",
    retryable: true,
  },
  UNPREDICTABLE_GAS_LIMIT: {
    code: "CONTRACT_REVERT",
    message: "The transaction would fail on-chain. Please review the details.",
    retryable: false,
  },
  INSUFFICIENT_FUNDS: {
    code: "INSUFFICIENT_FUNDS",
    message: "Insufficient funds to complete this transaction.",
    retryable: false,
  },

  // Freighter / Albedo wallet errors
  "User declined access": {
    code: "USER_REJECTED",
    message: "Wallet access was denied. Please approve the connection request.",
    retryable: true,
  },
  "Transaction was rejected": {
    code: "USER_REJECTED",
    message: "You rejected the transaction. No funds were moved.",
    retryable: true,
  },
};

// ─── Main parser ──────────────────────────────────────────────────────────────

/**
 * Parse any Stellar / Web3 error into a structured, user-friendly object.
 *
 * @example
 * ```ts
 * try {
 *   await submitTransaction(tx);
 * } catch (err) {
 *   const parsed = parseStellarError(err);
 *   toast.error(parsed.message);
 * }
 * ```
 */
export function parseStellarError(error: unknown): StellarTxError {
  if (!error) {
    return {
      code: "UNKNOWN_ERROR",
      message: "An unexpected error occurred. Please try again.",
      retryable: true,
    };
  }

  // JSON-RPC numeric code (e.g. MetaMask / WalletConnect style)
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;

    // Numeric code
    if (typeof err.code === "number" && JSON_RPC_ERRORS[err.code]) {
      return JSON_RPC_ERRORS[err.code]!;
    }

    // Stellar Horizon extras.result_codes
    const extras = err.response as Record<string, unknown> | undefined;
    const resultCodes = extras?.data as
      | { extras?: { result_codes?: { operations?: string[]; transaction?: string } } }
      | undefined;
    const opCodes = resultCodes?.extras?.result_codes?.operations ?? [];
    const txCode = resultCodes?.extras?.result_codes?.transaction ?? "";

    for (const code of opCodes) {
      if (STRING_CODE_ERRORS[code]) return STRING_CODE_ERRORS[code]!;
    }
    if (txCode && STRING_CODE_ERRORS[txCode]) {
      return STRING_CODE_ERRORS[txCode]!;
    }

    // String code property
    if (typeof err.code === "string" && STRING_CODE_ERRORS[err.code]) {
      return STRING_CODE_ERRORS[err.code]!;
    }

    // Message-based matching
    const message =
      typeof err.message === "string" ? err.message : String(error);
    for (const [key, val] of Object.entries(STRING_CODE_ERRORS)) {
      if (message.toLowerCase().includes(key.toLowerCase())) return val;
    }

    // Fallback with original message
    if (typeof err.message === "string") {
      return {
        code: "TRANSACTION_FAILED",
        message: err.message,
        retryable: false,
      };
    }
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred. Please try again.",
    retryable: true,
  };
}

/**
 * Returns true when the error is simply the user declining the transaction.
 */
export function isUserRejection(error: unknown): boolean {
  return parseStellarError(error).code === "USER_REJECTED";
}
