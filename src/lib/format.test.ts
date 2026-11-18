import { describe, expect, it } from "vitest";
import { formatAddress, formatAssetAmount, formatRelativeTime } from "./format";

describe("formatAssetAmount", () => {
  it("formats zero with the asset precision", () => {
    expect(formatAssetAmount("0", "XLM")).toBe("0.0000000 XLM");
  });

  it("rounds values with more decimals than the asset precision", () => {
    expect(formatAssetAmount("1.23456789", "USDC")).toBe("1.2345679 USDC");
  });

  it("keeps very small values at the expected precision", () => {
    expect(formatAssetAmount("0.00000001", "XLM")).toBe("0.0000000 XLM");
  });

  it("pads values with fewer decimals", () => {
    expect(formatAssetAmount("12.5", "NGNT")).toBe("12.5000000 NGNT");
  });

  it("falls back to the default precision for unknown assets", () => {
    expect(formatAssetAmount("3", "AQUA")).toBe("3.0000000 AQUA");
  });
});

describe("formatAddress", () => {
  it("truncates the middle of a long address", () => {
    expect(formatAddress("GABCDEFGHIJKLMNOPQRSTUVWXYZ234567")).toBe(
      "GABCDE...4567",
    );
  });

  it("leaves short addresses unchanged", () => {
    expect(formatAddress("GABC")).toBe("GABC");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-01-01T00:00:00.000Z");

  it("describes recent timestamps", () => {
    expect(formatRelativeTime(new Date("2026-01-01T00:00:00.000Z"), now)).toBe(
      "just now",
    );
  });

  it("formats minutes, hours and days", () => {
    expect(formatRelativeTime(new Date("2025-12-31T23:55:00.000Z"), now)).toBe(
      "5m ago",
    );
    expect(formatRelativeTime(new Date("2025-12-31T22:00:00.000Z"), now)).toBe(
      "2h ago",
    );
    expect(formatRelativeTime(new Date("2025-12-29T00:00:00.000Z"), now)).toBe(
      "3d ago",
    );
  });

  it("describes future timestamps", () => {
    expect(formatRelativeTime(new Date("2026-01-01T00:10:00.000Z"), now)).toBe(
      "in 10m",
    );
  });
});
