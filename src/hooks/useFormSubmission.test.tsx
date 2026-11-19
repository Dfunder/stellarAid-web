import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useFormSubmission } from "./useFormSubmission";

describe("useFormSubmission", () => {
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
    vi.useRealTimers();
  });
});
