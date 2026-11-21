import { describe, expect, it } from "vitest";
import { validateAmountAgainstBalance } from "./stake-validation";

describe("validateAmountAgainstBalance", () => {
  it("accepts an amount within the available balance", () => {
    expect(validateAmountAgainstBalance("12.5", "20", "stake")).toMatchObject({
      ok: true,
    });
    expect(validateAmountAgainstBalance("12.5", "12.5", "stake")).toMatchObject({
      ok: true,
    });
  });

  it("reports requested and available amounts when staking too much", () => {
    const result = validateAmountAgainstBalance("25", "12.5", "stake", "XLM");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("requested 25 XLM");
      expect(result.error).toContain("12.5 XLM");
      expect(result.error).toContain("available");
    }
  });

  it("reports requested and staked amounts when unstaking too much", () => {
    const result = validateAmountAgainstBalance("9.5", "4", "unstake", "XLM");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("requested 9.5 XLM");
      expect(result.error).toContain("4 XLM");
      expect(result.error).toContain("staked");
    }
  });

  it("rejects invalid amounts and unavailable balances", () => {
    expect(validateAmountAgainstBalance("", "10", "stake").ok).toBe(false);
    expect(validateAmountAgainstBalance("0", "10", "stake").ok).toBe(false);
    expect(validateAmountAgainstBalance("1.12345678", "10", "stake").ok).toBe(
      false,
    );
    expect(validateAmountAgainstBalance("1", "", "stake").ok).toBe(false);
  });
});
