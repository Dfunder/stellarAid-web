import { getAssetPrecision } from "../config/assets";

export type BalanceValidation =
  | { ok: true; stroops: bigint }
  | { ok: false; error: string };

function toStroops(raw: string, precision: number): bigint | null {
  const value = raw.trim();
  if (!/^\d+(\.\d+)?$/.test(value)) return null;
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > precision) return null;
  return (
    BigInt(whole) * 10n ** BigInt(precision) +
    BigInt(fraction.padEnd(precision, "0"))
  );
}

export function validateAmountAgainstBalance(
  requested: string,
  available: string,
  action: "stake" | "unstake" = "stake",
  assetCode = "XLM",
): BalanceValidation {
  const amount = requested.trim();
  const availableAmount = available.trim();
  const verb = action === "stake" ? "stake" : "unstake";
  const precision = getAssetPrecision(assetCode);

  if (!amount) {
    return { ok: false, error: `Enter an amount to ${verb}.` };
  }

  const stroops = toStroops(amount, precision);
  if (stroops === null || stroops === 0n) {
    return {
      ok: false,
      error: `Enter a positive ${assetCode} amount with at most ${precision} decimal places.`,
    };
  }

  const availableStroops = toStroops(availableAmount, precision);
  if (availableStroops === null) {
    return { ok: false, error: `Available balance is unavailable for ${assetCode}.` };
  }

  if (stroops > availableStroops) {
    const label = action === "stake" ? "available balance" : "staked balance";
    const suffix = action === "stake" ? "available" : "staked";
    return {
      ok: false,
      error: `Insufficient ${label}: requested ${amount} ${assetCode} but only ${availableAmount} ${assetCode} is ${suffix}.`,
    };
  }

  return { ok: true, stroops };
}
