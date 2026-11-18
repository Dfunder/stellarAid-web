import { getAssetPrecision } from "../config/assets";

function normalizeAmount(amount: string | number): string {
  const raw = String(amount).trim();
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)$/.test(raw)) return "0";
  return raw;
}

export function formatAssetAmount(
  amount: string | number,
  asset: string,
): string {
  const precision = getAssetPrecision(asset);
  const source = normalizeAmount(amount);
  const negative = source.startsWith("-");
  const unsigned = source.replace(/^[+-]/, "");
  const [wholePart = "0", fractionPart = ""] = unsigned.split(".");
  const whole = wholePart || "0";
  const fraction = (fractionPart + "0".repeat(precision + 1)).slice(
    0,
    precision + 1,
  );
  const digits = `${whole}${fraction.slice(0, precision)}`;
  const roundUp = Number(fraction[precision] ?? "0") >= 5 ? 1n : 0n;
  const rounded = (BigInt(digits) + roundUp).toString().padStart(
    precision + 1,
    "0",
  );
  const integerPart = precision > 0 ? rounded.slice(0, -precision) : rounded;
  const decimalPart = precision > 0 ? rounded.slice(-precision) : "";
  const value =
    precision > 0 ? `${integerPart}.${decimalPart}` : integerPart;
  const sign = negative && /[1-9]/.test(rounded) ? "-" : "";

  return `${sign}${value} ${asset}`;
}

export function formatAddress(
  address: string,
  visibleStart = 6,
  visibleEnd = 4,
): string {
  const value = address.trim();
  if (!value) return value;
  if (value.length <= visibleStart + visibleEnd + 3) return value;
  return `${value.slice(0, visibleStart)}...${value.slice(-visibleEnd)}`;
}

export function formatRelativeTime(
  date: Date | string | number,
  now: Date = new Date(),
): string {
  const then = date instanceof Date ? date : new Date(date);
  const seconds = Math.round((now.getTime() - then.getTime()) / 1000);
  const absolute = Math.abs(seconds);

  if (absolute < 60) return "just now";

  const units: Array<[number, string]> = [
    [60 * 60 * 24 * 365, "y"],
    [60 * 60 * 24 * 30, "mo"],
    [60 * 60 * 24, "d"],
    [60 * 60, "h"],
    [60, "m"],
  ];

  for (const [size, label] of units) {
    if (absolute >= size) {
      const value = Math.floor(absolute / size);
      return seconds >= 0 ? `${value}${label} ago` : `in ${value}${label}`;
    }
  }

  return "just now";
}
