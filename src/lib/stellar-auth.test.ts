import { describe, expect, it } from "vitest";
import { requireSequenceAuth } from "./stellar-auth";

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

  it("rejects client nonce fallback and extra nonce fields", () => {
    expect(() =>
      requireSequenceAuth({
        publicKey: "GTEST",
        sequenceNumber: "123456",
        nonce: "client-nonce",
      } as never),
    ).toThrow(/nonce/i);
  });

  it("ignores other extra fields and returns only required auth data", () => {
    expect(
      requireSequenceAuth({
        publicKey: "GTEST",
        sequenceNumber: "123456",
        issuedAt: "2026-01-01T00:00:00Z",
      } as never),
    ).toEqual({ publicKey: "GTEST", sequenceNumber: "123456" });
  });

  it("requires a public key and numeric sequence number", () => {
    expect(() =>
      requireSequenceAuth({ publicKey: "", sequenceNumber: "123" } as never),
    ).toThrow(/public key/i);
    expect(() =>
      requireSequenceAuth({ publicKey: "GTEST", sequenceNumber: "abc" } as never),
    ).toThrow(/sequence number/i);
  });
});
