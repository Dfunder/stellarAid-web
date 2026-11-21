import { describe, expect, it } from "vitest";
import { requireSequenceAuth, type StellarAuthSequence } from "./stellar-auth";

describe("requireSequenceAuth", () => {
  it("requires an on-chain Stellar sequence number instead of a client nonce", () => {
    expect(
      requireSequenceAuth({
        publicKey: "GTEST",
        sequenceNumber: "123456",
      }),
    ).toEqual({ publicKey: "GTEST", sequenceNumber: "123456" });

    expect(() =>
      requireSequenceAuth({ publicKey: "GTEST", sequenceNumber: "" }),
    ).toThrow(/sequence number/i);
  });

  it("rejects missing or malformed sequence numbers", () => {
    expect(() =>
      requireSequenceAuth({
        publicKey: "GTEST",
      } as unknown as StellarAuthSequence),
    ).toThrow(/sequence number/i);

    expect(() =>
      requireSequenceAuth({
        publicKey: "GTEST",
        sequenceNumber: 123,
      } as unknown as StellarAuthSequence),
    ).toThrow(/sequence number/i);
  });

  it.each(["nonce", "challenge", "fallback"])(
    "rejects a client-supplied %s even when a sequence number is present",
    (field) => {
      expect(() =>
        requireSequenceAuth({
          publicKey: "GTEST",
          sequenceNumber: "123456",
          [field]: "client-value",
        } as unknown as StellarAuthSequence),
      ).toThrow(new RegExp(field, "i"));
    },
  );

  it("does not accept nonce fallbacks without a sequence number", () => {
    expect(() =>
      requireSequenceAuth({
        publicKey: "GTEST",
        nonce: "client-value",
      } as unknown as StellarAuthSequence),
    ).toThrow(/nonce/i);
  });
});
