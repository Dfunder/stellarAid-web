import { describe, expect, it } from "vitest";
import {
  validateStakeAmount,
  validateUnstakeAmount,
} from "./staking-validation";

describe("validateStakeAmount", () => {
  it("accepts amounts within the available balance", () => {
    expect(
      validateStakeAmount({ amount: "10.5", available: "100", precision: 2 }),
    ).toEqual({ ok: true, amount: "10.5", stroops: 1050n, precision: 2 });
  });

  it("reports insufficient balance with requested and available amounts", () => {
    const result = validateStakeAmount({
      amount: "100.01",
      available: "100",
      precision: 2,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INSUFFICIENT_BALANCE");
    expect(result.requested).toBe("100.01");
    expect(result.available).toBe("100");
    expect(result.message).toMatch(/insufficient balance/i);
  });

  it("rejects empty, non-numeric, zero, and overly precise amounts", () => {
    expect(validateStakeAmount({ amount: "", available: "100" }).ok).toBe(false);
    expect(validateStakeAmount({ amount: "abc", available: "100" }).ok).toBe(
      false,
    );
    expect(validateStakeAmount({ amount: "0", available: "100" }).ok).toBe(
      false,
    );
    expect(
      validateStakeAmount({
        amount: "1.12345678",
        available: "100",
      }),
    ).toMatchObject({ ok: false, code: "PRECISION_EXCEEDED" });
  });

  it("compares stroop-safe values without floating point rounding", () => {
    const result = validateStakeAmount({
      amount: "9007199254740993.0000001",
      available: "9007199254740993.0000001",
      precision: 7,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.stroops).toBe(90071992547409930000001n);
  });
});

describe("validateUnstakeAmount", () => {
  it("accepts amounts within the staked balance", () => {
    expect(
      validateUnstakeAmount({ amount: "25", available: "25", precision: 7 }),
    ).toEqual({ ok: true, amount: "25", stroops: 250000000n, precision: 7 });
  });

  it("reports insufficient staked balance with both amounts", () => {
    const result = validateUnstakeAmount({
      amount: "300",
      available: "250",
      precision: 7,
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe("INSUFFICIENT_STAKED");
    expect(result.requested).toBe("300");
    expect(result.available).toBe("250");
    expect(result.message).toMatch(/insufficient staked balance/i);
  });

  it("rejects an invalid available balance", () => {
    expect(
      validateUnstakeAmount({ amount: "1", available: "unknown" }),
    ).toMatchObject({ ok: false, code: "INVALID_AVAILABLE" });
  });
});
