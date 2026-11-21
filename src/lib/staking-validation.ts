export type StakingErrorCode =
  | "INVALID_AMOUNT"
  | "INVALID_AVAILABLE"
  | "PRECISION_EXCEEDED"
  | "NON_POSITIVE_AMOUNT"
  | "INSUFFICIENT_BALANCE"
  | "INSUFFICIENT_STAKED";

export type StakingSuccess = {
  ok: true;
  amount: string;
  stroops: bigint;
  precision: number;
};

export type StakingError = {
  ok: false;
  code: StakingErrorCode;
  message: string;
  available: string;
  requested: string;
};

export type StakingValidationResult = StakingSuccess | StakingError;

export type StakingAmountInput = {
  amount: string | number;
  available: string | number;
  precision?: number;
};

const decimalPattern = /^\d+(\.\d+)?$/;

function normalize(value: string | number): string {
  if (typeof value !== "string" && typeof value !== "number") return "";
  return String(value).trim();
}

function toStroops(value: string, precision: number): bigint | undefined {
  if (!decimalPattern.test(value)) return undefined;
  const [whole = "0", fraction = ""] = value.split(".");
  if (fraction.length > precision) return undefined;
  const scaledFraction = fraction ? fraction.padEnd(precision, "0") : "0";
  return BigInt(whole) * 10n ** BigInt(precision) + BigInt(scaledFraction);
}

function validate(
  input: StakingAmountInput,
  insufficientCode: "INSUFFICIENT_BALANCE" | "INSUFFICIENT_STAKED",
  insufficientMessage: (requested: string, available: string) => string,
): StakingValidationResult {
  const requested = normalize(input.amount);
  const available = normalize(input.available);
  const precision =
    typeof input.precision === "number" &&
    Number.isInteger(input.precision) &&
    input.precision >= 0
      ? input.precision
      : 7;

  const error = (code: StakingErrorCode, message: string): StakingError => ({
    ok: false,
    code,
    message,
    available,
    requested,
  });

  if (!requested) return error("INVALID_AMOUNT", "Enter an amount.");
  if (!decimalPattern.test(requested)) {
    return error("INVALID_AMOUNT", "Enter a valid positive number.");
  }

  const stroops = toStroops(requested, precision);
  if (stroops === undefined) {
    return error(
      "PRECISION_EXCEEDED",
      `Use at most ${precision} decimal places.`,
    );
  }
  if (stroops === 0n) {
    return error("NON_POSITIVE_AMOUNT", "Amount must be greater than zero.");
  }

  const availableStroops = toStroops(available, precision);
  if (availableStroops === undefined) {
    return error("INVALID_AVAILABLE", "Available balance is invalid.");
  }
  if (stroops > availableStroops) {
    return error(insufficientCode, insufficientMessage(requested, available));
  }

  return { ok: true, amount: requested, stroops, precision };
}

export function validateStakeAmount(
  input: StakingAmountInput,
): StakingValidationResult {
  return validate(
    input,
    "INSUFFICIENT_BALANCE",
    (requested, available) =>
      `Insufficient balance: requested ${requested}, available ${available}.`,
  );
}

export function validateUnstakeAmount(
  input: StakingAmountInput,
): StakingValidationResult {
  return validate(
    input,
    "INSUFFICIENT_STAKED",
    (requested, available) =>
      `Insufficient staked balance: requested ${requested}, available ${available}.`,
  );
}
