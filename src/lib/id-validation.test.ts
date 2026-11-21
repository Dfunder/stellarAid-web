import { describe, expect, it } from "vitest";
import { validateAddress, validateId } from "./id-validation";

const NON_ZERO_ADDRESS = `GB${"A".repeat(54)}`;
const ZERO_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

const validIds = [
  "artist-42",
  "portfolio_ABC",
  "123",
  `0x${"a".repeat(40)}`,
  NON_ZERO_ADDRESS,
];

const maliciousIds = [
  "../admin",
  "..%2Fadmin",
  "%2e%2e%2fsecret",
  "artist/../secret",
  "artist\\secret",
  "artist\u0000admin",
  "' OR 1=1--",
  "UNION SELECT * FROM users",
  "<script>alert(1)</script>",
  "artist; DROP TABLE artists",
  ZERO_ADDRESS,
  `0x${"0".repeat(40)}`,
  "",
  "   ",
  "a".repeat(129),
];

describe("validateId", () => {
  it.each(validIds)("accepts valid ID %s", (id) => {
    expect(validateId(id)).toMatchObject({ ok: true, value: id.trim() });
  });

  it.each(maliciousIds)("rejects malicious ID %j", (id) => {
    const result = validateId(id);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0);
  });

  it("rejects non-string values", () => {
    expect(validateId(undefined).ok).toBe(false);
    expect(validateId(42).ok).toBe(false);
  });
});

describe("validateAddress", () => {
  it("accepts a non-zero account address", () => {
    expect(validateAddress(NON_ZERO_ADDRESS)).toMatchObject({
      ok: true,
      value: NON_ZERO_ADDRESS,
    });
  });

  it("rejects a slug and a zero address", () => {
    expect(validateAddress("artist-42").ok).toBe(false);
    expect(validateAddress(ZERO_ADDRESS).ok).toBe(false);
  });
});
