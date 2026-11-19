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
});
