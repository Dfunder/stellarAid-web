import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StellarAuthSequence } from "../lib/stellar-auth";
import { useWalletAuth } from "./useWalletAuth";

describe("useWalletAuth", () => {
  it("delegates only to sequence-number authentication", () => {
    const { result } = renderHook(() => useWalletAuth());

    expect(
      result.current.prepareAuthentication({
        publicKey: "GTEST",
        sequenceNumber: "42",
      }),
    ).toEqual({ publicKey: "GTEST", sequenceNumber: "42" });

    expect(() =>
      result.current.prepareAuthentication({
        publicKey: "GTEST",
      } as unknown as StellarAuthSequence),
    ).toThrow(/sequence number/i);

    expect(() =>
      result.current.prepareAuthentication({
        publicKey: "GTEST",
        sequenceNumber: "42",
        nonce: "client-value",
      } as unknown as StellarAuthSequence),
    ).toThrow(/nonce/i);
  });
});
