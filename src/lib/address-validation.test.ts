import { describe, expect, it } from "vitest";
import { isNonZeroAddress, isStellarAddress } from "./address-validation";

const ZERO_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";
const NON_ZERO_ADDRESS = `GB${"A".repeat(54)}`;
const ZERO_HEX = `0x${"0".repeat(40)}`;

describe("isNonZeroAddress", () => {
  it("accepts a Stellar account with a non-zero payload", () => {
    expect(isStellarAddress(NON_ZERO_ADDRESS)).toBe(true);
    expect(isNonZeroAddress(NON_ZERO_ADDRESS)).toBe(true);
  });

  it("rejects the Stellar zero account", () => {
    expect(isStellarAddress(ZERO_ADDRESS)).toBe(true);
    expect(isNonZeroAddress(ZERO_ADDRESS)).toBe(false);
  });

  it("rejects zero-value hex and empty or non-string input", () => {
    expect(isNonZeroAddress(ZERO_HEX)).toBe(false);
    expect(isNonZeroAddress("0".repeat(40))).toBe(false);
    expect(isNonZeroAddress("")).toBe(false);
    expect(isNonZeroAddress(null)).toBe(false);
  });

  it("rejects malformed account-shaped values", () => {
    expect(isNonZeroAddress(`Gb${"A".repeat(54)}`)).toBe(false);
  });
});
