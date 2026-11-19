import { getAssetPrecision } from "../config/assets";
import { formatAssetAmount } from "../lib/format";
import { cn } from "../lib/cn";

type StellarAmountProps = {
  amount: string;
  asset: string;
  /** Optional display precision override (digits after the decimal point). */
  precision?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl font-semibold" };

// Truncates the fraction digits of a decimal string without going through a float.
function withPrecision(amount: string, precision: number): string {
  const [whole = "0", fraction = ""] = amount.trim().split(".");
  return precision > 0 ? `${whole}.${fraction.slice(0, precision)}` : whole;
}

export function StellarAmount({
  amount,
  asset,
  precision,
  size = "md",
  className,
}: StellarAmountProps) {
  const full = formatAssetAmount(amount, asset);
  const [fullValue = "0"] = full.split(" ");
  const shown =
    precision !== undefined && precision < getAssetPrecision(asset)
      ? withPrecision(fullValue, precision)
      : fullValue;
  const code = asset || "XLM";

  return (
    <span className={cn("tabular-nums", sizes[size], className)} title={full}>
      <span aria-hidden="true">
        {shown} {code}
      </span>
      <span className="sr-only">{full}</span>
    </span>
  );
}
