import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useStellarBalance } from "./useStellarBalance";

const ACCOUNT = `GB${"A".repeat(54)}`;

function mockFetch(body: unknown, ok = true): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe("useStellarBalance", () => {
  it("loads the available XLM balance for a valid account", async () => {
    const fetchFn = mockFetch([
      {
        asset_code: "XLM",
        asset_issuer: null,
        total_balance: "20",
        available_balance: "12.5",
      },
    ]);
    const { result } = renderHook(() => useStellarBalance(ACCOUNT, fetchFn));

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.availableBalance).toBe("12.5");
    expect(result.current.error).toBeNull();
    expect(fetchFn).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent(ACCOUNT)),
    );
  });

  it("rejects an invalid account without fetching", async () => {
    const fetchFn = mockFetch([]);
    const { result } = renderHook(() => useStellarBalance("", fetchFn));

    await act(async () => {
      await result.current.refresh();
    });

    expect(fetchFn).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/valid Stellar account/);
  });

  it("surfaces request failures", async () => {
    const { result } = renderHook(() =>
      useStellarBalance(ACCOUNT, mockFetch({}, false)),
    );

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.availableBalance).toBeNull();
    expect(result.current.error).toContain("500");
  });
});
