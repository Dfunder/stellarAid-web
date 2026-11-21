import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useFormSubmission } from "./useFormSubmission";

describe("useFormSubmission", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("blocks duplicate submissions during and after a successful operation", async () => {
    vi.useFakeTimers();
    const operation = vi.fn();
    const { result } = renderHook(() => useFormSubmission(2500));

    let first = false;
    await act(async () => {
      first = await result.current.submit(operation);
      await result.current.submit(operation);
    });

    expect(first).toBe(true);
    expect(operation).toHaveBeenCalledTimes(1);
    expect(result.current.isSubmitting).toBe(true);

    act(() => vi.advanceTimersByTime(2500));
    expect(result.current.isSubmitting).toBe(false);

    let second = false;
    await act(async () => {
      second = await result.current.submit(operation);
    });
    expect(second).toBe(true);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it("clears the lock when the operation fails", async () => {
    const operation = vi.fn().mockRejectedValue(new Error("failed"));
    const { result } = renderHook(() => useFormSubmission());

    await act(async () => {
      await expect(result.current.submit(operation)).rejects.toThrow("failed");
    });
    expect(result.current.isSubmitting).toBe(false);

    let retried = false;
    const retry = vi.fn();
    await act(async () => {
      retried = await result.current.submit(retry);
    });
    expect(retried).toBe(true);
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("keeps the submit function stable across renders", () => {
    const { result, rerender } = renderHook(
      ({ cooldown }) => useFormSubmission(cooldown),
      { initialProps: { cooldown: 500 } },
    );
    const initial = result.current.submit;

    rerender({ cooldown: 1000 });

    expect(result.current.submit).toBe(initial);
  });
});
